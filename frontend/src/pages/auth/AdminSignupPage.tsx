import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useValidateInvitation, useAcceptInvitation } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const setupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function AdminSignupPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [setupSuccess, setSetupSuccess] = useState(false);

    // 1. Validate Token on Mount
    const { data: validationData, isLoading: isValidating, isError: isValidationError, error: validationError } = useValidateInvitation(token || '');

    // 2. Acceptance Mutation
    const acceptMutation = useAcceptInvitation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            name: '',
            phone: '',
            password: '',
            confirmPassword: '',
        }
    });

    // If no token in URL
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Link</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        No setup token was provided in the URL. Please check your invitation email again.
                    </p>
                    <Button onClick={() => navigate('/login')} className="mt-4">
                        Return to Login
                    </Button>
                </div>
            </div>
        );
    }

    // If token validation is loading
    if (isValidating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4 space-y-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Verifying your invitation...</p>
            </div>
        );
    }

    // If token is invalid / expired
    if (isValidationError || !validationData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Link Expired or Invalid</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {(validationError as {response?: {data?: {message?: string}}})?.response?.data?.message || "This invitation link has either expired or already been used. Please request a new invitation from your administrator."}
                    </p>
                    <div className="pt-6">
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Return to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state after submission
    if (setupSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4">
                <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">All Set!</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Your administrator account for <strong>{validationData.institutionName}</strong> has been successfully created.
                    </p>
                    <div className="pt-6">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full bg-brand-600 hover:bg-brand-700"
                        >
                            Log In to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: SetupFormValues) => {
        try {
            await acceptMutation.mutateAsync({
                token,
                name: data.name,
                password: data.password,
                phone: data.phone,
            });
            setSetupSuccess(true);
        } catch (error) {
            console.error("Setup failed:", error);
            // Error handling can be enhanced with toast
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4 font-sans">
            <div className="w-full max-w-lg">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-brand-500/20">
                            <span className="text-white font-bold text-2xl -rotate-3">V</span>
                        </div>
                        <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Vidyaverse Pro</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Set up your account</h1>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Complete your admin profile for <strong className="text-gray-900 dark:text-white">{validationData.institutionName}</strong>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institution</Label>
                                <div className="flex items-center text-sm font-medium mt-1 dark:text-gray-200">
                                    <Building2 className="w-4 h-4 mr-2 text-brand-600" />
                                    {validationData.institutionName}
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Email</Label>
                                <div className="text-sm font-medium mt-1 dark:text-gray-200">
                                    {validationData.email}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                {...register('name')}
                                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></Label>
                            <Input
                                id="phone"
                                placeholder="+1 (555) 000-0000"
                                {...register('phone')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Create Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {acceptMutation.isError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {((acceptMutation.error as {response?: {data?: {message?: string}}})?.response?.data?.message) || 'An error occurred during setup. Please try again.'}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                            disabled={isSubmitting || acceptMutation.isPending}
                        >
                            {isSubmitting || acceptMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Setting up account...
                                </>
                            ) : (
                                'Complete Setup'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
