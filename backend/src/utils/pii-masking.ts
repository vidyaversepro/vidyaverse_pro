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

/**
 * Masks the LOCAL part of an address and keeps the domain.
 *
 * This is the reverse of what this function used to do. It previously returned
 * `john.doe@***.com` — hiding the domain while printing the local part in full.
 * The local part is usually the person's own name, so that masked the half that
 * rarely identifies anyone and published the half that does.
 *
 * The asterisk run is a fixed width rather than padded to the original length,
 * for two reasons: padding leaks how long the address is, and these values print
 * into fixed-size fields on ID and visiting cards, where a long address would
 * overflow the box.
 *
 * A local part of one or two characters cannot be masked meaningfully — showing
 * its first two characters would show all of it — so those fall back to hiding
 * the domain, which is what this function used to do for every address.
 */
export function maskEmail(email: string | null | undefined): string {
    if (!email || !email.includes('@')) return email || '';

    // lastIndexOf, not split: a quoted local part may legally contain '@', and
    // split('@') silently drops everything after the second one.
    const at = email.lastIndexOf('@');
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    if (!local || !domain) return email;

    if (local.length > 2) return `${local.slice(0, 2)}***@${domain}`;

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
            sampleValue: 'pa***@example.com',
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
    ],
    'marksheet': [
        { key: 'student.name', label: 'Student Name', category: 'Student', handlebarsExpression: '{{student.name}}', isMasked: false, sampleValue: 'John Doe' },
        { key: 'student.admissionNumber', label: 'Admission Number', category: 'Student', handlebarsExpression: '{{student.admissionNumber}}', isMasked: false, sampleValue: 'ADM123' },
        { key: 'student.fatherName', label: "Father's Name", category: 'Student', handlebarsExpression: '{{student.fatherName}}', isMasked: false, sampleValue: 'Richard Doe' },
        { key: 'student.motherName', label: "Mother's Name", category: 'Student', handlebarsExpression: '{{student.motherName}}', isMasked: false, sampleValue: 'Jane Doe' },
        { key: 'student.dob', label: 'Date of Birth', category: 'Student', handlebarsExpression: '{{student.dob}}', isMasked: false, sampleValue: '2010-05-15' },
        { key: 'class.name', label: 'Class Name', category: 'Academic', handlebarsExpression: '{{class.name}}', isMasked: false, sampleValue: 'Class X' },
        { key: 'section.name', label: 'Section', category: 'Academic', handlebarsExpression: '{{section.name}}', isMasked: false, sampleValue: 'A' },
        { key: 'examName', label: 'Exam Name', category: 'Academic', handlebarsExpression: '{{examName}}', isMasked: false, sampleValue: 'Final Exam' },
        { key: 'academicYear', label: 'Academic Year', category: 'Academic', handlebarsExpression: '{{academicYear}}', isMasked: false, sampleValue: '2023-2024' },
        { key: 'results.totalMarks', label: 'Total Marks', category: 'Results', handlebarsExpression: '{{results.totalMarks}}', isMasked: false, sampleValue: 450 },
        { key: 'results.maxMarks', label: 'Max Marks', category: 'Results', handlebarsExpression: '{{results.maxMarks}}', isMasked: false, sampleValue: 500 },
        { key: 'results.percentage', label: 'Percentage', category: 'Results', handlebarsExpression: '{{results.percentage}}', isMasked: false, sampleValue: 90.0 },
        { key: 'results.grade', label: 'Overall Grade', category: 'Results', handlebarsExpression: '{{results.grade}}', isMasked: false, sampleValue: 'A' },
        { key: 'results.isPassed', label: 'Pass Status', category: 'Results', handlebarsExpression: '{{results.isPassed}}', isMasked: false, sampleValue: true },
        { key: 'results.marksheetNumber', label: 'Marksheet No.', category: 'Results', handlebarsExpression: '{{results.marksheetNumber}}', isMasked: false, sampleValue: 'MS20240001' },
    ],
    'hall_ticket': [
        { key: 'studentName', label: 'Student Name', category: 'Student', handlebarsExpression: '{{studentName}}', isMasked: false, sampleValue: 'John Doe' },
        { key: 'admissionNumber', label: 'Admission Number', category: 'Student', handlebarsExpression: '{{admissionNumber}}', isMasked: false, sampleValue: 'ADM123' },
        { key: 'rollNo', label: 'Roll Number', category: 'Student', handlebarsExpression: '{{rollNo}}', isMasked: false, sampleValue: '12' },
        { key: 'className', label: 'Class & Section', category: 'Academic', handlebarsExpression: '{{className}}', isMasked: false, sampleValue: 'Class X - A' },
        { key: 'examName', label: 'Exam Name', category: 'Exam', handlebarsExpression: '{{examName}}', isMasked: false, sampleValue: 'Final Exam' },
        { key: 'academicYear', label: 'Academic Year', category: 'Exam', handlebarsExpression: '{{academicYear}}', isMasked: false, sampleValue: '2023-2024' },
        { key: 'examCenter', label: 'Exam Center', category: 'Exam', handlebarsExpression: '{{examCenter}}', isMasked: false, sampleValue: 'Main Campus' },
    ],
    'library_card': [
        { key: 'studentName', label: 'Student Name', category: 'Student', handlebarsExpression: '{{studentName}}', isMasked: false, sampleValue: 'John Doe' },
        { key: 'admissionNumber', label: 'Admission Number', category: 'Student', handlebarsExpression: '{{admissionNumber}}', isMasked: false, sampleValue: 'ADM123' },
        { key: 'className', label: 'Class & Section', category: 'Student', handlebarsExpression: '{{className}}', isMasked: false, sampleValue: 'Class X - A' },
        { key: 'libraryId', label: 'Library ID', category: 'Library', handlebarsExpression: '{{libraryId}}', isMasked: false, sampleValue: 'LIB20240001' },
        { key: 'validUntil', label: 'Valid Until', category: 'Library', handlebarsExpression: '{{validUntil}}', isMasked: false, sampleValue: '31/03/2025' },
    ],
    'transfer_certificate': [
        { key: 'studentName', label: 'Student Name', category: 'Student', handlebarsExpression: '{{studentName}}', isMasked: false, sampleValue: 'John Doe' },
        { key: 'fatherName', label: "Father's Name", category: 'Student', handlebarsExpression: '{{fatherName}}', isMasked: false, sampleValue: 'Richard Doe' },
        { key: 'motherName', label: "Mother's Name", category: 'Student', handlebarsExpression: '{{motherName}}', isMasked: false, sampleValue: 'Jane Doe' },
        { key: 'dob', label: 'Date of Birth', category: 'Student', handlebarsExpression: '{{dob}}', isMasked: false, sampleValue: '15/05/2010' },
        { key: 'admissionNumber', label: 'Admission Number', category: 'Student', handlebarsExpression: '{{admissionNumber}}', isMasked: false, sampleValue: 'ADM123' },
        { key: 'admissionDate', label: 'Admission Date', category: 'Student', handlebarsExpression: '{{admissionDate}}', isMasked: false, sampleValue: '01/04/2020' },
        { key: 'leavingDate', label: 'Leaving Date', category: 'Academic', handlebarsExpression: '{{leavingDate}}', isMasked: false, sampleValue: '31/03/2024' },
        { key: 'className', label: 'Class Name', category: 'Academic', handlebarsExpression: '{{className}}', isMasked: false, sampleValue: 'Class X' },
        { key: 'lastClassStudied', label: 'Last Class Studied', category: 'Academic', handlebarsExpression: '{{lastClassStudied}}', isMasked: false, sampleValue: 'Class X - A' },
        { key: 'conduct', label: 'Conduct', category: 'Academic', handlebarsExpression: '{{conduct}}', isMasked: false, sampleValue: 'Good' },
        { key: 'reason', label: 'Reason for Leaving', category: 'Certificate', handlebarsExpression: '{{reason}}', isMasked: false, sampleValue: 'Parents Relocated' },
        { key: 'remarks', label: 'Remarks', category: 'Certificate', handlebarsExpression: '{{remarks}}', isMasked: false, sampleValue: 'Passed all exams' },
        { key: 'tcNumber', label: 'TC Number', category: 'Certificate', handlebarsExpression: '{{tcNumber}}', isMasked: false, sampleValue: 'TC20240001' },
        { key: 'place', label: 'Place of Issue', category: 'Certificate', handlebarsExpression: '{{place}}', isMasked: false, sampleValue: 'New Delhi' },
        { key: 'issueDate', label: 'Issue Date', category: 'Certificate', handlebarsExpression: '{{issueDate}}', isMasked: false, sampleValue: '01/04/2024' },
        { key: 'academicYear', label: 'Academic Year', category: 'Certificate', handlebarsExpression: '{{academicYear}}', isMasked: false, sampleValue: '2023-2024' },
        { key: 'feeClearanceStatus', label: 'Fee Clearance Status', category: 'Certificate', handlebarsExpression: '{{feeClearanceStatus}}', isMasked: false, sampleValue: 'Cleared' },
    ],
    'visiting_card': [
        { key: 'name', label: 'Name', category: 'Person', handlebarsExpression: '{{name}}', isMasked: false, sampleValue: 'John Doe' },
        { key: 'designation', label: 'Designation', category: 'Person', handlebarsExpression: '{{designation}}', isMasked: false, sampleValue: 'Principal' },
        // NOT masked, deliberately — and they never were. A visiting card exists to
        // publish its holder's contact details; masking them would defeat the
        // document. These two carried isMasked: true until 2026-08-28, but that only
        // ever described an intention: applyMasking() walks data.student.*, while the
        // visiting-card service supplies phone/email as flat top-level keys (and under
        // card.*/person.* for legacy templates), so nothing was reached. Corrected the
        // metadata rather than the behaviour, because the behaviour is right.
        //
        // This flag drives nothing on its own — it is served to the template editor
        // via GET /templates/variables, and sampleValue feeds preview-generator.ts. If
        // these ever should be masked, change applyMasking() as well; flipping the
        // flag back alone would just restore the lie.
        { key: 'phone', label: 'Phone Number', category: 'Contact', handlebarsExpression: '{{phone}}', isMasked: false, sampleValue: '+91 98765 43210' },
        { key: 'email', label: 'Email', category: 'Contact', handlebarsExpression: '{{email}}', isMasked: false, sampleValue: 'principal@vidyaverse.app' },
        { key: 'website', label: 'Website', category: 'Contact', handlebarsExpression: '{{website}}', isMasked: false, sampleValue: 'www.vidyaverse.app' },
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
