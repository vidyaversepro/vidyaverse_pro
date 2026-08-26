// no react imports needed
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCreateExamSchedule } from '@/lib/queries';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    examName: string;
    examType: 'internal' | 'board' | 'competitive';
    academicYear?: string;
    startDate: string;
    endDate: string;
    instructions?: string;
    reportingTime?: string;
}

export function CreateExamScheduleModal({ isOpen, onClose }: Props) {
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            examType: 'internal',
        },
    });

    const createMutation = useCreateExamSchedule();

    const onSubmit = async (data: FormData) => {
        try {
            // Format dates slightly if required by backend (backend expects datetime strings)
            // But HTML built-in input type="date" returns 'YYYY-MM-DD', which backend can parse mostly, 
            // but z.string().datetime() requires ISO8601 string. So we will append 'T00:00:00Z'.
            
            const payload = {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            };
            
            await createMutation.mutateAsync(payload);
            
            toast({
                title: 'Success',
                description: 'Exam Schedule created successfully',
            });
            reset();
            onClose();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create exam schedule',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Exam Schedule</DialogTitle>
                    <DialogDescription>
                        Define a new exam window. You can add subjects to it later.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="examName">Exam Name <span className="tone-text-red">*</span></Label>
                        <Input
                            id="examName"
                            placeholder="e.g. Mid-Term Examination 2024"
                            {...register('examName', { required: 'Exam Name is required' })}
                        />
                        {errors.examName && <p className="text-xs tone-text-red">{errors.examName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="examType">Exam Type</Label>
                            <Controller
                                name="examType"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="internal">Internal</SelectItem>
                                            <SelectItem value="board">Board</SelectItem>
                                            <SelectItem value="competitive">Competitive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input
                                id="academicYear"
                                placeholder="e.g. 2024-2025"
                                {...register('academicYear')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="tone-text-red">*</span></Label>
                            <Input
                                id="startDate"
                                type="date"
                                {...register('startDate', { required: 'Start Date is required' })}
                            />
                            {errors.startDate && <p className="text-xs tone-text-red">{errors.startDate.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date <span className="tone-text-red">*</span></Label>
                            <Input
                                id="endDate"
                                type="date"
                                {...register('endDate', { required: 'End Date is required' })}
                            />
                            {errors.endDate && <p className="text-xs tone-text-red">{errors.endDate.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reportingTime">Reporting Time</Label>
                        <Input
                            id="reportingTime"
                            type="time"
                            {...register('reportingTime')}
                        />
                        <p className="text-xs text-muted-foreground">Default time students should report to venue.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">General Instructions</Label>
                        <Textarea
                            id="instructions"
                            placeholder="Printed on the hall tickets. e.g. Bring ID card, no calculators allowed."
                            className="resize-none"
                            {...register('instructions')}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="mr-2"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} >
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Schedule
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
