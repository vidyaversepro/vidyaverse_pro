// React import removed
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicTabProps {
    disabled?: boolean;
}

export function AcademicTab({ disabled = false }: AcademicTabProps) {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <div className="mb-4 mt-2">
                <p className="text-sm border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-r-lg">
                    Institutional parameters (Roll No, Class, Section) are locked for this record.
                </p>
            </div>

            {/* Hidden fields to satisfy the validation schema and maintain referential integrity */}
            <input type="hidden" {...control.register('institutionId')} />
            <input type="hidden" {...control.register('sectionId')} />
            <input type="hidden" {...control.register('rollNo')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormField
                    control={control}
                    name="admissionNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Admission Number (Optional)</FormLabel>
                            <FormControl>
                                <Input disabled={disabled} {...field} value={field.value || ''} placeholder="e.g. ADM-2025-001" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="dateOfAdmission"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Admission *</FormLabel>
                            <FormControl>
                                <Input type="date" disabled={disabled} {...field}
                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="previousSchool"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Previous School (Optional)</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="transportMode"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Transport Mode (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Transport Mode" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="own">Own</SelectItem>
                                    <SelectItem value="school bus">School Bus</SelectItem>
                                    <SelectItem value="public">Public Transport</SelectItem>
                                    <SelectItem value="walking">Walking</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
