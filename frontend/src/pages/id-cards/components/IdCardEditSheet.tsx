import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { IdCard, useUpdateIdCard } from '@/lib/queries';

const formSchema = z.object({
    status: z.string().min(1, 'Status is required'),
});

interface IdCardEditSheetProps {
    isOpen: boolean;
    onClose: () => void;
    idCard: IdCard | null;
}

export function IdCardEditSheet({ isOpen, onClose, idCard }: IdCardEditSheetProps) {
    const { toast } = useToast();
    const updateMutation = useUpdateIdCard();
    // const { data: templatesData } = useTemplates({ limit: '100' }); // Fetch all templates - Unused for now

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: '',
        },
    });

    useEffect(() => {
        if (idCard) {
            form.reset({
                status: idCard.status,
            });
        }
    }, [idCard, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!idCard) return;

        try {
            await updateMutation.mutateAsync({
                id: idCard.id,
                data: values,
            });
            toast({
                title: 'ID Card updated',
                description: 'The ID card has been successfully updated.',
            });
            onClose();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: 'There was an error updating the ID card.',
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit ID Card</SheetTitle>
                    <SheetDescription>
                        Update status and template for {idCard?.student.name}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                        <FormField
                            control={form.control}
                            name="status"
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
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="printed">Printed</SelectItem>
                                            <SelectItem value="issued">Issued</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Template selection would go here if we had templateId, omitting for now to avoid complexity without correct data */}

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
