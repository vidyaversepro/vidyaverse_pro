import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useExamSchedules } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CreateExamScheduleModal } from './components/CreateExamScheduleModal';
import { ManageSubjectsModal } from './components/ManageSubjectsModal';

export default function ExamSchedulesPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [manageSubjectsScheduleId, setManageSubjectsScheduleId] = useState<string | null>(null);

    const { data: schedules, isLoading } = useExamSchedules();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Exam Schedules</h1>
                    <p className="text-muted-foreground">
                        Create and manage exam schedules and their subjects
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Schedule
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse border-0 shadow-lg">
                            <CardContent className="p-6 h-48 bg-muted rounded-xl" />
                        </Card>
                    ))
                ) : schedules?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
                        <div className="w-16 h-16 rounded-full tone-bg-indigo flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 tone-text-indigo" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No Exam Schedules</h3>
                        <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                            Create your first exam schedule to start managing subjects and generating hall tickets.
                        </p>
                        <Button 
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Schedule
                        </Button>
                    </div>
                ) : (
                    schedules?.map((schedule) => (
                        <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-0 shadow-lg group hover:shadow-xl transition-all h-full flex flex-col">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-foreground line-clamp-1">
                                                {schedule.examName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full pill-peacock capitalize">
                                                    {schedule.examType}
                                                </span>
                                                {schedule.academicYear && (
                                                    <span className="text-xs text-muted-foreground">{schedule.academicYear}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5",
                                            schedule.status === 'published' ? "pill-green" :
                                            schedule.status === 'draft' ? "pill-temple" :
                                            "bg-muted text-foreground"
                                        )}>
                                            {schedule.status === 'published' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {schedule.status}
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 mb-6">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                            {format(new Date(schedule.startDate), 'MMM d')} - {format(new Date(schedule.endDate), 'MMM d, yyyy')}
                                        </div>
                                        {schedule.reportingTime && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                                Report At: {format(new Date(schedule.reportingTime), 'h:mm a')}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <div className="w-4 h-4 mr-2 rounded-sm tone-bg-indigo flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold tone-text-indigo">{schedule._count?.subjects || 0}</span>
                                            </div>
                                            Subjects added
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <div className="w-4 h-4 mr-2 rounded-sm tone-bg-lotus flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold tone-text-lotus">{schedule._count?.hallTickets || 0}</span>
                                            </div>
                                            Hall tickets generated
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => setManageSubjectsScheduleId(schedule.id)}
                                        >
                                            Manage Subjects
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <CreateExamScheduleModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
            
            <ManageSubjectsModal
                scheduleId={manageSubjectsScheduleId}
                onClose={() => setManageSubjectsScheduleId(null)}
            />
        </div>
    );
}
