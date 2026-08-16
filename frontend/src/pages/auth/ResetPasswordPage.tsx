import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authClient } from '@/lib/auth.client';
import { AuthShell } from './components/AuthShell';
import { PasswordRules } from './components/PasswordRules';

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const pw = watch('newPassword', '');

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        setIsLoading(true);
        try {
            const { error } = await authClient.resetPassword({
                newPassword: data.newPassword,
                token,
            });

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Reset failed',
                    description: error.message || 'The reset link may have expired. Please request a new one.',
                });
            } else {
                setIsSuccess(true);
            }
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // No token or error from Better Auth redirect
    const hasError = error === 'INVALID_TOKEN' || (!token && !isSuccess);

    if (isSuccess) {
        return (
            <AuthShell
                statusIcon={<CheckCircle className="w-[30px] h-[30px]" />}
                statusTone="#15803d"
                statusBg="rgb(21 128 61 / .12)"
                heading="Password updated"
                sub="You can now sign in with your new password."
            >
                <Link to="/login">
                    <Button className="w-full h-12 rounded-[13px] font-bold">Sign in now</Button>
                </Link>
            </AuthShell>
        );
    }

    if (hasError) {
        return (
            <AuthShell
                statusIcon={<AlertTriangle className="w-[30px] h-[30px]" />}
                statusTone="#B8860B"
                statusBg="rgb(184 134 11 / .16)"
                heading="Link expired"
                sub="This reset link is invalid or has expired."
            >
                <Link to="/forgot-password">
                    <Button variant="outline" className="w-full h-12 rounded-[13px] font-bold">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Request a new link
                    </Button>
                </Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            heading={<span className="gradient-text-indic-soft">Set a new password</span>}
            sub="Choose a strong password for your account."
            footer={
                <Link to="/login" className="inline-flex items-center font-bold text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[15px]">
                <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="newPassword"
                            type={showPw ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('newPassword')}
                            className={`h-12 rounded-[13px] pl-[42px] pr-10 ${errors.newPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <PasswordRules password={pw} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            className={`h-12 rounded-[13px] pl-[42px] ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full h-[50px] rounded-[14px] text-[15px] font-bold mt-1.5" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
