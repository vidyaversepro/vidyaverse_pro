import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { signIn, AUTH_BASE } from '@/lib/auth.client';
import { AuthShell } from './components/AuthShell';

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
    const [showPw, setShowPw] = useState(false);
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
        <AuthShell
            heading={
                <span className="gradient-text-indic-soft">
                    {isFederated ? 'Sign in to continue' : 'Welcome back'}
                </span>
            }
            sub={
                isFederated
                    ? 'An application is requesting access to your Vidyaverse account.'
                    : 'Sign in to your Vidyaverse account.'
            }
            footer={
                <>
                    New to Vidyaverse?{' '}
                    <Link to="/register" className="text-primary font-bold">
                        Create an account
                    </Link>
                </>
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
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-xs font-bold text-primary">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPw ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            className={`h-12 rounded-[13px] pl-[42px] pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full h-[50px] rounded-[14px] text-[15px] font-bold mt-1.5" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
