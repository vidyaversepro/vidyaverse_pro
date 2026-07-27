import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { IdCard } from '@/lib/queries';

interface IdCardPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    idCard: IdCard | null;
}

export function IdCardPreviewModal({ isOpen, onClose, idCard }: IdCardPreviewModalProps) {
    if (!idCard) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>ID Card Preview - {idCard.student.name}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center p-4 overflow-hidden">
                    {(() => {
                        const previewImage = idCard.cardFrontUrl || idCard.thumbnailUrl;
                        if (previewImage) {
                            return (
                                <div className="text-center">
                                    <div className="aspect-[1.586] w-96 bg-white shadow-lg mx-auto mb-4 rounded-md overflow-hidden">
                                        <img src={previewImage} alt="ID Card Preview" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Status: <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{idCard.status}</span>
                                    </p>
                                </div>
                            );
                        }
                        if (idCard.pdfUrl) {
                            // No rendered image — embed the PDF itself.
                            return <iframe src={idCard.pdfUrl} title="ID Card PDF" className="w-full h-[60vh] rounded-md bg-white" />;
                        }
                        return <p className="text-gray-500">No preview available</p>;
                    })()}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="outline" onClick={() => window.open(idCard.pdfUrl, '_blank')}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
