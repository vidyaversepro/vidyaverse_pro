import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { CheckCircle2, Building2, Users2, Target, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

import BrandingStep from './onboarding/BrandingStep';
import AcademicStructureStep from './onboarding/AcademicStructureStep';
import AuthorityStep from './onboarding/AuthorityStep';
import ReviewStep from './onboarding/ReviewStep';

const steps = [
    { title: 'Institution Details', icon: Building2 },
    { title: 'Branding & Identity', icon: Target },
    { title: 'Academic Structure', icon: GraduationCap },
    { title: 'Authority Management', icon: Users2 },
    { title: 'Review & Complete', icon: CheckCircle2 },
];

export default function InstitutionOnboardingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0); // Changed initial step to 0
    const store = useOnboardingStore();

    // Fetch basic institution info
    const { data: institution, isLoading } = useQuery({
        queryKey: ['institution', id],
        queryFn: async () => {
            const res = await api.get(`/institution/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (institution?.onboardingCompleted) {
            toast({
                title: 'Onboarding already completed',
                description: 'This institution has already completed secondary onboarding.',
            });
            navigate('/app/institutions');
        }
    }, [institution, navigate, toast]);

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleComplete = async () => {
        if (!id) return;
        try {
            // Upload branding logic (handled in the step or here, simplified for plan)
            const formData = new FormData();
            if (store.logoFile) formData.append('logo', store.logoFile);
            if (store.darkLogoFile) formData.append('darkLogo', store.darkLogoFile);

            if (store.logoFile || store.darkLogoFile) {
                await api.post(`/institution/${id}/branding`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // Upload Authorities
            for (const auth of store.authorities) {
                const authFormData = new FormData();
                authFormData.append('name', auth.name);
                authFormData.append('designation', auth.designation);
                authFormData.append('roleType', auth.roleType);
                if (auth.email) authFormData.append('email', auth.email);
                if (auth.phone) authFormData.append('phone', auth.phone);
                if (auth.signatureFile) authFormData.append('signature', auth.signatureFile);

                await api.post(`/institution/${id}/authorities`, authFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // Finalize
            await api.patch(`/institution/${id}/complete-onboarding`, {
                institutionType: store.institutionType,
            });

            toast({ title: 'Success', description: 'Institution onboarding completed successfully!' });
            store.reset();
            navigate('/app/institutions');
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to complete onboarding.', variant: 'destructive' });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading onboarding session...</div>;

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Secondary Onboarding</h1>
                <p className="text-muted-foreground">Complete the setup profile for {institution?.name}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Vertical Stepper */}
                <Card className="lg:w-1/4 h-fit border-none shadow-none bg-accent/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-primary text-primary-foreground shadow-md' :
                                        isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            Step {index + 1}
                                        </span>
                                        <span className="text-sm font-semibold tracking-tight">{step.title}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1">
                    <Card className="min-h-[300px] sm:min-h-[500px] flex flex-col pt-4">
                        <CardContent className="flex-1">
                            {currentStep === 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Verify Basic Information</h3>
                                    <p className="text-sm text-muted-foreground">Institution type and core details.</p>
                                    <div className="pt-4 flex flex-col gap-2">
                                        <label className="text-sm font-medium">Institution Category</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={store.institutionType}
                                            onChange={(e) => store.setInstitutionType(e.target.value)}
                                        >
                                            <option value="SCHOOL">K-12 School</option>
                                            <option value="COLLEGE">College</option>
                                            <option value="UNIVERSITY">University</option>
                                            <option value="COACHING_INSTITUTE">Coaching Institute</option>
                                            <option value="TRAINING_CENTER">Training Center</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {currentStep === 1 && <BrandingStep />}
                            {currentStep === 2 && <AcademicStructureStep />}
                            {currentStep === 3 && <AuthorityStep />}
                            {currentStep === 4 && <ReviewStep institution={institution} />}
                        </CardContent>

                        <div className="p-4 sm:p-6 mt-auto border-t bg-muted/20 flex flex-wrap justify-between gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                                Back
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button onClick={handleNext}>Continue Next Step</Button>
                            ) : (
                                <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Finalize Onboarding
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
