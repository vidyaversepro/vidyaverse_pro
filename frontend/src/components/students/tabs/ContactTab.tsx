import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactTab() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contact & Address</h3>
                <p className="text-sm text-gray-500">Enter the primary contact and residential address details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="contact"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Mobile Number *</FormLabel>
                            <FormControl>
                                <Input placeholder="10 digit number" maxLength={10} {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>Official communication will be sent here</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="parentEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent/Guardian Email (Optional)</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="address"
                render={({ field }) => (
                    <FormItem className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <FormLabel>Residential Address *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="House/Flat No., Street, Landmark..."
                                rows={3}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City/District *</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="pincode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pincode/ZIP *</FormLabel>
                            <FormControl>
                                <Input placeholder="6 digits" maxLength={6} {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
