import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Loader2, Plus, Lock, Calendar, Clock, MapPin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useExamSchedule, useAddExamSubject, usePublishExamSchedule } from '@/lib/queries';
import { cn } from '@/lib/utils';

interface Props {
    scheduleId: string | null;
    onClose: () => void;
}

interface SubjectFormData {
    subjectName: string;
    subjectCode?: string;
    examDate: string;
    startTime: string;
    endTime: string;
    venue?: string;
    maxMarks: number;
    passingMarks?: number;
}

export function ManageSubjectsModal({ scheduleId, onClose }: Props) {
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    
    const { data: schedule, isLoading } = useExamSchedule(scheduleId || '', !!scheduleId);
    const addSubjectMutation = useAddExamSubject();
    const publishMutation = usePublishExamSchedule();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<SubjectFormData>({
        defaultValues: {
            maxMarks: 100,
            passingMarks: 40,
        }
    });

    const onAddSubject = async (data: SubjectFormData) => {
        if (!scheduleId) return;
        
        try {
            // Calculating duration roughly if backend needs it (though service falls back to 120)
            const d1 = new Date(`1970-01-01T${data.startTime}`);
            const d2 = new Date(`1970-01-01T${data.endTime}`);
            const durationMinutes = Math.round((d2.getTime() - d1.getTime()) / 60000);

            const payload = {
                examScheduleId: scheduleId,
                subjectId: crypto.randomUUID(), // Dummy UUID to pass validation, backend uses subjectName
                subjectName: data.subjectName,
                subjectCode: data.subjectCode,
                examDate: new Date(data.examDate).toISOString(),
                startTime: data.startTime,
                endTime: data.endTime,
                durationMinutes: durationMinutes > 0 ? durationMinutes : 120,
                venue: data.venue,
                maxMarks: Number(data.maxMarks),
                passingMarks: Number(data.passingMarks),
            } as any;
            
            await addSubjectMutation.mutateAsync(payload);
            
            toast({
                title: 'Subject Added',
                description: 'The subject has been added to the schedule.',
            });
            reset();
            setIsAdding(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Failed to add subject',
            });
        }
    };

    const handlePublish = async () => {
        if (!scheduleId) return;
        try {
            await publishMutation.mutateAsync(scheduleId);
            toast({
                title: 'Schedule Published',
                description: 'The exam schedule has been published and can now be used for hall tickets.',
            });
            onClose();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Publish Failed',
                description: error.response?.data?.message || 'Failed to publish schedule',
            });
        }
    };

    const isPublished = schedule?.status === 'published';

    return (
        <Dialog open={!!scheduleId} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        Manage Subjects
                        {isPublished && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Published
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {schedule ? `Adding subjects for ${schedule.examName}` : 'Loading...'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 space-y-6">
                    {/* Existing Subjects List */}
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                                {schedule?.subjects?.length || 0} Subjects Added
                            </h3>
                            {schedule?.subjects?.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800">
                                    <p className="text-sm text-gray-500">No subjects added yet. Add at least one to publish.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {schedule?.subjects?.map(subject => (
                                        <div key={subject.id} className="flex p-3 rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{subject.subjectName}</h4>
                                                    {subject.subjectCode && (
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                                            {subject.subjectCode}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(subject.examDate), 'MMM d, yyyy')}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {subject.startTime} - {subject.durationMinutes} min</span>
                                                    {subject.venue && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {subject.venue}</span>}
                                                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Max {subject.maxMarks}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add Subject Form */}
                    {!isPublished && (
                        <div className="border border-indigo-100 dark:border-indigo-900/30 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                            <div 
                                className="bg-indigo-50 dark:bg-indigo-900/20 p-3 px-4 flex justify-between items-center cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors"
                                onClick={() => setIsAdding(!isAdding)}
                            >
                                <h4 className="font-medium text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add New Subject
                                </h4>
                            </div>
                            
                            {isAdding && (
                                <form onSubmit={handleSubmit(onAddSubject)} className="p-4 space-y-4 border-t border-indigo-100 dark:border-indigo-900/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="subjectName" className="text-xs">Subject Name <span className="text-red-500">*</span></Label>
                                            <Input id="subjectName" className="h-8 text-sm" {...register('subjectName', { required: 'Required' })} />
                                            {errors.subjectName && <p className="text-[10px] text-red-500">{errors.subjectName.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="subjectCode" className="text-xs">Subject Code</Label>
                                            <Input id="subjectCode" className="h-8 text-sm" placeholder="e.g. MAT101" {...register('subjectCode')} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="examDate" className="text-xs">Exam Date <span className="text-red-500">*</span></Label>
                                            <Input type="date" id="examDate" className="h-8 text-sm" {...register('examDate', { required: 'Required' })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="startTime" className="text-xs">Start Time <span className="text-red-500">*</span></Label>
                                            <Input type="time" id="startTime" className="h-8 text-sm" {...register('startTime', { required: 'Required' })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="endTime" className="text-xs">End Time <span className="text-red-500">*</span></Label>
                                            <Input type="time" id="endTime" className="h-8 text-sm" {...register('endTime', { required: 'Required' })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="venue" className="text-xs">Venue/Room No</Label>
                                            <Input id="venue" className="h-8 text-sm" {...register('venue')} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="maxMarks" className="text-xs">Max Marks</Label>
                                            <Input type="number" id="maxMarks" className="h-8 text-sm" {...register('maxMarks')} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="passingMarks" className="text-xs">Passing Marks</Label>
                                            <Input type="number" id="passingMarks" className="h-8 text-sm" {...register('passingMarks')} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                                        <Button type="submit" size="sm" disabled={addSubjectMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 h-8">
                                            {addSubjectMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                            Add Subject
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 mt-4">
                    <p className="text-xs text-gray-500">
                        {isPublished ? 
                            "This schedule is locked and published." : 
                            "Add all subjects before publishing. Once published, you can generate hall tickets."}
                    </p>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {!isPublished && (
                            <Button 
                                onClick={handlePublish}
                                disabled={!schedule?.subjects?.length || publishMutation.isPending}
                                className={cn(
                                    "transition-all",
                                    schedule?.subjects?.length 
                                        ? "bg-green-600 hover:bg-green-700 text-white" 
                                        : "bg-gray-300 text-gray-500"
                                )}
                            >
                                {publishMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Lock className="w-4 h-4 mr-2" />
                                )}
                                Publish Schedule
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
