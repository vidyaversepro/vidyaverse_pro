import { useState } from 'react';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAssignRole, User, useInstitutions } from '@/lib/queries';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';

const assignRoleSchema = z.object({
    institutionId: z.string().min(1, 'Please select an institution'),
    role: z.enum(['school_admin', 'teacher', 'student'], {
        required_error: "Please select a role",
    }),
});

interface AssignRoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function AssignRoleModal({ open, onOpenChange, user }: AssignRoleModalProps) {
    const { toast } = useToast();
    const assignRoleMutation = useAssignRole();
    const { data: institutionsData, isLoading: isLoadingInstitutions } = useInstitutions({ limit: 100 });

    const form = useForm<z.infer<typeof assignRoleSchema>>({
        resolver: zodResolver(assignRoleSchema),
        defaultValues: {
            institutionId: '',
            role: undefined,
        },
    });

    // Reset form when modal closes or opens
    useState(() => {
        form.reset();
    });

    const onSubmit = async (values: z.infer<typeof assignRoleSchema>) => {
        if (!user) return;

        try {
            await assignRoleMutation.mutateAsync({
                userId: user.id,
                institutionId: values.institutionId,
                role: values.role,
            });
            toast({
                title: 'Role Assigned',
                description: `Successfully assigned role to ${user.name}`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast({
                title: 'Error Assinging Role',
                description: 'Could not assign the role to this user.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] glass-panel border border-blue-100/20 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-900/80 shadow-2xl overflow-y-auto shadow-blue-900/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 opacity-80" />
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 flex items-center justify-center border border-indigo-200/50 shadow-sm">
                            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                                Assign Institution Role
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400">
                                Grant {user?.name} access to a specific institution.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        <FormField
                            control={form.control}
                            name="institutionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Institution</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="glass-input h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700">
                                                <SelectValue placeholder="Select an institution" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {isLoadingInstitutions ? (
                                                <div className="p-2 text-sm text-center text-slate-500">Loading...</div>
                                            ) : (
                                                institutionsData?.data?.map((inst) => (
                                                    <SelectItem key={inst.id} value={inst.id}>
                                                        {inst.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-rose-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="glass-input h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="school_admin">School Admin</SelectItem>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-rose-500" />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={assignRoleMutation.isPending}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-500/20 border-0"
                            >
                                {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
