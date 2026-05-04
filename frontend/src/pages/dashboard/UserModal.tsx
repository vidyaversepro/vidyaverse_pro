import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateUser, useUpdateUser, User } from '@/lib/queries';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    phone: z.string().optional(),
    globalRole: z.enum(['super_admin', 'support', 'none']), // Simplified
});

interface UserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
}

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
    const { toast } = useToast();
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            globalRole: 'none',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: '',
                phone: user.phone || '',
                globalRole: ((user as unknown as { globalRole?: 'super_admin' | 'support' | 'none' }).globalRole) || 'none',
            });
        } else {
            form.reset({
                name: '',
                email: '',
                password: '',
                phone: '',
                globalRole: 'none',
            });
        }
    }, [user, open, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const payload = { ...values };
            if (payload.globalRole === 'none') {
                payload.globalRole = null as never;
            }
            if (payload.password === '') {
                delete payload.password;
            }

            if (user) {
                await updateMutation.mutateAsync({ id: user.id, data: payload });
                toast({ title: 'User updated successfully' });
            } else {
                if (!payload.password) {
                    form.setError('password', { message: 'Password is required for new users' });
                    return;
                }
                await createMutation.mutateAsync(payload);
                toast({ title: 'User created successfully' });
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to save user',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] glass-panel border border-white/40 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 shadow-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {user ? 'Edit User' : 'Add User'}
                    </DialogTitle>
                    <DialogDescription>
                        {user
                            ? 'Make changes to the user profile here.'
                            : 'Add a new user to the platform.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 opacity-80" />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300">Name</FormLabel>
                                    <FormControl>
                                        <Input className="glass-input focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300">Email</FormLabel>
                                    <FormControl>
                                        <Input className="glass-input focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300">{user ? 'New Password (Optional)' : 'Password'}</FormLabel>
                                    <FormControl>
                                        <Input className="glass-input focus:ring-indigo-500/20 focus:border-indigo-500" type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300">Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input className="glass-input focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="+1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="globalRole"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 dark:text-slate-300">Global Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="glass-input focus:border-indigo-500 focus:ring-indigo-500/20">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None (Standard User)</SelectItem>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="support">Support</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-500/30 border-0"
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : 'Save user'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
