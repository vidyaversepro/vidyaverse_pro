import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { signUp } from '@/lib/auth.client';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRules = [
    { test: (v: string) => v.length >= 8, label: '8+ characters' },
    { test: (v: string) => /[A-Z]/.test(v), label: 'Uppercase letter' },
    { test: (v: string) => /[0-9]/.test(v), label: 'Number' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const pw = watch('password', '');

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
                fetchOptions: {
                    onSuccess: () => {
                        // Signup no longer creates a session — the address must be
                        // confirmed first (requireEmailVerification on the backend).
                        // Sending them to /dashboard here would just bounce off the
                        // route guard with no explanation, so tell them to go and
                        // check their inbox instead.
                        toast({
                            title: 'Check your inbox',
                            description: `We sent a confirmation link to ${data.email}. Click it to activate your account.`,
                        });
                        navigate(`/verify-email?sent=${encodeURIComponent(data.email)}`);
                    },
                    onError: (ctx: any) => {
                        toast({
                            variant: 'destructive',
                            title: 'Registration failed',
                            description: ctx.error.message || 'Something went wrong',
                        });
                    }
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
            style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 40%, #F0F4FF 100%)' }}
        >
            {/* Decorative blobs */}
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
                    {/* Top gradient accent (DigiClassroom pattern) */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#E63946] via-[#8B5CF6] to-[#2563EB]" />

                    <CardContent className="p-8">
                        {/* Logo */}
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
                            <h1 className="text-2xl font-bold gradient-text-brand">Create Account</h1>
                            <p className="text-sm text-muted-foreground mt-1">Start your educational journey today</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    {...register('name')}
                                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        {...register('password')}
                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
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
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-red-500/20 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#E63946] hover:text-[#C41E3A] font-medium transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
