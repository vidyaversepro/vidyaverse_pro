import { useState } from 'react';
import Papa from 'papaparse';

export interface StudentCsvRow {
    name: string;
    sex: 'Male' | 'Female' | 'Other';
    dob: string;
    rollNo?: number;
    admissionNumber?: string;
    academicYear?: string;
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    guardianRelation?: string;
    guardianPhone?: string;
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
}

export type ParsedRowState = 'valid' | 'warning' | 'error';

export interface ParsedCsvRow {
    originalIndex: number; // Row number in CSV
    data: any; // Raw parsed data
    validatedData?: StudentCsvRow; // Cleaned payload matching contract
    state: ParsedRowState;
    errors: string[];
    warnings: string[];
}

export interface UploadResult {
    created: number;
    skipped: number;
    errors: Array<{ row: number; field: string; message: string }>;
}

export function useBulkUploadWizard(
    prefilledInstitutionId?: string,
    prefilledClassId?: string,
    prefilledStreamId?: string,
    prefilledSectionId?: string
) {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Step 1: Context Selection
    const [institutionId, setInstitutionId] = useState<string>(prefilledInstitutionId || '');
    const [classId, setClassId] = useState<string>(prefilledClassId || '');
    const [streamId, setStreamId] = useState<string | null>(prefilledStreamId || null);
    const [sectionId, setSectionId] = useState<string>(prefilledSectionId || '');
    const [sectionCapacity, setSectionCapacity] = useState<number>(0);
    const [sectionEnrolledCount, setSectionEnrolledCount] = useState<number>(0);

    // Job Polling
    const [isPolling, setIsPolling] = useState(false);
    const [jobProgress, setJobProgress] = useState<{
        status: string;
        progress: number;
        processedItems: number;
        successfulItems: number;
        failedItems: number;
        totalItems: number;
    } | null>(null);

    // Step 2: CSV Data
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    // Step 3: Outcomes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

    const availableSlots = Math.max(0, sectionCapacity - sectionEnrolledCount);

    // Derived states
    const validRowsCount = parsedRows.filter(r => r.state === 'valid' || r.state === 'warning').length;
    const errorRowsCount = parsedRows.filter(r => r.state === 'error').length;
    const warningRowsCount = parsedRows.filter(r => r.state === 'warning').length;
    const willOverflow = validRowsCount > availableSlots && availableSlots > 0; // if capacity tracked

    const validateDob = (d: string): string | null => {
        if (!d) return null;
        // Basic YYYY-MM-DD or DD/MM/YYYY to ISO 8601 YYYY-MM-DDT00:00:00Z
        const parts = d.split(/[-/]/);
        if (parts.length === 3) {
            // Check if DD/MM/YYYY
            if (parts[2].length === 4) {
                const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                if (!isNaN(date.getTime())) return date.toISOString();
            } else if (parts[0].length === 4) {
                const date = new Date(d);
                if (!isNaN(date.getTime())) return date.toISOString();
            }
        }
        return null;
    };

    const normalizeSex = (val?: string): 'Male' | 'Female' | 'Other' | null => {
        if (!val) return null;
        const lower = val.toLowerCase().trim();
        if (lower === 'male' || lower === 'm') return 'Male';
        if (lower === 'female' || lower === 'f') return 'Female';
        if (lower === 'other' || lower === 'o') return 'Other';
        return null;
    };

    const handleFileParse = (uploadedFile: File) => {
        setIsParsing(true);
        setFile(uploadedFile);

        Papa.parse(uploadedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const processed = results.data.map((row: any, i: number): ParsedCsvRow => {
                    const errors: string[] = [];
                    const warnings: string[] = [];
                    const validated: any = {};

                    // 1. Required: name
                    if (!row.name || !row.name.trim()) {
                        errors.push('Missing required field: name');
                    } else {
                        validated.name = row.name.trim();
                    }

                    // 2. Required: sex
                    const normalizedSex = normalizeSex(row.sex);
                    if (!normalizedSex) {
                        errors.push('Invalid or missing field: sex (must be Male, Female, or Other)');
                    } else {
                        validated.sex = normalizedSex;
                    }

                    // 3. Required: dob
                    const isoDob = validateDob(row.dob);
                    if (!isoDob) {
                        errors.push('Invalid or missing field: dob (Requires YYYY-MM-DD or DD/MM/YYYY)');
                    } else {
                        validated.dob = isoDob;
                    }

                    // Map optionals
                    if (row.rollNo) {
                        const rInfo = parseInt(row.rollNo, 10);
                        if (isNaN(rInfo)) warnings.push('rollNo is not a valid integer, will auto-assign');
                        else validated.rollNo = rInfo;
                    }
                    if (row.admissionNumber) validated.admissionNumber = row.admissionNumber.trim();
                    if (row.academicYear) validated.academicYear = row.academicYear.trim();
                    if (row.fatherName) validated.fatherName = row.fatherName.trim();
                    if (row.motherName) validated.motherName = row.motherName.trim();
                    if (row.guardianName) validated.guardianName = row.guardianName.trim();
                    if (row.guardianRelation) validated.guardianRelation = row.guardianRelation.trim();

                    if (row.contact) {
                        const cleanContact = String(row.contact).replace(/[^0-9]/g, '');
                        if (cleanContact.length !== 10) warnings.push('Contact number is not 10 digits');
                        validated.contact = cleanContact;
                    }
                    if (row.guardianPhone) validated.guardianPhone = String(row.guardianPhone).replace(/[^0-9]/g, '');
                    if (row.bloodGroup) validated.bloodGroup = row.bloodGroup.trim();

                    // Output State
                    let state: ParsedRowState = 'valid';
                    if (errors.length > 0) state = 'error';
                    else if (warnings.length > 0) state = 'warning';

                    return {
                        originalIndex: i + 1, // 1-indexed relative to data rows
                        data: row,
                        validatedData: state !== 'error' ? validated as StudentCsvRow : undefined,
                        state,
                        errors,
                        warnings
                    };
                });

                setParsedRows(processed);
                setIsParsing(false);
            },
            error: (err) => {
                console.error("CSV Parse Error", err);
                setIsParsing(false);
            }
        });
    };

    const resetWizard = () => {
        setStep(1);
        setFile(null);
        setParsedRows([]);
        setUploadResult(null);
        setIsPolling(false);
        setJobProgress(null);

        if (!prefilledInstitutionId) {
            setInstitutionId('');
            setClassId('');
            setStreamId(null);
            setSectionId('');
        } else if (!prefilledSectionId) {
            setClassId(prefilledClassId || '');
            setStreamId(prefilledStreamId || null);
            setSectionId('');
        }
    };

    return {
        step,
        setStep,

        // Context IDs
        institutionId, setInstitutionId,
        classId, setClassId,
        streamId, setStreamId,
        sectionId, setSectionId,
        setSectionCapacity,
        setSectionEnrolledCount,

        // Locks
        isInstitutionLocked: !!prefilledInstitutionId,
        isClassLocked: !!prefilledClassId,
        isStreamLocked: !!prefilledStreamId,
        isSectionLocked: !!prefilledSectionId,

        // Data & Parse
        file,
        parsedRows,
        isParsing,
        handleFileParse,

        // Validation Results
        validRowsCount,
        errorRowsCount,
        warningRowsCount,
        willOverflow,
        availableSlots,

        // Submission
        isSubmitting, setIsSubmitting,
        isPolling, setIsPolling,
        jobProgress, setJobProgress,
        uploadResult, setUploadResult,

        // Actions
        resetWizard
    };
}
