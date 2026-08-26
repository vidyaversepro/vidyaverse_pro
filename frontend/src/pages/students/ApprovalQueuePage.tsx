import { useState } from 'react';
import { useApprovalQueue } from '@/lib/queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ApprovalQueuePage() {
    const navigate = useNavigate();
    const [productId, setProductId] = useState('id_card');

    const { data: queueData, isLoading } = useApprovalQueue({
        productId
    });

    const handleGenerate = () => {
        if (!queueData?.readyCount) return;
        toast.success(`Successfully dispatched ${queueData.readyCount} items to the print queue!`);
        // In a real app, this would call a bulk generate mutation
    };

    // One status badge, so the table and the mobile cards can never drift apart.
    const renderStatus = (student: any) =>
        student.isReady ? (
            <Badge variant="outline" className="pill-green border-transparent">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ready
            </Badge>
        ) : (
            <Badge variant="outline" className="pill-red border-transparent">
                <XCircle className="w-3 h-3 mr-1" />
                Incomplete
            </Badge>
        );

    const renderMissing = (student: any) =>
        student.missingFields?.length > 0 ? (
            <span className="tone-text-red font-medium text-xs">
                {student.missingFields.join(', ')}
            </span>
        ) : (
            <span className="tone-text-green text-xs">-</span>
        );

    return (
        <div className="space-y-6 h-full pb-10">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/students')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Students
                </Button>
            </div>

            <PageHeader
                breadcrumb={[]}
                title="Master Data Approval Queue"
                description="Review student records (Master C) against required fields before generating products."
                action={
                    <Button disabled={!queueData?.readyCount || queueData.readyCount === 0} onClick={handleGenerate}>
                        <Printer className="h-4 w-4 mr-2" />
                        Generate ({queueData?.readyCount || 0} Ready)
                    </Button>
                }
            />

            <div className="flex gap-4">
                <div className="w-72">
                    <label className="text-sm font-medium mb-1 block">Product Type (Master A Mappings)</label>
                    <Select value={productId} onValueChange={setProductId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="id_card">Student ID Cards</SelectItem>
                            <SelectItem value="certificate">Certificates</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-2xl">{queueData?.totalStudents || 0}</CardTitle>
                        <CardDescription>Total Records</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="tone-bg-green border-transparent">
                    <CardHeader className="py-4">
                        <CardTitle className="text-2xl tone-text-green">{queueData?.readyCount || 0}</CardTitle>
                        <CardDescription className="text-foreground/80">Ready for Print (Green)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="tone-bg-red border-transparent">
                    <CardHeader className="py-4">
                        <CardTitle className="text-2xl tone-text-red">
                            {(queueData?.totalStudents || 0) - (queueData?.readyCount || 0)}
                        </CardTitle>
                        <CardDescription className="text-foreground/80">Missing Fields (Red)</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                        </div>
                    ) : (
                        <>
                            {/* Desktop: full table. Below lg a 5-column table measured 496px
                                inside a 343px window — 153px of sideways scrolling per row. */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Student Name</th>
                                            <th className="px-4 py-3 font-medium">Roll No</th>
                                            <th className="px-4 py-3 font-medium">Class / Section</th>
                                            <th className="px-4 py-3 font-medium">Status Limit</th>
                                            <th className="px-4 py-3 font-medium">Missing Fields</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queueData?.students?.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                    No students found in the system. Make sure you map or import students.
                                                </td>
                                            </tr>
                                        )}
                                        {queueData?.students?.map((student: any) => (
                                            <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                                                <td className="px-4 py-3">{student.rollNo}</td>
                                                <td className="px-4 py-3">
                                                    {student.section?.class?.name} - {student.section?.name}
                                                </td>
                                                <td className="px-4 py-3">{renderStatus(student)}</td>
                                                <td className="px-4 py-3">{renderMissing(student)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Phone / tablet: one card per student, same handlers and renderers. */}
                            <div className="lg:hidden divide-y divide-border">
                                {queueData?.students?.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No students found in the system. Make sure you map or import students.
                                    </p>
                                )}
                                {queueData?.students?.map((student: any) => (
                                    <div key={student.id} className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-medium text-foreground min-w-0 break-words">{student.name}</p>
                                            <div className="shrink-0">{renderStatus(student)}</div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Roll {student.rollNo || '-'} &middot; {student.section?.class?.name} - {student.section?.name}
                                        </p>
                                        {student.missingFields?.length > 0 && (
                                            <div className="min-w-0 break-words">
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1.5">Missing</span>
                                                {renderMissing(student)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
