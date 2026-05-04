export interface PhotoValidationResult {
    valid: boolean;
    error?: string;
}

export async function validatePhotoFile(file: File): Promise<PhotoValidationResult> {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        return { valid: false, error: 'Only JPG, PNG and WEBP allowed' };
    }
    if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'File size must be under 5MB' };
    }
    return { valid: true };
}
