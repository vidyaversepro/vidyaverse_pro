export interface BulkCsvImportJobData {
    jobExecutionId: string;
    institutionId: string;
    sectionId: string; // Used to identify where these students are going
    fileKey: string; // MinIO object key containing the CSV file
    expectedCount: number; // For progress tracking
    initiatedBy: string; // The userId of the admin who initiated the job
}

export interface BulkPhotoZipImportJobData {
    jobExecutionId: string;
    institutionId: string;
    fileKey: string; // MinIO object key containing the ZIP file
    initiatedBy: string; // The userId of the admin who initiated the job
}
