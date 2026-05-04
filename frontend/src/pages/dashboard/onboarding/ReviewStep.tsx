import { useOnboardingStore } from '@/stores/onboarding.store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, UploadCloud, Users2, Check } from 'lucide-react';

export default function ReviewStep({ institution }: { institution: any }) {
    const store = useOnboardingStore();

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold">Review & Complete</h3>
                <p className="text-sm text-muted-foreground">
                    Please review the gathered information before finalizing the setup for {institution?.name}.
                </p>
            </div>

            <div className="space-y-6">
                {/* Institution Details */}
                <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-foreground">Institution Classification</h4>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                                    <Check className="w-3 h-3 mr-1" /> Verified
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Type: <span className="font-semibold text-foreground">{store.institutionType.replace('_', ' ')}</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Branding Info */}
                <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-foreground">Branding Assets</h4>
                                {store.logoFile ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                                        <Check className="w-3 h-3 mr-1" /> Uploaded
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Missing Primary Logo</Badge>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {store.logoFile && (
                                    <div className="text-sm">
                                        <p className="text-muted-foreground mb-1">Light Theme</p>
                                        <img src={URL.createObjectURL(store.logoFile)} alt="Light" className="h-12 border rounded bg-slate-50 p-1" />
                                    </div>
                                )}
                                {store.darkLogoFile && (
                                    <div className="text-sm">
                                        <p className="text-muted-foreground mb-1">Dark Theme</p>
                                        <img src={URL.createObjectURL(store.darkLogoFile)} alt="Dark" className="h-12 border rounded bg-slate-900 p-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Authorities Summary */}
                <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Users2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-foreground">Registered Authorities</h4>
                                {store.authorities.length > 0 ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                                        <Check className="w-3 h-3 mr-1" /> {store.authorities.length} Added
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">No authorities added</Badge>
                                )}
                            </div>

                            {store.authorities.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                                    {store.authorities.map(auth => (
                                        <div key={auth.id} className="text-sm border rounded p-3 bg-muted/20 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium truncate">{auth.name || 'Unnamed'}</p>
                                                <p className="text-muted-foreground text-xs">{auth.designation || auth.roleType}</p>
                                            </div>
                                            {auth.signatureFile && (
                                                <Badge variant="outline" className="text-xs">Signature Added</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                <p>Clicking <strong>Finalize Onboarding</strong> will permanently save this setup. The Institution Dashboard will be immediately unblocked.</p>
            </div>
        </div>
    );
}
