import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, CheckCircle2, AlertCircle, FileArchive, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useInstitutions } from '@/lib/queries/institution/institution-queries';
import { Progress } from '@/components/ui/progress';

export interface BulkPhotoUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prefilledInstitutionId?: string;
    onSuccess?: () => void;
}

export function BulkPhotoUploadModal({
    open,
    onOpenChange,
    prefilledInstitutionId,
    onSuccess
}: BulkPhotoUploadModalProps) {
    const queryClient = useQueryClient();
    
    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [institutionId, setInstitutionId] = useState<string>(prefilledInstitutionId || '');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [jobResult, setJobResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: instData, isLoading: instLoading } = useInstitutions({});
    const institutions = instData?.data || [];

    const resetState = () => {
        setStep(1);
        setInstitutionId(prefilledInstitutionId || '');
        setFile(null);
        setIsSubmitting(false);
        setIsPolling(false);
        setJobResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && isSubmitting) return; // Prevent closing while processing
        if (!newOpen) resetState();
        onOpenChange(newOpen);
    };

    const handleCloseFinal = () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        resetState();
        onOpenChange(false);
        if (onSuccess) onSuccess();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (!selected.name.endsWith('.zip')) {
                toast.error("Please select a valid ZIP file.");
                return;
            }
            if (selected.size > 50 * 1024 * 1024) { // 50MB limit frontend check
                toast.error("File is too large. Maximum size is 50MB.");
                return;
            }
            setFile(selected);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const dropped = e.dataTransfer.files[0];
            if (!dropped.name.endsWith('.zip')) {
                toast.error("Please drop a valid ZIP file.");
                return;
            }
            setFile(dropped);
        }
    };

    const handleSubmit = async () => {
        if (!institutionId) {
            toast.error("Please select an institution.");
            return;
        }

        if (!file) {
            toast.error("No file selected for upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('institutionId', institutionId);

        setIsSubmitting(true);
        setIsPolling(true);
        setStep(2);

        try {
            const response = await api.post('/student/bulk-photo-zip', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Backend tenant-scopes by this header, not the institutionId form
                    // field. This modal's institution is selected independently of the
                    // active-institution switcher, so forward it explicitly to keep the
                    // import job attributed to the right tenant.
                    'x-institution-id': institutionId,
                }
            });

            const jobExecutionId = response.data?.jobExecutionId;
            if (jobExecutionId) {
                // Polling logic
                const pollInterval = window.setInterval(async () => {
                    try {
                        const progressRes = await api.get(`/student/import-job/${jobExecutionId}`);
                        const jobData = progressRes.data?.data;
                        
                        if (jobData) {
                            if (jobData.status === 'completed' || jobData.status === 'failed') {
                                window.clearInterval(pollInterval);
                                setIsPolling(false);
                                setIsSubmitting(false);
                                setJobResult(jobData.result || {
                                    processedCount: 0,
                                    failedCount: 0,
                                    unmatchedFiles: []
                                });

                                if (jobData.status === 'completed') {
                                    toast.success(`Photo import completed successfully.`);
                                } else {
                                    toast.error(`Job failed mid-process.`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Polling error", e);
                        window.clearInterval(pollInterval);
                        setIsPolling(false);
                        setIsSubmitting(false);
                        toast.error("Lost connection to progress tracker.");
                    }
                }, 2000);
            } else {
                setIsPolling(false);
                setIsSubmitting(false);
                toast.error("Failed to start job.");
            }
        } catch (err: any) {
            setIsPolling(false);
            setIsSubmitting(false);
            setStep(1);
            toast.error(err.response?.data?.message || "Failed to upload file");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Bulk Photo Import</DialogTitle>
                    <DialogDescription>
                        Upload a ZIP file containing student photos. Photos must be named with the student's admission number (e.g., ADM123.jpg).
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Stepper Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
                        <div
                            className="bg-primary h-2 transition-all duration-300 ease-in-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                        />
                    </div>

                    {step === 1 && (
                        <Card className="shadow-none border">
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Institution</label>
                                    <Select
                                        value={institutionId}
                                        onValueChange={setInstitutionId}
                                        disabled={!!prefilledInstitutionId || instLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={instLoading ? "Loading..." : "Select Institution"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutions.map((inst: any) => (
                                                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upload ZIP File</label>
                                    {!file ? (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <FileArchive className="h-10 w-10 text-muted-foreground mb-4" />
                                            <p className="font-medium text-sm">Click to upload or drag and drop</p>
                                            <p className="text-xs text-muted-foreground mt-1">.zip files only (Max 50MB)</p>
                                            <input
                                                type="file"
                                                accept=".zip"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                                            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start text-center sm:text-left">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-600 dark:text-emerald-400">
                                                    <FileArchive className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-emerald-900 dark:text-emerald-100">{file.name}</p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Naming Convention</AlertTitle>
                                    <AlertDescription className="text-xs text-muted-foreground">
                                        Ensure each photo is named exactly as the student's admission number (e.g., ADM123.jpg, ADM124.png). Unmatched files will be ignored.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button onClick={handleSubmit} disabled={!institutionId || !file || isSubmitting}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload & Process
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="shadow-none border">
                            <CardContent className="pt-6 space-y-6">
                                {isPolling ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Processing Photos...</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm">
                                                We are unpacking your ZIP archive, enhancing the images, and matching them to student records. This may take a moment.
                                            </p>
                                        </div>
                                        <Progress value={undefined} className="w-64 h-2" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-muted/30 rounded-xl border flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">Process Complete</h3>
                                                <p className="text-sm text-muted-foreground mt-1">Your photo batch has been processed.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Successfully Processed</p>
                                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{jobResult?.processedCount || 0}</p>
                                            </div>
                                            <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to Process</p>
                                                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{jobResult?.failedCount || 0}</p>
                                            </div>
                                        </div>

                                        {(jobResult?.unmatchedFiles?.length > 0) && (
                                            <div className="border rounded-lg overflow-hidden">
                                                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 border-b border-amber-100 dark:border-amber-900/50 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                                        Unmatched Files ({jobResult.unmatchedFiles.length})
                                                    </h4>
                                                </div>
                                                <div className="p-4 max-h-48 overflow-y-auto bg-muted/10 text-xs font-mono">
                                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                        {jobResult.unmatchedFiles.map((file: string, idx: number) => (
                                                            <li key={idx}>{file}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-4 border-t">
                                            <Button onClick={handleCloseFinal}>
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
