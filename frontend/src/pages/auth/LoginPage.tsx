import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { signIn, AUTH_BASE } from '@/lib/auth.client';

// Schema for Login
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    // OIDC federated flow: Better Auth redirects here with the full authorize query
    // (client_id, response_type, redirect_uri, scope, state, code_challenge…). After
    // sign-in we must loop the browser back to the authorize endpoint to resume.
    const isOidcFlow = searchParams.has('client_id') && searchParams.has('response_type');
    const isFederated = isOidcFlow || searchParams.get('federated') === '1';
    const returnTo = searchParams.get('return_to') || searchParams.get('redirect');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await signIn.email({
                email: data.email,
                password: data.password,
                fetchOptions: {
                    onSuccess: () => {

                        toast({
                            title: 'Welcome back!',
                            description: `Logged in successfully`,
                        });
                        if (isOidcFlow) {
                            // Resume the OIDC flow: re-hit authorize (now authenticated)
                            // with the original query → Better Auth proceeds to consent.
                            window.location.href = `${AUTH_BASE}/api/auth/oauth2/authorize?${searchParams.toString()}`;
                        } else if (returnTo) {
                            window.location.href = returnTo;
                        } else {
                            navigate('/student/feed');
                        }
                    },
                    onError: (ctx: any) => {
                        toast({
                            variant: 'destructive',
                            title: 'Login failed',
                            description: ctx.error.message || 'Invalid credentials',
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
                                {isFederated ? 'Sign in to continue' : 'Welcome Back'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isFederated
                                    ? 'An application is requesting access to your Vidyaverse account'
                                    : 'Sign in to your account'}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        {...register('email')}
                                        className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-[#E63946] hover:text-[#C41E3A] font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        {...register('password')}
                                        className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-red-500/20 transition-all mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    {/* Register link */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-[#E63946] hover:text-[#C41E3A] font-semibold transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

