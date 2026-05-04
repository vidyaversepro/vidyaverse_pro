import QRCode from 'qrcode';

export interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate QR code as data URL (base64 PNG)
 */
export async function generateQRCodeDataURL(
    data: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const { width = 200, margin = 1, color, errorCorrectionLevel = 'M' } = options;

    return QRCode.toDataURL(data, {
        width,
        margin,
        color: {
            dark: color?.dark || '#000000',
            light: color?.light || '#ffffff',
        },
        errorCorrectionLevel,
    });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
    data: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const { margin = 1, color, errorCorrectionLevel = 'M' } = options;

    return QRCode.toString(data, {
        type: 'svg',
        margin,
        color: {
            dark: color?.dark || '#000000',
            light: color?.light || '#ffffff',
        },
        errorCorrectionLevel,
    });
}

/**
 * Generate QR code as Buffer (PNG)
 */
export async function generateQRCodeBuffer(
    data: string,
    options: QRCodeOptions = {}
): Promise<Buffer> {
    const { width = 200, margin = 1, color, errorCorrectionLevel = 'M' } = options;

    return QRCode.toBuffer(data, {
        width,
        margin,
        color: {
            dark: color?.dark || '#000000',
            light: color?.light || '#ffffff',
        },
        errorCorrectionLevel,
    });
}

/**
 * Generate student ID QR code with embedded data
 */
export async function generateStudentQRCode(studentData: {
    id: string;
    admissionNo: string;
    name: string;
    institutionCode: string;
}): Promise<string> {
    // Compact format for QR code
    const qrData = JSON.stringify({
        t: 'student',
        id: studentData.id,
        an: studentData.admissionNo,
        ic: studentData.institutionCode,
    });

    return generateQRCodeDataURL(qrData, {
        width: 150,
        errorCorrectionLevel: 'M',
    });
}

/**
 * Generate verification QR code with URL
 */
export async function generateVerificationQRCode(
    verificationUrl: string,
    options: QRCodeOptions = {}
): Promise<string> {
    return generateQRCodeDataURL(verificationUrl, {
        width: 100,
        errorCorrectionLevel: 'H', // Higher error correction for URLs
        ...options,
    });
}
