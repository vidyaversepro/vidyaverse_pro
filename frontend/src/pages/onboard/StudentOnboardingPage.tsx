import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StudentTabForm } from '@/components/students/StudentTabForm';
import { Loader2 } from 'lucide-react';
import { Pill, TONE } from '@/components/shared/Pill';

export default function StudentOnboardingPage() {
    const { token } = useParams<{ token: string }>();

    // Fetch draft to guarantee the token is valid before showing the form
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['student-draft', token],
        queryFn: async () => {
            const res = await api.get(`/onboard/${token}`);
            return res.data;
        },
        retry: 0 // don't retry if invalid token
    });

    const student = responseData?.data || responseData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (isError || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center p-6 sm:p-8 bg-card shadow-sm rounded-2xl border max-w-sm w-full" style={{ borderColor: `${TONE.red}55` }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: TONE.red }}>Invalid Link</h2>
                    <p className="text-muted-foreground">This self-service onboarding link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Minimal Header */}
            <div className="w-full bg-card shadow-sm border-b px-4 sm:px-6 py-4 flex items-center justify-between mb-6 sm:mb-8" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
                <div className="flex items-center gap-3 min-w-0">
                    {student.institution?.logoUrl ? (
                        <img src={student.institution.logoUrl} alt="Institution Logo" className="h-8 w-auto" />
                    ) : (
                        <div className="bg-primary text-primary-foreground font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                            {student.institution?.name?.[0] || 'V'}
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-base sm:text-lg leading-tight truncate">{student.institution?.name || 'Institution'}</h1>
                        <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">STUDENT ONBOARDING PORTAL</p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-4xl px-4 sm:px-6 pb-12">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                    <div>
                        <h2 className="arch-section-header text-2xl inline-block">Welcome, {student.name}!</h2>
                        <p className="text-muted-foreground mt-1">Please complete your admission details below.</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Status</span>
                        <Pill label="Draft Mode" tone={TONE.indigo} />
                    </div>
                </div>

                <StudentTabForm
                    studentId={student.id}
                    institutionId={student.institutionId}
                    mode="selfservice"
                    token={token}
                />
            </div>
        </div>
    );
}
