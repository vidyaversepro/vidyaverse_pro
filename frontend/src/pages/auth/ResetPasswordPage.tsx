import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { authClient } from '@/lib/auth.client';

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

const passwordRules = [
    { test: (v: string) => v.length >= 8, label: '8+ characters' },
    { test: (v: string) => /[A-Z]/.test(v), label: 'Uppercase letter' },
    { test: (v: string) => /[0-9]/.test(v), label: 'Number' },
];

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

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
            style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 40%, #F0F4FF 100%)' }}
        >
            <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.12]"
                style={{ background: 'radial-gradient(circle, #E63946, transparent 70%)' }}
            />
            <div className="absolute bottom-[-100px] left-[-60px] w-[350px] h-[350px] rounded-full opacity-[0.08]"
                style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border border-white/60 shadow-2xl shadow-red-200/30 dark:shadow-red-900/10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 dark:border-gray-700/50 rounded-2xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-[#E63946] via-[#8B5CF6] to-[#2563EB]" />

                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                            >
                                <img
                                    src="/vidyaverse-logo.png"
                                    alt="Vidyaverse Pro"
                                    className="h-10 mx-auto mb-4"
                                />
                            </motion.div>
                            <h1 className="text-2xl font-bold gradient-text-brand">
                                {isSuccess ? 'Password Reset!' : hasError ? 'Invalid Link' : 'Set New Password'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isSuccess
                                    ? 'Your password has been successfully updated'
                                    : hasError
                                        ? 'This reset link is invalid or has expired'
                                        : 'Choose a strong new password for your account'}
                            </p>
                        </div>

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-5"
                            >
                                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    You can now sign in with your new password.
                                </p>
                                <Link to="/login">
                                    <Button className="w-full bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-red-500/20 transition-all">
                                        Sign in now
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : hasError ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-5"
                            >
                                <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Please request a new password reset link.
                                </p>
                                <Link to="/forgot-password">
                                    <Button variant="outline" className="w-full mt-2 rounded-xl h-11">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Request new link
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="newPassword"
                                                type={showPw ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...register('newPassword')}
                                                className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {/* Password strength indicators */}
                                        {pw.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {passwordRules.map((rule) => (
                                                    <span
                                                        key={rule.label}
                                                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-colors ${rule.test(pw)
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {rule.test(pw) && <Check size={10} />}
                                                        {rule.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                {...register('confirmPassword')}
                                                className={`pl-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-red-500/20 transition-all mt-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                </form>
                                <div className="mt-6 text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center text-sm text-[#E63946] hover:text-[#C41E3A] font-medium transition-colors"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
