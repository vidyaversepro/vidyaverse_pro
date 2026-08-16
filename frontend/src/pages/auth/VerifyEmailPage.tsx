import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, MailCheck, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { authClient, useSession } from '@/lib/auth.client';
import { AuthShell } from './components/AuthShell';

/**
 * Landing page for the email-confirmation step.
 *
 * Three states, distinguished by URL params and session:
 *   1. `?sent=<email>`  — just registered, waiting on the inbox (offers a resend)
 *   2. `?error=<code>`  — the link was expired or already used (offers a resend)
 *   3. a live session    — verification succeeded; autoSignInAfterVerification on
 *                          the backend means they arrive here already signed in
 *
 * Better Auth redirects here as the `callbackURL` of the verify link, so this is
 * the first page a new user sees after clicking through from their email.
 */
export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const { data: session, isPending } = useSession();
    const { toast } = useToast();
    const [resending, setResending] = useState(false);

    const sentTo = searchParams.get('sent') || '';
    const error = searchParams.get('error');

    async function resend() {
        if (!sentTo) return;
        setResending(true);
        try {
            await authClient.sendVerificationEmail({
                email: sentTo,
                callbackURL: `${window.location.origin}/verify-email`,
            });
            toast({
                title: 'Confirmation link sent',
                description: `We sent another link to ${sentTo}.`,
            });
        } catch {
            toast({
                variant: 'destructive',
                title: "Couldn't send the link",
                description: 'Please try again in a moment.',
            });
        } finally {
            setResending(false);
        }
    }

    if (isPending) {
        return (
            <AuthShell heading="Check your inbox" sub=" ">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </AuthShell>
        );
    }

    // Verified — autoSignInAfterVerification already established the session.
    if (session && !error) {
        // Mirrors PublicRoute's landing logic; there is no bare /dashboard route.
        const role = (session.user as { globalRole?: string })?.globalRole;
        const home = role === 'super_admin' || role === 'admin' ? '/app/dashboard' : '/student/feed';
        return (
            <AuthShell
                statusIcon={<CheckCircle2 className="w-[30px] h-[30px]" />}
                statusTone="#15803d"
                statusBg="rgb(21 128 61 / .12)"
                heading="Email confirmed"
                sub={<>You're signed in as <span className="font-semibold text-foreground">{session.user.email}</span>.</>}
            >
                <Button asChild className="w-full h-12 rounded-[13px] font-bold">
                    <Link to={home}>Continue to Vidyaverse</Link>
                </Button>
            </AuthShell>
        );
    }

    if (error) {
        return (
            <AuthShell
                statusIcon={<AlertCircle className="w-[30px] h-[30px]" />}
                statusTone="#B8860B"
                statusBg="rgb(184 134 11 / .16)"
                heading="That link didn't work"
                sub="Confirmation links expire after an hour and can be used only once."
            >
                <div className="flex flex-col gap-[11px]">
                    {sentTo ? (
                        <Button className="w-full h-12 rounded-[13px] font-bold" onClick={resend} disabled={resending}>
                            {resending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Send me a new link
                        </Button>
                    ) : (
                        <Button asChild className="w-full h-12 rounded-[13px] font-bold">
                            <Link to="/login">Back to sign in</Link>
                        </Button>
                    )}
                </div>
            </AuthShell>
        );
    }

    // Waiting on the inbox.
    return (
        <AuthShell
            statusIcon={<MailCheck className="w-[30px] h-[30px]" />}
            statusTone="#1A237E"
            statusBg="rgb(26 35 126 / .12)"
            heading="Check your inbox"
            sub={
                sentTo ? (
                    <>We sent a confirmation link to <span className="font-semibold text-foreground">{sentTo}</span>. Click it to activate your account.</>
                ) : (
                    <>Click the confirmation link we emailed you to activate your account.</>
                )
            }
        >
            <div className="flex flex-col gap-[11px]">
                {sentTo && (
                    <Button variant="outline" className="w-full h-11 rounded-[13px] font-semibold" onClick={resend} disabled={resending}>
                        {resending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Resend the link
                    </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                    Not seeing it? Check your spam folder.
                </p>
                <Button asChild variant="ghost" className="w-full h-11 rounded-[13px] font-semibold">
                    <Link to="/login">Back to sign in</Link>
                </Button>
            </div>
        </AuthShell>
    );
}
