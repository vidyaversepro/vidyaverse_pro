import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateInstitution, useUpdateInstitution, Institution, checkInstitutionUniqueness } from '@/lib/queries';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, ArrowLeft, Loader2, Mail, Building2, Phone, AlertCircle } from 'lucide-react';

const createSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters'),
    academicYear: z.string().min(4, 'Academic Year format like 2025-2026').default('2025-2026'),
    contactEmail: z.string().email('Valid contact email is required').optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    adminEmail: z.string().email('Admin invitation email is required to create a new institution'),
    address: z.string().optional(),
    subscriptionTier: z.enum(['starter', 'professional', 'enterprise']),
    subscriptionStatus: z.enum(['trial', 'active', 'suspended', 'cancelled']),
});

const updateSchema = createSchema.omit({ adminEmail: true });

interface InstitutionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    institution?: Institution | null;
}

export function InstitutionModal({ open, onOpenChange, institution }: InstitutionModalProps) {
    const { toast } = useToast();
    const createMutation = useCreateInstitution();
    const updateMutation = useUpdateInstitution();
    const [step, setStep] = useState(1);

    const schema = institution ? updateSchema : createSchema;

    const form = useForm<any>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            code: '',
            academicYear: '2025-2026',
            contactEmail: '',
            contactPhone: '',
            adminEmail: '',
            address: '',
            subscriptionTier: 'starter',
            subscriptionStatus: 'trial',
        },
    });

    const currentCode = form.watch('code');
    const currentAdminEmail = form.watch('adminEmail');
    const currentContactEmail = form.watch('contactEmail');

    useEffect(() => {
        if (open) {
            setStep(1); // Reset step on open
            if (institution) {
                form.reset({
                    name: institution.name,
                    code: institution.code,
                    academicYear: (institution as {academicYear?: string}).academicYear || '2025-2026',
                    contactEmail: institution.contactEmail || '',
                    contactPhone: '',
                    address: institution.address || '',
                    subscriptionTier: institution.subscriptionTier as never,
                    subscriptionStatus: institution.subscriptionStatus as never,
                });
            } else {
                form.reset({
                    name: '',
                    code: '',
                    academicYear: '2025-2026',
                    contactEmail: '',
                    contactPhone: '',
                    adminEmail: '',
                    address: '',
                    subscriptionTier: 'starter',
                    subscriptionStatus: 'trial',
                });
            }
        }
    }, [open, institution, form]);

    // Real-time asynchronous uniqueness validation
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!currentCode && !currentAdminEmail && !currentContactEmail) return;

            try {
                const res = await checkInstitutionUniqueness(
                    currentCode?.length >= 2 ? currentCode : undefined,
                    currentAdminEmail?.includes('@') ? currentAdminEmail : undefined,
                    currentContactEmail?.includes('@') ? currentContactEmail : undefined,
                    institution?.id
                );

                if (res.errors.code) {
                    form.setError('code', { type: 'uniqueness', message: res.errors.code });
                } else if (form.getFieldState('code').error?.type === 'uniqueness') {
                    form.clearErrors('code');
                }

                if (res.errors.adminEmail) {
                    form.setError('adminEmail', { type: 'uniqueness', message: res.errors.adminEmail });
                } else if (form.getFieldState('adminEmail').error?.type === 'uniqueness') {
                    form.clearErrors('adminEmail');
                }

                if (res.errors.contactEmail) {
                    form.setError('contactEmail', { type: 'uniqueness', message: res.errors.contactEmail });
                } else if (form.getFieldState('contactEmail').error?.type === 'uniqueness') {
                    form.clearErrors('contactEmail');
                }
            } catch (error) {
                // Ignore silent validation errors
            }
        }, 600);

        return () => clearTimeout(timeout);
    }, [currentCode, currentAdminEmail, currentContactEmail, institution?.id, form]);

    const handleNext = async () => {
        try {
            const isValid = await form.trigger(['name', 'code', 'academicYear', 'contactEmail', 'contactPhone']);
            if (isValid) {
                // Explicit pre-submission check before advancing to step 2 to avoid skipping debounce
                const code = form.getValues('code');
                const contactEmail = form.getValues('contactEmail');
                const res = await checkInstitutionUniqueness(code, undefined, contactEmail, institution?.id);
                if (!res.isValid && (res.errors.code || res.errors.contactEmail)) {
                    if (res.errors.code) form.setError('code', { type: 'uniqueness', message: res.errors.code });
                    if (res.errors.contactEmail) form.setError('contactEmail', { type: 'uniqueness', message: res.errors.contactEmail });
                    return;
                }
                setStep(2);
            }
        } catch (error: any) {
            console.error('Uniqueness check failed:', error);
            toast({
                title: 'Validation Failed',
                description: 'Could not connect to the server to verify uniqueness. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const onSubmit = async (values: any) => {
        try {
            if (institution) {
                await updateMutation.mutateAsync({ id: institution.id, data: values });
                toast({ title: 'Institution updated successfully' });
            } else {
                await createMutation.mutateAsync(values);
                toast({
                    title: 'Institution created successfully',
                    description: `An invitation email has been sent to ${values.adminEmail}`,
                });
            }
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            const vErrs = error.response?.data?.validationErrors;
            if (vErrs) {
                const msgs: string[] = [];
                if (vErrs.code) { form.setError('code', { type: 'uniqueness', message: vErrs.code }); msgs.push(vErrs.code); }
                if (vErrs.adminEmail) { form.setError('adminEmail', { type: 'uniqueness', message: vErrs.adminEmail }); msgs.push(vErrs.adminEmail); }
                if (vErrs.contactEmail) { form.setError('contactEmail', { type: 'uniqueness', message: vErrs.contactEmail }); msgs.push(vErrs.contactEmail); }

                // Always show a clear banner so the reason isn't missed, and jump
                // to the step that holds the conflicting field.
                form.setError('root', {
                    message: msgs.join(' ') || 'Some values are already in use. Please use a unique code and emails.',
                });
                if (vErrs.code || vErrs.contactEmail) setStep(1);
            } else {
                form.setError('root', {
                    message: error.response?.data?.message || 'Failed to save institution. Ensure code and email are unique.'
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[550px] p-0 overflow-y-auto bg-background">
                <div className="max-h-[90vh] overflow-y-auto">
                    <div className="p-6 pb-4 border-b">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {institution ? 'Edit Institution' : 'Add New Institution'}
                            </DialogTitle>
                            <DialogDescription>
                                {institution
                                    ? 'Update the details for this institution.'
                                    : 'Step-by-step setup to register a new school or college.'}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Stepper Indicator */}
                        {!institution && (
                            <nav aria-label="Progress" className="flex items-center justify-center mt-6">
                                <ol role="list" className="flex items-center space-x-2">
                                    <li>
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}
                                            aria-current={step === 1 ? 'step' : undefined}
                                        >
                                            1
                                        </div>
                                    </li>
                                    <li>
                                        <div className={`w-12 h-1 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                                    </li>
                                    <li>
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                            aria-current={step === 2 ? 'step' : undefined}
                                        >
                                            2
                                        </div>
                                    </li>
                                </ol>
                            </nav>
                        )}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-4 space-y-6">

                            {/* General Error Banner */}
                            {form.formState.errors.root && (
                                <div className="p-3 rounded-md bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-2 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            {/* STEP 1: Basic Info */}
                            <div className={step === 1 ? 'space-y-4 block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden'}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input placeholder="E.g., Springfield High School" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Institution Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SPRING01" className="uppercase" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="academicYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Academic Year</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2025-2026" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>School Contact Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="info@school.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>School Phone</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input placeholder="(555) 123-4567" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* STEP 2: Configuration & Admin Setup */}
                            <div className={step === 2 || institution ? 'space-y-4 block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden'}>
                                {!institution && (
                                    <div className="p-4 bg-muted/40 rounded-xl border border-border mb-4">
                                        <FormField
                                            control={form.control}
                                            name="adminEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold text-foreground">Administrator Email (Required)</FormLabel>
                                                    <FormDescription className="text-xs text-muted-foreground mb-2">
                                                        An invitation link will be sent to this email to set up the main admin account.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input type="email" placeholder="admin@school.com" className="pl-9 bg-background" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="subscriptionTier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subscription Tier</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a tier" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="starter">Starter</SelectItem>
                                                        <SelectItem value="professional">Professional</SelectItem>
                                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subscriptionStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="trial">Trial</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="suspended">Suspended</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Education St, NY 10001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4 border-t flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="w-full sm:w-auto"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    Cancel
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    {(!institution && step === 2) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="w-full sm:w-auto"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                    )}

                                    {(!institution && step === 1) ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full sm:w-auto"
                                        >
                                            Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                        >
                                            {(createMutation.isPending || updateMutation.isPending) ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                            ) : institution ? (
                                                'Save Changes'
                                            ) : (
                                                'Create Institution'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
