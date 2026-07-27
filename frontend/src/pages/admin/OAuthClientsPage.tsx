import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RefreshCw, Power, PowerOff, Trash2, Copy, Check, ShieldAlert, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
    useOAuthClients,
    useCreateOAuthClient,
    useRotateOAuthClient,
    useDisableOAuthClient,
    useEnableOAuthClient,
    useDeleteOAuthClient,
    type OAuthClientWithSecret,
} from '@/lib/queries/admin/oauth-clients-queries';

const createSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    redirectUrls: z
        .string()
        .min(1, 'At least one redirect URL is required')
        .refine(
            (v) => v.split('\n').map((s) => s.trim()).filter(Boolean).every((u) => /^https?:\/\//.test(u)),
            'Each redirect URL must start with http:// or https://',
        ),
});
type CreateForm = z.infer<typeof createSchema>;

function SecretRevealDialog({
    open,
    onClose,
    client,
}: {
    open: boolean;
    onClose: () => void;
    client: OAuthClientWithSecret | null;
}) {
    const { toast } = useToast();
    const [copied, setCopied] = useState<'id' | 'secret' | null>(null);

    if (!client) return null;

    const copy = async (text: string, kind: 'id' | 'secret') => {
        await navigator.clipboard.writeText(text);
        setCopied(kind);
        toast({ title: 'Copied', description: `${kind === 'id' ? 'Client ID' : 'Client secret'} copied to clipboard` });
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-500" /> Save these credentials now
                    </DialogTitle>
                    <DialogDescription>
                        The client secret will <strong>not</strong> be shown again. Copy it into the RP's environment now.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Client ID</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={client.clientId} className="font-mono text-xs" />
                            <Button variant="outline" size="icon" onClick={() => copy(client.clientId, 'id')}>
                                {copied === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Client Secret</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={client.clientSecret} className="font-mono text-xs" />
                            <Button variant="outline" size="icon" onClick={() => copy(client.clientSecret, 'secret')}>
                                {copied === 'secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>I've saved them</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RegisterDialog({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (client: OAuthClientWithSecret) => void;
}) {
    const { toast } = useToast();
    const createMutation = useCreateOAuthClient();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

    const onSubmit = async (data: CreateForm) => {
        try {
            const urls = data.redirectUrls.split('\n').map((s) => s.trim()).filter(Boolean);
            const client = await createMutation.mutateAsync({ name: data.name, redirectUrls: urls });
            reset();
            onClose();
            onCreated(client);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to register client';
            toast({ variant: 'destructive', title: 'Registration failed', description: message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Register a new OAuth client</DialogTitle>
                        <DialogDescription>
                            Relying parties (PDLMS, DigiClassroom) authenticate against Vidyaverse using these credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Display name</Label>
                            <Input id="name" placeholder="PDLMS" {...register('name')} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="redirectUrls">Redirect URLs (one per line)</Label>
                            <textarea
                                id="redirectUrls"
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                placeholder={'http://localhost:3000/api/auth/oauth2/callback/vidyaverse\nhttps://pdlms.example.com/api/auth/oauth2/callback/vidyaverse'}
                                {...register('redirectUrls')}
                            />
                            {errors.redirectUrls && <p className="text-xs text-red-500">{errors.redirectUrls.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Register
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function OAuthClientsPage() {
    const { toast } = useToast();
    const { data: clients, isLoading } = useOAuthClients();
    const rotateMutation = useRotateOAuthClient();
    const disableMutation = useDisableOAuthClient();
    const enableMutation = useEnableOAuthClient();
    const deleteMutation = useDeleteOAuthClient();

    const [registerOpen, setRegisterOpen] = useState(false);
    const [revealed, setRevealed] = useState<OAuthClientWithSecret | null>(null);

    const rotate = async (clientId: string, name: string) => {
        if (!confirm(`Rotate the client secret for "${name}"? Existing access tokens issued to this client will continue to work until they expire, but the old secret stops working immediately.`)) return;
        try {
            const updated = await rotateMutation.mutateAsync(clientId);
            setRevealed(updated);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Rotate failed';
            toast({ variant: 'destructive', title: 'Rotate failed', description: message });
        }
    };

    const disable = async (clientId: string) => {
        try { await disableMutation.mutateAsync(clientId); } catch {}
    };
    const enable = async (clientId: string) => {
        try { await enableMutation.mutateAsync(clientId); } catch {}
    };

    const remove = async (clientId: string, name: string) => {
        if (!confirm(`Permanently delete "${name}"? Active sessions in the relying party will continue until their tokens expire; the RP cannot authenticate again.`)) return;
        try { await deleteMutation.mutateAsync(clientId); } catch {}
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">OAuth Clients</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Relying parties registered against Vidyaverse's OpenID Connect provider.
                    </p>
                </div>
                <Button onClick={() => setRegisterOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Register client
                </Button>
            </div>

            {isLoading ? (
                <Card><CardContent className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
            ) : !clients || clients.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        No OAuth clients registered yet. Register PDLMS or DigiClassroom to enable federated sign-in.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {clients.map((c) => (
                        <Card key={c.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            {c.name}
                                            {c.disabled && <Badge variant="destructive">Disabled</Badge>}
                                        </CardTitle>
                                        <CardDescription className="font-mono text-xs mt-1">{c.clientId}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => rotate(c.clientId, c.name)} title="Rotate secret">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        {c.disabled ? (
                                            <Button variant="ghost" size="sm" onClick={() => enable(c.clientId)} title="Enable">
                                                <Power className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => disable(c.clientId)} title="Disable">
                                                <PowerOff className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => remove(c.clientId, c.name)} title="Delete" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground">
                                    <div className="font-medium text-foreground mb-1">Redirect URLs</div>
                                    <ul className="space-y-0.5 font-mono">
                                        {c.redirectUrls.map((u) => <li key={u}>{u}</li>)}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <RegisterDialog
                open={registerOpen}
                onClose={() => setRegisterOpen(false)}
                onCreated={(client) => setRevealed(client)}
            />
            <SecretRevealDialog
                open={!!revealed}
                onClose={() => setRevealed(null)}
                client={revealed}
            />
        </div>
    );
}
