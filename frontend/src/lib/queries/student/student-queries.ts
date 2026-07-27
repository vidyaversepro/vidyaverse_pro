import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { PaginatedResponse } from '../shared/types';

export type DataStatus = 'pending' | 'filled' | 'enhanced' | 'submitted' | 'approved' | 'rejected';
export type StudentStatus = 'pending' | 'active' | 'graduated' | 'transferred' | 'withdrawn' | 'suspended';

export interface Student {
    id: string;
    institutionId: string;
    sectionId: string | null;
    slotId: string | null;
    userId?: string | null;
    admissionNumber: string | null;
    rollNo: number | null;
    name: string;
    academicYear: string;
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    guardianRelation?: string;
    guardianPhone?: string;
    sex?: string;
    dob?: string;
    bloodGroup?: string;
    aadharNumber?: string;
    caste?: string;
    religion?: string;
    contact?: string;
    parentEmail?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfAdmission?: string;
    previousSchool?: string;
    transportMode?: string;
    medicalNotes?: string;
    photoUrl?: string;
    status: StudentStatus;
    dataStatus: DataStatus;
    institution?: { id: string; name: string };
    section?: {
        id: string;
        name: string;
        stream?: { id: string; name: string } | null;
        class: { id: string; name: string };
    };
    admissionSlot?: { rollNo: number; status: string } | null;
    branch?: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
}

export const useStudents = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['students', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Student>>('/student', { params });
            return response.data;
        },
    });
};

export interface AdmissionSlot {
    id: string;
    sectionId: string;
    rollNo: number;
    status: 'EMPTY' | 'INVITED' | 'FILLED';
    token?: string;
    tokenExpiresAt?: string | null;
    student?: {
        id: string;
        name: string;
        admissionNumber?: string;
        dataStatus: DataStatus;
        status: StudentStatus;
    };
    createdAt: string;
    updatedAt: string;
}

export const useAdmissionSlots = (sectionId?: string) => {
    return useQuery({
        queryKey: ['admission-slots', sectionId],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: AdmissionSlot[] }>(`/student/sections/${sectionId}/slots`);
            return response.data.data;
        },
        enabled: !!sectionId,
    });
};

export const useStudent = (id: string) => {
    return useQuery({
        queryKey: ['students', id],
        queryFn: async () => {
            const response = await api.get(`/student/${id}`);
            return response.data.data as Student;
        },
        enabled: !!id,
    });
};

export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Student>) => {
            const response = await api.post('/student', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};

export const useCreateBulkStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any[]) => {
            const response = await api.post('/student/bulk', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};

export const useApprovalQueue = (params: { institutionId?: string; sectionId?: string; productId: string }) => {
    return useQuery({
        queryKey: ['approval-queue', params],
        queryFn: async () => {
            const response = await api.get('/student/approval-queue', { params });
            return response.data.data;
        },
        enabled: !!params.productId,
    });
};

export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
            const response = await api.patch(`/student/${id}`, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['students', id] });
        },
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/student/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};

export const useBulkDeleteStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await api.post('/student/bulk-delete', { ids });
            return response.data as { success: boolean; count: number };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};

export const useUpdateStudentDataStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, dataStatus }: { id: string; dataStatus: DataStatus }) => {
            const response = await api.patch(`/student/${id}/data-status`, { dataStatus });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};

export const useStudentCountsBySection = (institutionId?: string) => {
    return useQuery({
        queryKey: ['student-counts-by-section', institutionId],
        queryFn: async () => {
            const response = await api.get('/student/counts-by-section', { params: { institutionId } });
            return response.data.data as { sectionId: string; count: number }[];
        },
        enabled: !!institutionId,
    });
};

export const useGenerateSectionForms = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sectionId, institutionId }: { sectionId: string; institutionId: string }) => {
            const response = await api.post(`/student/sections/${sectionId}/generate-forms`, { institutionId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student-counts-by-section'] });
        },
    });
};

export const useBulkUploadCsv = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { sectionId: string; rows: any[] }) => {
            const response = await api.post('/student/bulk-csv', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student-counts-by-section'] });
        },
    });
};

export const useBulkRequestPhotos = () => {
    return useMutation({
        mutationFn: async (studentIds: string[]) => {
            const response = await api.post('/student/bulk-request-photos', { studentIds });
            return response.data;
        },
    });
};

// ---------------------------------------------------------------------------
// Self-service — authenticated student's own profile
// ---------------------------------------------------------------------------

export interface MyStudentProfile {
  id: string;
  name: string;
  admissionNumber: string;
  rollNumber?: string | null;
  section: {
    id: string;
    name: string;
    class: { id: string; name: string };
  };
  institution: {
    id: string;
    name: string;
    code: string;
  };
}

export const useMyStudentProfile = () =>
  useQuery({
    queryKey: ['my-student-profile'],
    queryFn: async () => {
      const { data } = await api.get<{ data: MyStudentProfile }>('/auth/me/student');
      return data.data;
    },
    retry: false, // 404 = not linked; don't retry hammering the backend
    staleTime: 10 * 60 * 1000,
  });

export const useMyAttendanceSummary = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['my-attendance', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/attendance', { params: { startDate, endDate } });
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyTodayTimetable = () => {
  return useQuery({
    queryKey: ['my-timetable-today'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/timetable/today');
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyNotices = (limit = 5) => {
  return useQuery({
    queryKey: ['my-notices', limit],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/notices', { params: { limit } });
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyTransport = () => {
  return useQuery({
    queryKey: ['my-transport'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/transport');
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyHostel = () => {
  return useQuery({
    queryKey: ['my-hostel'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/hostel');
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyDocuments = () => {
  return useQuery({
    queryKey: ['my-documents'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me/documents');
      return data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchUsers = (query: string, institutionId?: string) =>
    useQuery({
        queryKey: ['user-search', query, institutionId],
        queryFn: () =>
            api.get('/users', { params: { search: query, institutionId } })
                .then((r) => r.data.data as { id: string; name: string; email: string }[]),
        enabled: !!institutionId && query.length >= 2,
        staleTime: 10_000,
    });

export const useLinkStudentUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ studentId, userId }: { studentId: string; userId: string | null }) =>
            api.patch(`/students/${studentId}/link-user`, { userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};
