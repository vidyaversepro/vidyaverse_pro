import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, AlertCircle, FileText } from "lucide-react";
import { type Student } from "@/lib/queries";

interface StudentDraftGridProps {
    students: Student[];
    onStudentClick: (student: Student) => void;
}

export function StudentDraftGrid({ students, onStudentClick }: StudentDraftGridProps) {
    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No drafts pending</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                    There are no students with pending verification waiting in the queue.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-6">
            {students.map((student) => {
                const missingPhoto = !student.photoUrl;
                const isApproved = student.dataStatus === 'approved';
                const isDraft = student.dataStatus === 'pending' || student.dataStatus === 'filled';

                return (
                    <Card
                        key={student.id}
                        className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${isApproved ? 'opacity-60' : 'border-primary/20 hover:border-primary/50'}`}
                        onClick={() => onStudentClick(student)}
                    >
                        <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                            <Avatar className="w-14 h-14 border border-gray-200 dark:border-gray-800 shadow-sm">
                                <AvatarImage src={student.photoUrl || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                    {student.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate" title={student.name}>
                                    {student.name}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    Roll: {student.rollNo} | {student.section?.class?.name} - {student.section?.name}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-3">
                            <div className="flex flex-wrap gap-2 mt-2">
                                {student.userId ? (
                                    <Badge className="pill-green border-transparent hover:opacity-90 text-[10px] py-0 px-2 h-5">Linked</Badge>
                                ) : (
                                    <Badge className="bg-muted text-muted-foreground border hover:bg-muted text-[10px] py-0 px-2 h-5">No account</Badge>
                                )}
                                {missingPhoto && (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-2 h-5">
                                        <Camera className="w-3 h-3 mr-1" /> No Photo
                                    </Badge>
                                )}
                                {isDraft && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400">
                                        <AlertCircle className="w-3 h-3 mr-1" /> Pending Data
                                    </Badge>
                                )}
                                {!missingPhoto && !isDraft && !isApproved && (
                                    <Badge variant="default" className="text-[10px] py-0 px-2 h-5">
                                        Ready for Approval
                                    </Badge>
                                )}
                                {isApproved && (
                                    <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5">
                                        Approved
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
