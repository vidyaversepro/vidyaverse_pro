import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Upload, Image as ImageIcon, PenLine, Plus, Trash2, Edit, Info, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    useUpdateBranding, useAuthorities, useCreateAuthority, useUpdateAuthority, useDeleteAuthority,
    type Institution, type Authority,
} from '@/lib/queries/institution/institution-queries';

const ROLE_TYPES = [
    { value: 'PRINCIPAL', label: 'Principal' },
    { value: 'VICE_CHANCELLOR', label: 'Vice Chancellor' },
    { value: 'HOD', label: 'Head of Department' },
    { value: 'REGISTRAR', label: 'Registrar' },
    { value: 'DEAN', label: 'Dean' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'COORDINATOR', label: 'Coordinator' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'CUSTOM', label: 'Custom Designation' },
];
const roleLabel = (v: string) => ROLE_TYPES.find((r) => r.value === v)?.label || v;

export default function BrandingPanel({ institution }: { institution: Institution }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground/80">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    <b>Recommended sizes</b> — Logo: square (1:1), ~512×512px transparent PNG · Signature: wide (~3:1), ~600×200px transparent PNG · Student photo: portrait 3:4.
                    Images are <i>scaled to fit, never stretched</i>, so off-spec uploads won&apos;t distort — but a wrong ratio may letterbox (logo) or crop (photo).
                </span>
            </div>
            <LogoSection institution={institution} />
            <AuthoritiesSection institutionId={institution.id} />
        </motion.div>
    );
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function LogoSection({ institution }: { institution: Institution }) {
    const update = useUpdateBranding(institution.id);
    const logoRef = useRef<HTMLInputElement>(null);
    const darkRef = useRef<HTMLInputElement>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [darkLogo, setDarkLogo] = useState<File | null>(null);
    const [logoPrev, setLogoPrev] = useState<string | null>(null);
    const [darkPrev, setDarkPrev] = useState<string | null>(null);
    // Image URLs that failed to load (e.g. legacy/dead URLs) — keyed by URL (not
    // tile) so that saving a NEW url is retried instead of staying suppressed.
    const [erroredUrls, setErroredUrls] = useState<Record<string, boolean>>({});

    const pick = (setF: (f: File) => void, setP: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) { toast.error('Please choose an image (PNG/SVG)'); return; }
        if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
        setF(f); setP(URL.createObjectURL(f));
    };

    const tiles: { label: string; hint: string; ref: React.RefObject<HTMLInputElement>; onPick: any; preview: string | null; current?: string | null; icon: typeof ImageIcon }[] = [
        { label: 'Primary Logo', hint: 'Square (1:1) · ~512×512px · transparent PNG', ref: logoRef, onPick: pick(setLogo, setLogoPrev), preview: logoPrev, current: institution.logoUrl, icon: ImageIcon },
        { label: 'Dark Theme Logo (optional)', hint: 'Square (1:1) · ~512×512px · transparent · falls back to primary', ref: darkRef, onPick: pick(setDarkLogo, setDarkPrev), preview: darkPrev, current: institution.darkLogoUrl, icon: ImageIcon },
    ];

    const save = async () => {
        const fd = new FormData();
        if (logo) fd.append('logo', logo);
        if (darkLogo) fd.append('darkLogo', darkLogo);
        try {
            await update.mutateAsync(fd);
            toast.success('Logo saved — appears on newly generated documents');
            setLogo(null); setDarkLogo(null); setLogoPrev(null); setDarkPrev(null);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to save logo');
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg text-foreground">Logo</h2>
                    <p className="text-sm text-muted-foreground mt-1">Printed on ID cards, certificates and other documents.</p>
                </div>
                <Button onClick={save} disabled={(!logo && !darkLogo) || update.isPending} className="shrink-0">
                    {update.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Logo
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tiles.map((t) => {
                    // A freshly-picked file (blob) always wins; otherwise show the
                    // stored image unless that exact URL already failed to load.
                    const candidate = t.preview || t.current || null;
                    const imgSrc = candidate && !erroredUrls[candidate] ? candidate : null;
                    return (
                        <div key={t.label} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <t.icon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">{t.label}</span>
                                {t.preview && <span className="text-[10px] font-semibold text-primary uppercase">New · unsaved</span>}
                            </div>
                            <button type="button" onClick={() => t.ref.current?.click()}
                                className="group relative aspect-[16/7] w-full rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden flex items-center justify-center bg-muted/50">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={t.label}
                                        className="w-full h-full object-contain p-2"
                                        onError={() => imgSrc && setErroredUrls((s) => ({ ...s, [imgSrc]: true }))}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground"><Upload className="w-6 h-6 mb-1" /><span className="text-xs">Click to upload</span></div>
                                )}
                            </button>
                            <input ref={t.ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={t.onPick} />
                            <p className="text-[11px] mt-1.5 leading-snug text-muted-foreground">
                                {t.current && erroredUrls[t.current] && !t.preview ? (
                                    <span className="text-amber-600">Saved image couldn&apos;t load — upload a new one.</span>
                                ) : t.hint}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Authorities (signatories) ───────────────────────────────────────────────
function AuthoritiesSection({ institutionId }: { institutionId: string }) {
    const { data: authorities = [], isLoading } = useAuthorities(institutionId);
    const del = useDeleteAuthority(institutionId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Authority | null>(null);

    const openAdd = () => { setEditing(null); setDialogOpen(true); };
    const openEdit = (a: Authority) => { setEditing(a); setDialogOpen(true); };

    const handleDelete = async (a: Authority) => {
        if (!window.confirm(`Delete signatory "${a.name || roleLabel(a.roleType)}"?`)) return;
        try { await del.mutateAsync(a.id); toast.success('Signatory removed'); }
        catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to delete'); }
    };

    // The card uses the PRINCIPAL (else first) — surface which one that is.
    const cardSignatory = authorities.find((a) => a.roleType === 'PRINCIPAL') || authorities[0] || null;

    return (
        <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-lg text-foreground">Signing Authorities</h2>
                    <p className="text-sm text-muted-foreground mt-1">Principal, Director, etc. Their signature is printed on ID cards & certificates.</p>
                </div>
                <Button onClick={openAdd} className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Add Signatory
                </Button>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-800/50 p-3 text-xs text-amber-800 dark:text-amber-300 my-4">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>ID cards use the <b>Principal</b> (or the first signatory if none is a Principal). Regenerate cards after changes.</span>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : authorities.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl border-border text-sm text-muted-foreground">
                    No signatories yet. Add a Principal so their signature appears on cards.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {authorities.map((a) => (
                        <div key={a.id} className="rounded-xl border border-border p-4 flex gap-4">
                            <div className="w-24 h-16 rounded-md bg-muted/50 border border-border flex items-center justify-center overflow-hidden shrink-0">
                                {a.signatureUrl ? (
                                    <img src={a.signatureUrl} alt="signature" className="w-full h-full object-contain p-1" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                    <PenLine className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-foreground truncate">{a.name || '(unnamed)'}</span>
                                    {cardSignatory?.id === a.id && (
                                        <span title="Used on ID cards" className="inline-flex items-center text-[10px] font-semibold text-amber-600"><Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />ON CARD</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{a.designation || roleLabel(a.roleType)}</p>
                                <div className="flex gap-1 mt-2">
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(a)}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive/80" onClick={() => handleDelete(a)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AuthorityDialog
                key={editing?.id || 'new'}
                institutionId={institutionId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                authority={editing}
            />
        </div>
    );
}

function AuthorityDialog({ institutionId, open, onOpenChange, authority }: {
    institutionId: string; open: boolean; onOpenChange: (o: boolean) => void; authority: Authority | null;
}) {
    const create = useCreateAuthority(institutionId);
    const update = useUpdateAuthority(institutionId);
    const sigRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(authority?.name || '');
    const [roleType, setRoleType] = useState(authority?.roleType || 'PRINCIPAL');
    const [designation, setDesignation] = useState(authority?.designation || '');
    const [email, setEmail] = useState(authority?.email || '');
    const [phone, setPhone] = useState(authority?.phone || '');
    const [sig, setSig] = useState<File | null>(null);
    const [sigPrev, setSigPrev] = useState<string | null>(null);

    const pickSig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) { toast.error('Please choose an image'); return; }
        if (f.size > 2 * 1024 * 1024) { toast.error('Signature must be under 2 MB'); return; }
        setSig(f); setSigPrev(URL.createObjectURL(f));
    };

    const isPending = create.isPending || update.isPending;
    const preview = sigPrev || authority?.signatureUrl || null;

    const submit = async () => {
        if (!name.trim()) { toast.error('Name is required'); return; }
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('roleType', roleType);
        fd.append('designation', designation.trim());
        if (email.trim()) fd.append('email', email.trim());
        if (phone.trim()) fd.append('phone', phone.trim());
        if (sig) fd.append('signature', sig);
        try {
            if (authority) await update.mutateAsync({ authorityId: authority.id, formData: fd });
            else await create.mutateAsync(fd);
            toast.success(authority ? 'Signatory updated' : 'Signatory added');
            onOpenChange(false);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to save signatory');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>{authority ? 'Edit Signatory' : 'Add Signatory'}</DialogTitle>
                    <DialogDescription>Their signature is printed on ID cards and certificates.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. A. Verma" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Role</label>
                            <Select value={roleType} onValueChange={setRoleType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ROLE_TYPES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Designation (optional)</label>
                        <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Principal — shown under the signature" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email (optional)</label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="principal@school.edu" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Phone (optional)</label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Signature</label>
                        <button type="button" onClick={() => sigRef.current?.click()}
                            className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center bg-muted/50 overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="signature" className="h-full object-contain p-2" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground text-center px-3"><Upload className="w-6 h-6 mb-1" /><span className="text-xs">Wide (~3:1), ~600×200px · transparent PNG preferred · max 2 MB</span></div>
                            )}
                        </button>
                        <input ref={sigRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={pickSig} />
                        <p className="text-[11px] text-muted-foreground">A transparent background keeps the card clean; a white background will show a white box.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
                    <Button onClick={submit} disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {authority ? 'Save Changes' : 'Add Signatory'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
