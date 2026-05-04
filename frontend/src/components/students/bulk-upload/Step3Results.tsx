
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, CheckCircle, Upload, XCircle } from 'lucide-react';
import type { UploadResult, ParsedCsvRow } from './useBulkUploadWizard';

interface Step3ResultsProps {
    parsedRows: ParsedCsvRow[];
    uploadResult: UploadResult | null;
    isSubmitting: boolean;
    isPolling: boolean;
    jobProgress: {
        status: string;
        progress: number;
        processedItems: number;
        successfulItems: number;
        failedItems: number;
        totalItems: number;
    } | null;
    validRowsCount: number;
    errorRowsCount: number;
    onBack: () => void;
    onSubmit: () => void;
    onClose: () => void;
}

export function Step3Results({
    parsedRows,
    uploadResult,
    isSubmitting,
    isPolling,
    jobProgress,
    validRowsCount,
    errorRowsCount,
    onBack,
    onSubmit,
    onClose
}: Step3ResultsProps) {

    // PRE-SUBMISSION VIEW (Preview)
    if (!uploadResult && !isPolling) {
        return (
            <Card className="shadow-none border">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                        Preview & Confirm
                    </CardTitle>
                    <CardDescription>Review the final payload before sending it to the database.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm font-medium">
                        <span>Total Rows Found: {parsedRows.length}</span>
                        <span className="text-emerald-600">Will Import: {validRowsCount}</span>
                        <span className="text-rose-600">Will Discard: {errorRowsCount}</span>
                    </div>

                    <div className="border rounded-md overflow-hidden text-sm max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 border-b">Row</th>
                                    <th className="p-2 border-b">Name</th>
                                    <th className="p-2 border-b">Sex</th>
                                    <th className="p-2 border-b">DOB</th>
                                    <th className="p-2 border-b">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {parsedRows.slice(0, 100).map((r, i) => (
                                    <tr key={i} className={r.state === 'error' ? 'bg-rose-50/50' : r.state === 'warning' ? 'bg-amber-50/50' : ''}>
                                        <td className="p-2 font-mono text-muted-foreground">{r.originalIndex}</td>
                                        <td className="p-2 font-medium">{r.validatedData?.name || r.data.name || '-'}</td>
                                        <td className="p-2">{r.validatedData?.sex || r.data.sex || '-'}</td>
                                        <td className="p-2">{r.validatedData?.dob ? new Date(r.validatedData.dob).toLocaleDateString() : r.data.dob || '-'}</td>
                                        <td className="p-2">
                                            {r.state === 'error' ? (
                                                <span className="text-rose-600 font-medium">Error</span>
                                            ) : r.state === 'warning' ? (
                                                <span className="text-amber-600 font-medium">Warning</span>
                                            ) : (
                                                <span className="text-emerald-600 font-medium">Valid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {parsedRows.length > 100 && (
                                    <tr>
                                        <td colSpan={5} className="p-3 text-center text-muted-foreground italic">
                                            ...and {parsedRows.length - 100} more rows omitted from preview.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={validRowsCount === 0 || isSubmitting}>
                                    {isSubmitting ? 'Importing...' : 'Confirm & Import All'}
                                    <Upload className="w-4 h-4 ml-2" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will queue {validRowsCount} new student records for background import into the selected section.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onSubmit}>
                                        Yes, Queue {validRowsCount} Students
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // POLLING VIEW
    if (isPolling) {
        return (
            <Card className="shadow-none border">
                <CardHeader className="bg-primary/5 border-b pb-6">
                    <CardTitle className="text-xl flex flex-col items-center gap-4 text-center mt-4">
                        <div className="bg-primary/20 p-4 rounded-full animate-pulse">
                            <Upload className="w-12 h-12 text-primary" />
                        </div>
                        Importing Students...
                    </CardTitle>
                    <CardDescription className="text-center">Please wait while we process your CSV file. This is happening in the background.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {jobProgress ? (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Progress</span>
                                <span>{Math.round(jobProgress.progress)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-2 transition-all duration-300 ease-in-out"
                                    style={{ width: `${jobProgress.progress}%` }}
                                />
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                Processed {jobProgress.processedItems} of {jobProgress.totalItems} rows
                                {jobProgress.failedItems > 0 && <span className="text-rose-500 ml-2">({jobProgress.failedItems} failed)</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p>Starting background job...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // POST-SUBMISSION VIEW (Results)
    const totalProcessed = (uploadResult?.created || 0) + (uploadResult?.skipped || 0);

    return (
        <Card className="shadow-none border">
            <CardHeader className="bg-primary/5 border-b pb-6">
                <CardTitle className="text-xl flex flex-col items-center gap-4 text-center mt-4">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    Import Completed
                </CardTitle>
                <CardDescription className="text-center">The backend has finished processing your bulk upload request.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 flex flex-col items-center">
                        <span className="text-emerald-600 font-semibold mb-1 text-sm uppercase tracking-wider">Created</span>
                        <span className="text-4xl font-bold text-emerald-700">{uploadResult?.created || 0}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 flex flex-col items-center">
                        <span className="text-rose-600 font-semibold mb-1 text-sm uppercase tracking-wider">Skipped/Failed</span>
                        <span className="text-4xl font-bold text-rose-700">{uploadResult?.skipped || 0}</span>
                    </div>
                </div>

                <div className="text-center text-sm text-muted-foreground border-y py-3">
                    Total Rows Submitted: <strong>{totalProcessed}</strong>
                </div>

                {uploadResult?.errors && uploadResult.errors.length > 0 && (
                    <div className="border border-rose-200 rounded-md overflow-hidden text-sm">
                        <div className="bg-rose-50 px-4 py-3 border-b border-rose-200 flex items-center justify-between text-rose-800">
                            <span className="font-semibold flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Server Rejection Details
                            </span>
                            <span className="text-xs">{uploadResult.errors.length} errors</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-rose-100 bg-white">
                            {uploadResult.errors.map((err, i) => (
                                <div key={i} className="p-3 flex gap-3">
                                    <span className="text-muted-foreground font-mono w-16 flex-shrink-0">
                                        Row {err.row}
                                    </span>
                                    <div>
                                        {err.field && <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-xs mb-1 mr-2">{err.field}</span>}
                                        <span className="text-rose-900">{err.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose} size="lg">
                        Close & Refresh Data
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
