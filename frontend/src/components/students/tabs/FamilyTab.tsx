import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function FamilyTab() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Family & Guardian</h3>
                <p className="text-sm text-gray-500">Enter parent or guardian details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="fatherName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Father's Name (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Ramesh Sharma" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="motherName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mother's Name (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Sunita Sharma" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Guardian Details (Required if parents are not provided)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="guardianName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guardian's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Amit Kumar" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="guardianRelation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relation to Student</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Uncle" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Consent & Agreement</h4>
                <FormField
                    control={control}
                    name="consentGivenBy"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Adult Providing Consent *</FormLabel>
                            <FormControl>
                                <Input placeholder="Type full name as signature" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="consentGiven"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">
                                    Parental Consent Agreement
                                </FormLabel>
                                <FormDescription>
                                    I hereby declare that the information provided is true and correct. I consent to the processing of this student's data by for educational and administrative purposes.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value === true}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
