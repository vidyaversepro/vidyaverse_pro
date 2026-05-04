import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StudentTabForm } from '@/components/students/StudentTabForm';
import { Loader2 } from 'lucide-react';

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
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (isError || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-red-200 dark:border-red-900/30 max-w-sm">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 dark:text-gray-300">This self-service onboarding link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center">
            {/* Minimal Header */}
            <div className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {student.institution?.logoUrl ? (
                        <img src={student.institution.logoUrl} alt="Institution Logo" className="h-8 w-auto" />
                    ) : (
                        <div className="bg-primary text-white font-bold w-10 h-10 rounded-lg flex items-center justify-center">
                            {student.institution?.name?.[0] || 'V'}
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{student.institution?.name || 'Institution'}</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">STUDENT ONBOARDING PORTAL</p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-4xl px-4 pb-12">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome, {student.name}!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Please complete your admission details below.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            Draft Mode
                        </span>
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
