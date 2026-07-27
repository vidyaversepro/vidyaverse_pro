
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBulkUploadWizard } from './useBulkUploadWizard';
import { Step1ContextSelector } from './Step1ContextSelector';
import { Step2UploadValidate } from './Step2UploadValidate';
import { Step3Results } from './Step3Results';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface BulkStudentUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Lock the selection to a specific institution */
    prefilledInstitutionId?: string;
    /** Pre-fill the class dropdown */
    prefilledClassId?: string;
    /** Pre-fill the stream dropdown */
    prefilledStreamId?: string;
    /** Lock the selection to a specific section */
    prefilledSectionId?: string;
    /** Callback when import succeeds */
    onSuccess?: () => void;
}

export function BulkStudentUploadModal({
    open,
    onOpenChange,
    prefilledInstitutionId,
    prefilledClassId,
    prefilledStreamId,
    prefilledSectionId,
    onSuccess
}: BulkStudentUploadModalProps) {

    const wizard = useBulkUploadWizard(prefilledInstitutionId, prefilledClassId, prefilledStreamId, prefilledSectionId);
    const queryClient = useQueryClient();

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && wizard.isSubmitting) {
            // Prevent close while submitting
            return;
        }
        if (!newOpen) {
            wizard.resetWizard();
        }
        onOpenChange(newOpen);
    };

    const handleCloseFinal = () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['sections'] });
        wizard.resetWizard();
        onOpenChange(false);
        if (onSuccess) onSuccess();
    };

    const handleSubmit = async () => {
        if (!wizard.sectionId || !wizard.institutionId) {
            toast.error("Missing critical context (Section or Institution)");
            return;
        }

        if (!wizard.file) {
            toast.error("No file selected for upload");
            return;
        }

        const formData = new FormData();
        formData.append('file', wizard.file);
        formData.append('institutionId', wizard.institutionId);
        formData.append('sectionId', wizard.sectionId);

        wizard.setIsSubmitting(true);
        wizard.setIsPolling(true);
        wizard.setStep(3); // Jump to progress screen

        try {
            const response = await api.post('/student/bulk-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // The backend tenant-scopes by the x-institution-id header, not the
                    // institutionId form field. The wizard's institution is chosen
                    // independently of the active-institution switcher, so forward it
                    // explicitly or the section lookup runs under the wrong tenant → 400
                    // "Section not found or unauthorized".
                    'x-institution-id': wizard.institutionId,
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
                            wizard.setJobProgress(jobData);
                            if (jobData.status === 'completed' || jobData.status === 'failed') {
                                window.clearInterval(pollInterval);
                                wizard.setIsPolling(false);
                                wizard.setIsSubmitting(false);
                                wizard.setUploadResult({
                                    created: jobData.successfulItems || 0,
                                    skipped: jobData.failedItems || 0,
                                    errors: []
                                });

                                if (jobData.status === 'completed') {
                                    toast.success(`Import completed: ${jobData.successfulItems} records saved.`);
                                } else {
                                    toast.error(`Job failed mid-process.`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Polling error", e);
                        window.clearInterval(pollInterval);
                        wizard.setIsPolling(false);
                        wizard.setIsSubmitting(false);
                        toast.error("Lost connection to progress tracker.");
                    }
                }, 2000);
            } else {
                wizard.setIsPolling(false);
                wizard.setIsSubmitting(false);
                toast.error("Failed to start job.");
            }
        } catch (err: any) {
            wizard.setIsPolling(false);
            wizard.setIsSubmitting(false);
            wizard.setStep(2); // Revert to preview
            toast.error(err.response?.data?.message || "Failed to upload file");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Bulk Student Upload</DialogTitle>
                    <DialogDescription>
                        Follow the wizard to safely import student records via CSV.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Stepper Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
                        <div
                            className="bg-primary h-2 transition-all duration-300 ease-in-out"
                            style={{ width: `${(wizard.step / 3) * 100}%` }}
                        />
                    </div>

                    {/* Step Containers */}
                    {wizard.step === 1 && (
                        <Step1ContextSelector
                            institutionId={wizard.institutionId}
                            setInstitutionId={wizard.setInstitutionId}
                            classId={wizard.classId}
                            setClassId={wizard.setClassId}
                            streamId={wizard.streamId}
                            setStreamId={wizard.setStreamId}
                            sectionId={wizard.sectionId}
                            setSectionId={wizard.setSectionId}
                            setSectionCapacity={wizard.setSectionCapacity}
                            setSectionEnrolledCount={wizard.setSectionEnrolledCount}
                            isInstitutionLocked={wizard.isInstitutionLocked}
                            isClassLocked={wizard.isClassLocked}
                            isStreamLocked={wizard.isStreamLocked}
                            isSectionLocked={wizard.isSectionLocked}
                            onNext={() => wizard.setStep(2)}
                        />
                    )}

                    {wizard.step === 2 && (
                        <Step2UploadValidate
                            file={wizard.file}
                            isParsing={wizard.isParsing}
                            validRowsCount={wizard.validRowsCount}
                            errorRowsCount={wizard.errorRowsCount}
                            warningRowsCount={wizard.warningRowsCount}
                            willOverflow={wizard.willOverflow}
                            availableSlots={wizard.availableSlots}
                            parsedRows={wizard.parsedRows}
                            onFileUpload={wizard.handleFileParse}
                            onBack={() => wizard.setStep(1)}
                            onNext={() => wizard.setStep(3)}
                        />
                    )}

                    {wizard.step === 3 && (
                        <Step3Results
                            parsedRows={wizard.parsedRows}
                            uploadResult={wizard.uploadResult}
                            isSubmitting={wizard.isSubmitting}
                            isPolling={wizard.isPolling}
                            jobProgress={wizard.jobProgress}
                            validRowsCount={wizard.validRowsCount}
                            errorRowsCount={wizard.errorRowsCount}
                            onBack={() => wizard.setStep(2)}
                            onSubmit={handleSubmit}
                            onClose={handleCloseFinal}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
