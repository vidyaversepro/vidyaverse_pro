import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useValidateInvitation, useAcceptInvitation } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, User, Phone } from 'lucide-react';
import { AuthShell } from './components/AuthShell';
import { PasswordRules } from './components/PasswordRules';

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
        watch,
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

    const pw = watch('password', '');

    // If no token in URL
    if (!token) {
        return (
            <AuthShell
                statusIcon={<AlertCircle className="w-[30px] h-[30px]" />}
                statusTone="#B8860B"
                statusBg="rgb(184 134 11 / .16)"
                heading="Invalid link"
                sub="No setup token was provided in the URL. Please check your invitation email again."
            >
                <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-[13px] font-bold">
                    Return to login
                </Button>
            </AuthShell>
        );
    }

    // If token validation is loading
    if (isValidating) {
        return (
            <AuthShell heading="Verifying your invitation..." sub=" ">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthShell>
        );
    }

    // If token is invalid / expired
    if (isValidationError || !validationData) {
        return (
            <AuthShell
                statusIcon={<AlertCircle className="w-[30px] h-[30px]" />}
                statusTone="#B8860B"
                statusBg="rgb(184 134 11 / .16)"
                heading="Link expired or invalid"
                sub={(validationError as { response?: { data?: { message?: string } } })?.response?.data?.message
                    || 'This invitation link has either expired or already been used. Please request a new invitation from your administrator.'}
            >
                <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-[13px] font-bold">
                    Return to login
                </Button>
            </AuthShell>
        );
    }

    // Success state after submission
    if (setupSuccess) {
        return (
            <AuthShell
                statusIcon={<CheckCircle2 className="w-[30px] h-[30px]" />}
                statusTone="#15803d"
                statusBg="rgb(21 128 61 / .12)"
                heading="All set!"
                sub={<>Your administrator account for <strong className="text-foreground">{validationData.institutionName}</strong> has been successfully created.</>}
            >
                <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-[13px] font-bold">
                    Log in to dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </AuthShell>
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
        }
    };

    return (
        <AuthShell
            heading={<span className="gradient-text-indic-soft">Set up your account</span>}
            sub="Complete your admin profile to get started."
            infoCard={
                <div className="bg-muted/50 border border-border/60 rounded-[14px] px-4 py-3.5 flex flex-col gap-3">
                    <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Institution</div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mt-1">
                            <Building2 className="w-4 h-4 text-primary" />
                            {validationData.institutionName}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Admin email</div>
                        <div className="text-sm font-semibold text-foreground mt-1">{validationData.email}</div>
                    </div>
                </div>
            }
            footer={
                <Link to="/login" className="font-bold text-primary">Back to login</Link>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[15px]">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="name"
                            placeholder="Ananya Sharma"
                            {...register('name')}
                            className={`h-12 rounded-[13px] pl-[42px] ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                    </div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone number <span className="text-muted-foreground font-normal">· optional</span></Label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            {...register('phone')}
                            className="h-12 rounded-[13px] pl-[42px]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Create password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            className={`h-12 rounded-[13px] pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <PasswordRules password={pw} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className={`h-12 rounded-[13px] ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                {acceptMutation.isError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {((acceptMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'An error occurred during setup. Please try again.'}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-[50px] rounded-[14px] text-[15px] font-bold mt-1.5"
                    disabled={isSubmitting || acceptMutation.isPending}
                >
                    {isSubmitting || acceptMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up account...
                        </>
                    ) : (
                        'Complete setup'
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
