import { useOnboardingStore } from '@/stores/onboarding.store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Palette, Check } from 'lucide-react';

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

                {/* Branding & signatories are configured post-onboarding in the Branding tab */}
                <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 w-full">
                            <h4 className="font-medium text-foreground">Branding &amp; Signatories</h4>
                            <p className="text-sm text-muted-foreground">
                                Upload your logo and add signing authorities (Principal, etc.) anytime from the institution&apos;s{' '}
                                <span className="font-medium text-foreground">Branding</span> tab — it lists the recommended image sizes so logos and signatures render correctly on ID cards.
                            </p>
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
