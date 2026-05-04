export interface TemplateVariable {
    key: string;
    label: string;
    category: string;
    handlebarsExpression: string;
    isMasked: boolean;
    maskFn?: (value: any) => any;
    sampleValue: any;
}

export function maskAadhaar(aadhar: string | null | undefined): string {
    if (!aadhar) return '';
    const clean = aadhar.replace(/\s+/g, '');
    if (clean.length < 4) return clean;
    return 'XXXX XXXX ' + clean.slice(-4);
}

export function defaultPhotoUrl(photoUrl: string | null | undefined): string {
    return photoUrl || '/placeholder-photo.png';
}

export function maskPhone(phone: string | null | undefined): string {
    if (!phone) return '';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return '*'.repeat(clean.length - 4) + clean.slice(-4);
}

export function maskEmail(email: string | null | undefined): string {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? domainParts.pop() : '';
    return `${local}@***${tld ? '.' + tld : ''}`;
}

export const TEMPLATE_VARIABLE_REGISTRY: Record<string, TemplateVariable[]> = {
    'id_card': [
        {
            key: 'student.name',
            label: 'Student Name',
            category: 'Student Details',
            handlebarsExpression: '{{student.name}}',
            isMasked: false,
            sampleValue: 'John Doe',
        },
        {
            key: 'student.fullName',
            label: 'Student Full Name',
            category: 'Student Details',
            handlebarsExpression: '{{student.fullName}}',
            isMasked: false,
            sampleValue: 'John Doe',
        },
        {
            key: 'student.admissionNo',
            label: 'Admission Number',
            category: 'Student Details',
            handlebarsExpression: '{{student.admissionNo}}',
            isMasked: false,
            sampleValue: 'ADM2025001',
        },
        {
            key: 'student.fatherName',
            label: "Father's Name",
            category: 'Student Details',
            handlebarsExpression: '{{student.fatherName}}',
            isMasked: false,
            sampleValue: 'Richard Doe',
        },
        {
            key: 'student.motherName',
            label: "Mother's Name",
            category: 'Student Details',
            handlebarsExpression: '{{student.motherName}}',
            isMasked: false,
            sampleValue: 'Jane Doe',
        },
        {
            key: 'student.dateOfBirth',
            label: 'Date of Birth',
            category: 'Student Details',
            handlebarsExpression: '{{student.dateOfBirth}}',
            isMasked: false,
            sampleValue: '2010-05-15',
        },
        {
            key: 'student.gender',
            label: 'Gender',
            category: 'Student Details',
            handlebarsExpression: '{{student.gender}}',
            isMasked: false,
            sampleValue: 'Male',
        },
        {
            key: 'student.bloodGroup',
            label: 'Blood Group',
            category: 'Student Details',
            handlebarsExpression: '{{student.bloodGroup}}',
            isMasked: false,
            sampleValue: 'O+',
        },
        {
            key: 'student.phone',
            label: 'Phone Number',
            category: 'Contact Details',
            handlebarsExpression: '{{student.phone}}',
            isMasked: true,
            maskFn: maskPhone,
            sampleValue: '******3210',
        },
        {
            key: 'student.email',
            label: 'Email',
            category: 'Contact Details',
            handlebarsExpression: '{{student.email}}',
            isMasked: true,
            maskFn: maskEmail,
            sampleValue: 'parent@***.com',
        },
        {
            key: 'student.address',
            label: 'Address',
            category: 'Contact Details',
            handlebarsExpression: '{{student.address}}',
            isMasked: false,
            sampleValue: '123 School Lane, City',
        },
        {
            key: 'student.aadharNumber',
            label: 'Aadhaar Number',
            category: 'Student Details',
            handlebarsExpression: '{{student.aadharNumber}}',
            isMasked: true,
            maskFn: maskAadhaar,
            sampleValue: 'XXXX XXXX 1234',
        },
        {
            key: 'student.photoUrl',
            label: 'Photo URL',
            category: 'Media',
            handlebarsExpression: '{{student.photoUrl}}',
            isMasked: true,
            maskFn: defaultPhotoUrl,
            sampleValue: '/placeholder-photo.png',
        },
        {
            key: 'class.name',
            label: 'Class Name',
            category: 'Academic Details',
            handlebarsExpression: '{{class.name}}',
            isMasked: false,
            sampleValue: 'Class X',
        },
        {
            key: 'class.section',
            label: 'Section',
            category: 'Academic Details',
            handlebarsExpression: '{{class.section}}',
            isMasked: false,
            sampleValue: 'A',
        },
        {
            key: 'stream.name',
            label: 'Stream Name',
            category: 'Academic Details',
            handlebarsExpression: '{{stream.name}}',
            isMasked: false,
            sampleValue: 'Science',
        },
        {
            key: 'institution.name',
            label: 'Institution Name',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.name}}',
            isMasked: false,
            sampleValue: 'Vidyaverse Public School',
        },
        {
            key: 'institution.code',
            label: 'Institution Code',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.code}}',
            isMasked: false,
            sampleValue: 'VVPS',
        },
        {
            key: 'institution.logo',
            label: 'Institution Logo',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.logo}}',
            isMasked: false,
            sampleValue: '/logo.png',
        },
        {
            key: 'institution.address',
            label: 'Institution Address',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.address}}',
            isMasked: false,
            sampleValue: 'Main Campus, Tech City',
        },
        {
            key: 'institution.phone',
            label: 'Institution Phone',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.phone}}',
            isMasked: false,
            sampleValue: '011-2345678',
        },
        {
            key: 'institution.email',
            label: 'Institution Email',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.email}}',
            isMasked: false,
            sampleValue: 'info@vvps.edu',
        },
        {
            key: 'academicYear',
            label: 'Academic Year',
            category: 'Academic Details',
            handlebarsExpression: '{{academicYear}}',
            isMasked: false,
            sampleValue: '2025-2026',
        },
        {
            key: 'issueDate',
            label: 'Issue Date',
            category: 'Card Details',
            handlebarsExpression: '{{issueDate}}',
            isMasked: false,
            sampleValue: '2025-04-01',
        },
        {
            key: 'validUntil',
            label: 'Valid Until',
            category: 'Card Details',
            handlebarsExpression: '{{validUntil}}',
            isMasked: false,
            sampleValue: '2026-03-31',
        },
        {
            key: 'qrCode',
            label: 'QR Code Data',
            category: 'Media',
            handlebarsExpression: '{{qrCode}}',
            isMasked: false,
            sampleValue: 'data:image/png;base64,...',
        }
    ]
};

export function applyMasking(data: Record<string, any>): Record<string, any> {
    const masked = JSON.parse(JSON.stringify(data)); // Deep copy to avoid mutating original

    if (masked.student) {
        if ('aadharNumber' in masked.student) {
            masked.student.aadharNumber = maskAadhaar(masked.student.aadharNumber);
        }
        if ('phone' in masked.student) {
            masked.student.phone = maskPhone(masked.student.phone);
        }
        if ('email' in masked.student) {
            masked.student.email = maskEmail(masked.student.email);
        }
        if ('photoUrl' in masked.student) {
            masked.student.photoUrl = defaultPhotoUrl(masked.student.photoUrl);
        }
    }

    return masked;
}
