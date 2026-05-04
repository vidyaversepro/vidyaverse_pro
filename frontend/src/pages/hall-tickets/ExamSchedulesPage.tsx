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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Schedules</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Create and manage exam schedules and their subjects
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Schedule
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse border-0 shadow-lg">
                            <CardContent className="p-6 h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        </Card>
                    ))
                ) : schedules?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Exam Schedules</h3>
                        <p className="text-gray-500 max-w-sm mt-1 mb-6">
                            Create your first exam schedule to start managing subjects and generating hall tickets.
                        </p>
                        <Button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                                                {schedule.examName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                                    {schedule.examType}
                                                </span>
                                                {schedule.academicYear && (
                                                    <span className="text-xs text-gray-500">{schedule.academicYear}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5",
                                            schedule.status === 'published' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            schedule.status === 'draft' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {schedule.status === 'published' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {schedule.status}
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 mb-6">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            {format(new Date(schedule.startDate), 'MMM d')} - {format(new Date(schedule.endDate), 'MMM d, yyyy')}
                                        </div>
                                        {schedule.reportingTime && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                Report At: {format(new Date(schedule.reportingTime), 'h:mm a')}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-4 h-4 mr-2 rounded-sm bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{schedule._count?.subjects || 0}</span>
                                            </div>
                                            Subjects added
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-4 h-4 mr-2 rounded-sm bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">{schedule._count?.hallTickets || 0}</span>
                                            </div>
                                            Hall tickets generated
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
