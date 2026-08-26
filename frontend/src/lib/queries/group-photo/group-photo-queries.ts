import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

/**
 * Every request in this file used to 404.
 *
 * The backend mounts this module at `/api/v1/group-photos` (plural, see
 * `backend/src/index.ts`), and this file asked for `/group-photo` (singular), so
 * the prefix alone was enough to break all seven calls. Underneath that, four of
 * them also named paths the backend has never exposed — the file was written
 * against an imagined API rather than the real one. The real surface is:
 *
 *   POST   /group-photos                       multipart upload
 *   GET    /group-photos                       list (+ pagination)
 *   GET    /group-photos/:id                   one photo, WITH its extractions
 *   DELETE /group-photos/:id
 *   POST   /group-photos/:id/extract-faces     queues a job, 202
 *   POST   /group-photos/:id/match-students
 *   PATCH  /group-photos/extractions/:id       manual match / reject
 *   GET    /group-photos/:id/stats
 *
 * There is no per-photo `/faces` collection and no PATCH on a photo, so
 * `useGroupPhotoFaces` now adapts `GET /:id` and `useUpdateGroupPhoto` is gone.
 */

export interface GroupPhoto {
    id: string;
    name: string;
    eventName?: string;
    thumbnailUrl?: string;
    photoUrl: string;
    status: string;
    totalStudentsDetected: number;
    createdAt: string;
    class?: { name: string };
    section?: { name: string };
    _count?: { extractions: number };
}

export interface GroupPhotoFilters {
    page?: number;
    limit?: number;
    search?: string;
    institutionId?: string;
    status?: string;
}

export interface Face {
    id: string;
    groupPhotoId: string;
    studentId?: string;
    student?: { name: string; admissionNo: string };
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    imageUrl?: string;
    isMatched: boolean;
}

export const useGroupPhotos = (filters: GroupPhotoFilters) => {
    return useQuery({
        queryKey: ['group-photos', filters],
        queryFn: async () => {
            const response = await api.get<{ data: GroupPhoto[]; pagination: any }>('/group-photos', {
                params: filters,
            });
            return response.data;
        },
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Upload a group photo.
 *
 * The route reads `request.file()` and pulls its metadata from the multipart
 * FIELDS, validated by `uploadGroupPhotoSchema` (name required; eventName,
 * eventDate, classId, sectionId, description optional). The previous version
 * posted JSON with a `photoUrl` of `URL.createObjectURL(file)` — a `blob:` URL
 * that only means anything inside the tab that made it — plus a hard-coded
 * `institutionId: 'inst-123'`. The tenant is resolved server-side from the
 * `x-institution-id` header the api interceptor already attaches, so the client
 * must not send one.
 *
 * `Content-Type` is set to undefined deliberately: the shared axios instance
 * defaults it to `application/json`, and multipart needs the browser to write
 * the header itself so it carries the boundary.
 */
export const useCreateGroupPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { file: File; name: string; eventName?: string; eventDate?: string; classId?: string; sectionId?: string; description?: string }) => {
            const form = new FormData();
            form.append('file', input.file);
            form.append('name', input.name);
            for (const key of ['eventName', 'eventDate', 'classId', 'sectionId', 'description'] as const) {
                const value = input[key];
                if (value) form.append(key, value);
            }
            return api.post('/group-photos', form, {
                headers: { 'Content-Type': undefined },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

/* `useUpdateGroupPhoto` was removed rather than repointed: it PATCHed
   `/group-photo/:id`, and the backend exposes no update route for a photo at
   all, so there was nothing to point it at. It had zero callers. */

export const useDeleteGroupPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/group-photos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

/** One row of `group_photo_extractions`, as the API actually returns it. */
interface GroupPhotoExtractionDTO {
    id: string;
    groupPhotoId: string;
    studentId: string | null;
    boundingBox: { x?: number; y?: number; width?: number; height?: number } | null;
    confidenceScore: string | number | null;
    isRejected: boolean;
    individualPhotoUrl: string | null;
    student?: { id: string; admissionNumber: string; name: string; photoUrl: string | null } | null;
}

/**
 * Faces for one photo.
 *
 * There is no `/faces` collection — extractions come back nested on
 * `GET /group-photos/:id`, under different field names from the `Face` shape
 * this UI was written against, so they are adapted here rather than at every
 * call site. `confidenceScore` is a Prisma `Decimal` and therefore arrives as a
 * STRING over JSON, not a number.
 *
 * `boundingBox` is a free-form Json column and **nothing writes it yet** (face
 * extraction is an unimplemented worker stub — see `backend/src/workers`), so
 * the coordinate reads are defensive. `FaceMappingModal` positions overlays as
 * `x * 100%`, i.e. it expects fractions of the image, which is the convention
 * an implementation should write.
 */
export const useGroupPhotoFaces = (photoId: string) => {
    return useQuery({
        queryKey: ['group-photo-faces', photoId],
        queryFn: async () => {
            const response = await api.get<{ data: { extractions?: GroupPhotoExtractionDTO[] } }>(
                `/group-photos/${photoId}`
            );
            const extractions = response.data.data?.extractions ?? [];
            return extractions.map((e): Face => ({
                id: e.id,
                groupPhotoId: e.groupPhotoId,
                studentId: e.studentId ?? undefined,
                student: e.student ? { name: e.student.name, admissionNo: e.student.admissionNumber } : undefined,
                x: e.boundingBox?.x ?? 0,
                y: e.boundingBox?.y ?? 0,
                width: e.boundingBox?.width ?? 0,
                height: e.boundingBox?.height ?? 0,
                confidence: Number(e.confidenceScore ?? 0),
                imageUrl: e.individualPhotoUrl ?? undefined,
                isMatched: Boolean(e.studentId) && !e.isRejected,
            }));
        },
        enabled: !!photoId,
    });
};

/** Manual match. The extraction is addressed directly, not scoped under its photo. */
export const useUpdateFaceMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
            return api.patch(`/group-photos/extractions/${id}`, { studentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photo-faces'] });
            // The photo's matched count is derived from its extractions, so the
            // list is stale too.
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

/**
 * Queues face extraction. Returns 202 with a job id — it does NOT complete
 * inline, so callers must not report success as "faces extracted".
 *
 * The options mirror `extractFacesSchema`'s defaults. They are sent explicitly
 * because the route hands `request.body` straight to the job without parsing
 * the schema, so the schema's defaults are never applied server-side.
 */
export const useExtractFaces = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.post(`/group-photos/${id}/extract-faces`, {
                minFaceSize: 50,
                confidenceThreshold: 0.8,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};
