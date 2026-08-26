import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useIdCards } from '@/lib/queries';

export default function PrintBatchPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // In a real app, productIds would be passed via state or URL params (e.g. from Approval Queue)
    const productIds = location.state?.productIds || [];

    const { data: idCardsData, isLoading } = useIdCards({ limit: "100" });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <div className="p-8">Loading print layout...</div>;
    }

    // For demo purposes, we'll just grab the first 10 cards if no IDs were passed
    const cardsToPrint = productIds.length > 0
        ? idCardsData?.data.filter(card => productIds.includes(card.id)) || []
        : idCardsData?.data.slice(0, 10) || [];

    return (
        <div className="bg-muted min-h-screen pb-10 print:bg-white print:p-0">
            {/* Non-printable header */}
            <div className="print:hidden bg-card border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm mb-6 max-w-5xl mx-auto rounded-b-lg">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg">Print Layout Preview</h1>
                        <p className="text-sm text-muted-foreground">Standard A4 Sheet (210x297mm) - {cardsToPrint.length} cards</p>
                    </div>
                </div>
                <Button onClick={handlePrint} size="lg">
                    <Printer className="h-5 w-5 mr-2" />
                    Print / Save PDF
                </Button>
            </div>

            {/* Printable A4 Sheet Container.
                Scrolls INSIDE this wrapper rather than dragging the whole page
                sideways: the sheet is a fixed 210mm (794px), so at 375 it pushed
                the document 435px wide and every screen below ~830px scrolled
                horizontally. `print:overflow-visible` keeps the printed output
                untouched — the wrapper only exists on screen. */}
            <div className="overflow-x-auto print:overflow-visible">
            {/* `text-gray-900` is load-bearing, not decoration. This sheet is
                hard-coded `bg-white` because it represents paper, but its text had
                no colour of its own and inherited `--foreground` — which in dark
                mode is near-white. The student names measured 1.03:1 on the white
                sheet, i.e. the entire print preview was invisible in dark mode.
                Paper takes print ink in both themes. */}
            <div className="print:m-0 print:shadow-none bg-white text-gray-900 shadow-lg mx-auto w-[210mm] min-h-[297mm] p-[10mm] box-border">
                {/* CSS Grid for ID Cards (assuming 54x86mm standard size, 3x3 grid on A4 margin) */}
                <div className="grid grid-cols-3 gap-[5mm] auto-rows-max">
                    {cardsToPrint.map((card, index) => (
                        <div key={card.id || index} className="w-[54mm] h-[86mm] border-2 border-dashed border-gray-300 rounded-md overflow-hidden relative flex flex-col pt-[5mm] items-center bg-blue-50/20 text-center">
                            {/* Card Content Mockup */}
                            <div className="w-[20mm] h-[20mm] bg-gray-200 rounded-full mb-[2mm] overflow-hidden">
                                {card.student?.photoUrl ? (
                                    <img src={card.student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Photo</div>
                                )}
                            </div>
                            <h3 className="font-bold text-[10px] uppercase">{card.student?.name || 'Student Name'}</h3>
                            <p className="text-[8px] text-gray-600">ID: {card.student?.admissionNo || 'N/A'}</p>
                            <p className="text-[8px] text-gray-600">Class: {card.student?.section?.class?.name || 'N/A'}</p>
                            <div className="mt-auto w-full h-[15mm] bg-blue-600 text-white flex items-center justify-center text-[7px]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                Vidyaverse Academy
                            </div>
                        </div>
                    ))}

                    {cardsToPrint.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-gray-600">
                            No cards selected for printing.
                        </div>
                    )}
                </div>
            </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
                    #root > div { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
}
