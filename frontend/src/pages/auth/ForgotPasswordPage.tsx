import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, MailCheck, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authClient } from '@/lib/auth.client';
import { AuthShell } from './components/AuthShell';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await authClient.requestPasswordReset({
                email: data.email,
                redirectTo: '/reset-password',
            });
            setIsSuccess(true);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Something went wrong',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <AuthShell
                statusIcon={<MailCheck className="w-[30px] h-[30px]" />}
                statusTone="#15803d"
                statusBg="rgb(21 128 61 / .12)"
                heading="Check your email"
                sub="If an account exists for that address, a reset link is on its way."
            >
                <div className="flex flex-col gap-[11px]">
                    <Link to="/login">
                        <Button variant="outline" className="w-full h-12 rounded-[13px] font-bold">
                            Back to login
                        </Button>
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            heading={<span className="gradient-text-indic-soft">Forgot password?</span>}
            sub="Enter your email and we'll send you a reset link."
            footer={
                <Link to="/login" className="inline-flex items-center font-bold text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[15px]">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            className={`h-12 rounded-[13px] pl-[42px] ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full h-[50px] rounded-[14px] text-[15px] font-bold mt-1.5" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send reset link'
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
