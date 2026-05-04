import { useCallback } from 'react';
import { useOnboardingStore, AuthorityProfile } from '@/stores/onboarding.store';
import { Plus, X, UploadCloud, Copy, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';

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

function AuthorityCard({
    authority,
    onUpdate,
    onRemove,
    onDuplicate
}: {
    authority: AuthorityProfile;
    onUpdate: (id: string, updates: Partial<AuthorityProfile>) => void;
    onRemove: (id: string) => void;
    onDuplicate: (auth: AuthorityProfile) => void;
}) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            onUpdate(authority.id, { signatureFile: acceptedFiles[0] });
        }
    }, [authority.id, onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
        maxSize: 2097152, // 2MB
        multiple: false
    });

    return (
        <div className="border rounded-xl p-6 bg-card relative shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onDuplicate(authority)} title="Duplicate Profile">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemove(authority.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                            value={authority.name}
                            onChange={(e) => onUpdate(authority.id, { name: e.target.value })}
                            placeholder="e.g. Dr. Sarah Jenkins"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role Classification</Label>
                            <Select
                                value={authority.roleType}
                                onValueChange={(val: any) => onUpdate(authority.id, { roleType: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_TYPES.map(rt => (
                                        <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Official Designation</Label>
                            <Input
                                value={authority.designation}
                                onChange={(e) => onUpdate(authority.id, { designation: e.target.value })}
                                placeholder="e.g. Senior Dean of Sciences"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input
                                type="email"
                                value={authority.email || ''}
                                onChange={(e) => onUpdate(authority.id, { email: e.target.value })}
                                placeholder="dean@school.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone (Optional)</Label>
                            <Input
                                value={authority.phone || ''}
                                onChange={(e) => onUpdate(authority.id, { phone: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <Label>Digital Signature</Label>
                    <p className="text-xs text-muted-foreground mb-2">Used for generating ID cards and certificates</p>

                    {authority.signatureFile ? (
                        <div className="flex-1 border rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 relative group">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onUpdate(authority.id, { signatureFile: undefined })}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <img src={URL.createObjectURL(authority.signatureFile)} alt="Signature" className="max-h-24 object-contain mix-blend-multiply" />
                            <p className="text-xs text-muted-foreground mt-2">{authority.signatureFile.name}</p>
                        </div>
                    ) : (
                        <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}>
                            <input {...getInputProps()} />
                            <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Upload Signature</p>
                            <p className="text-xs text-muted-foreground mt-1 text-center">PNG/JPG, max 2MB<br />White background will be removed</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AuthorityStep() {
    const { authorities, addAuthority, updateAuthority, removeAuthority } = useOnboardingStore();

    const handleCreateNew = () => {
        addAuthority({
            id: crypto.randomUUID(),
            name: '',
            designation: '',
            roleType: 'CUSTOM'
        });
    };

    const handleDuplicate = (auth: AuthorityProfile) => {
        addAuthority({
            ...auth,
            id: crypto.randomUUID(), // New vital ID assigned
            signatureFile: undefined, // Don't copy file references directly to avoid memory leaks
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">Authority Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Add Principals, Directors, or any signing authorities for document generation.
                    </p>
                </div>
                <Button onClick={handleCreateNew} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Authority
                </Button>
            </div>

            {authorities.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed rounded-xl border-muted-foreground/25 bg-muted/10">
                    <Users2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground">No Authorities Added</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                        You'll need at least one authority (like a Principal or Dean) if you plan on generating ID cards or certificates.
                    </p>
                    <Button onClick={handleCreateNew}>Create First Authority</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {authorities.map(auth => (
                        <AuthorityCard
                            key={auth.id}
                            authority={auth}
                            onUpdate={updateAuthority}
                            onRemove={removeAuthority}
                            onDuplicate={handleDuplicate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
