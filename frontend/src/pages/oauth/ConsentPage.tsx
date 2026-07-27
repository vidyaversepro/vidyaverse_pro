import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, Shield, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/lib/auth.client';
import { api } from '@/lib/api';
import { PageLoader } from '@/lib/lazy-page';

const SCOPE_DESCRIPTIONS: Record<string, { label: string; detail: string }> = {
    openid: { label: 'Identify you', detail: 'Confirm your identity to the application.' },
    profile: { label: 'Your basic profile', detail: 'Name, profile picture, and global role.' },
    email: { label: 'Your email address', detail: 'Read your verified email.' },
    offline_access: { label: 'Stay signed in', detail: 'Refresh access without re-asking until you sign out.' },
    memberships: { label: 'Your institution memberships', detail: 'Which schools/colleges you belong to and your role in each.' },
    entitlements: { label: 'Your subscription entitlements', detail: 'Which Vidyaverse features your institution has enabled for you.' },
};

interface ClientInfo {
    name: string;
    icon?: string | null;
}

// Better Auth base URL — same logic as auth.client.ts
const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || '';
const AUTH_BASE = apiUrl.endsWith('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;

export default function ConsentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: session, isPending: sessionPending } = useSession();

    const consentCode = searchParams.get('consent_code') || '';
    const clientId = searchParams.get('client_id') || '';
    const scopesRaw = searchParams.get('scope') || '';
    const scopes = scopesRaw.split(/\s+/).filter(Boolean);

    const [client, setClient] = useState<ClientInfo | null>(null);
    const [clientLoading, setClientLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!clientId) {
            setClientLoading(false);
            return;
        }
        api.get(`/oauth/clients/${clientId}`)
            .then((res) => setClient(res.data.data))
            .catch(() => setClient(null))
            .finally(() => setClientLoading(false));
    }, [clientId]);

    if (sessionPending || clientLoading) return <PageLoader />;

    // Better Auth redirects unauthenticated users to loginPage automatically, but
    // if a deep-link lands here without a session, bounce to sign-in with returnTo.
    if (!session) {
        const returnTo = encodeURIComponent(`/oauth/consent?${searchParams.toString()}`);
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                        <CardDescription>You need to be signed in to authorise this application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to={`/login?federated=1&return_to=${returnTo}`}>Sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!consentCode || !clientId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Invalid request</CardTitle>
                        <CardDescription>This consent link is missing required parameters.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    async function submitConsent(accept: boolean) {
        setSubmitting(true);
        try {
            const res = await fetch(`${AUTH_BASE}/api/auth/oauth2/consent`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accept, consent_code: consentCode }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Consent request failed');
            }
            const data = await res.json();
            const redirectURI = data?.redirectURI;
            if (redirectURI) {
                window.location.href = redirectURI;
            } else {
                navigate('/');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast({ variant: 'destructive', title: 'Consent failed', description: message });
            setSubmitting(false);
        }
    }

    const clientName = client?.name ?? clientId;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-muted/40">
            <Card className="max-w-lg w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        {client?.icon ? (
                            <img src={client.icon} alt="" className="h-12 w-12 rounded-full" />
                        ) : (
                            <Shield className="h-7 w-7 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-xl">Authorise {clientName}</CardTitle>
                    <CardDescription>
                        Signed in as <span className="font-medium">{session.user.email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-2">This application is requesting permission to:</p>
                        <ul className="space-y-2">
                            {scopes.map((scope) => {
                                const meta = SCOPE_DESCRIPTIONS[scope] ?? { label: scope, detail: 'Custom permission.' };
                                return (
                                    <li key={scope} className="flex gap-3 rounded-md border p-3">
                                        <Check className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{meta.label}</p>
                                            <p className="text-xs text-muted-foreground">{meta.detail}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Authorising sends your identity, institution memberships, and an entitlements link to {clientName}.
                        You can revoke this at any time from your account settings.
                    </p>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => submitConsent(false)}
                            disabled={submitting}
                        >
                            <X className="h-4 w-4 mr-2" /> Deny
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => submitConsent(true)}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <ExternalLink className="h-4 w-4 mr-2" />
                            )}
                            Allow & continue
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
