/**
 * The resolved academic-profile contract served to relying parties.
 *
 * Mirrors the shape of the capability contract (types.ts next door) on purpose: RPs
 * that already know how to cache/consume ResolvedCapabilities should find this
 * unsurprising. Vidyaverse is the source of truth for a student's Class/Section/Stream
 * (the ERP owns admissions and promotions); RPs ask, they do not decide.
 */

/** Products in the trio that may ask "what class is this student in". */
export type AppKey = 'vidyaverse' | 'pdlms' | 'digiclassroom';

export interface AcademicProfile {
    userId: string;
    institutionId: string;
    institutionName: string;
    classId: string;
    className: string;
    /** Only populated for classes with streamsEnabled (typically 11/12). */
    streamId: string | null;
    streamName: string | null;
    sectionId: string;
    sectionName: string;
    academicYear: string;
    /** When this answer was computed — lets an RP reason about staleness. */
    resolvedAt: Date;
}
