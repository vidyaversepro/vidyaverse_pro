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
                <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <CardHeader className="py-4">
                        <CardTitle className="text-2xl text-green-600 dark:text-green-400">{queueData?.readyCount || 0}</CardTitle>
                        <CardDescription>Ready for Print (Green)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <CardHeader className="py-4">
                        <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                            {(queueData?.totalStudents || 0) - (queueData?.readyCount || 0)}
                        </CardTitle>
                        <CardDescription>Missing Fields (Red)</CardDescription>
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
                        <div className="overflow-x-auto">
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
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {student.name}
                                            </td>
                                            <td className="px-4 py-3">{student.rollNo}</td>
                                            <td className="px-4 py-3">
                                                {student.section?.class?.name} - {student.section?.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {student.isReady ? (
                                                    <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Ready
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Incomplete
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {student.missingFields?.length > 0 ? (
                                                    <span className="text-red-500 font-medium text-xs">
                                                        {student.missingFields.join(', ')}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-500 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
