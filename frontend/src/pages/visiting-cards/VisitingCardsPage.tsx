import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Printer,
    Eye,
    Download,
    Contact,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useVisitingCards, type VisitingCard, useDeleteVisitingCard, useGenerateBulkVisitingCards } from '@/lib/queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function VisitingCardsPage() {
    const { toast } = useToast();
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    const deleteMutation = useDeleteVisitingCard();
    const institutionId = usePageInstitution();
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [vcOverrides, setVcOverrides] = useState({ website: '', linkedinUrl: '' });
    const generateBulkVisiting = useGenerateBulkVisitingCards();

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast({ title: 'Visiting Card deleted' });
            setDeleteId(null);
            if (selectedCards.includes(id)) {
                setSelectedCards(prev => prev.filter(c => c !== id));
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Delete failed' });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedCards.map(id => deleteMutation.mutateAsync(id)));
            toast({ title: 'Selected cards deleted' });
            setSelectedCards([]);
            setShowBulkDelete(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Bulk delete failed' });
        }
    };

    const { data, isLoading } = useVisitingCards({
        page: page.toString(),
        limit: '20',
        search: searchQuery,
    });

    const toggleSelectCard = (id: string) => {
        setSelectedCards((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handlePrintSelected = () => {
        if (selectedCards.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No cards selected',
                description: 'Please select at least one visiting card to print.',
            });
            return;
        }
        // Will navigate to a print component or trigger a bulk download
        toast({ title: 'Feature coming soon', description: 'Bulk print is under development.' });
    };

    const handleGenerateNew = () => {
        setIsGenerateOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visiting Cards</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        View and manage generated visiting cards
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedCards.length > 0 && (
                        <>
                            <Button variant="outline" onClick={() => setShowBulkDelete(true)} className="text-red-500 border-red-200 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedCards.length})
                            </Button>
                            <Button variant="outline" onClick={handlePrintSelected}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print ({selectedCards.length})
                            </Button>
                        </>
                    )}
                    <Button onClick={handleGenerateNew} className="bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] shadow-lg shadow-red-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate New
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or card no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[1.586] bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <Contact className="w-8 h-8 text-[#E63946]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Visiting Cards Yet</h3>
                        <p className="text-gray-500 mt-1">Generate visiting cards to see them here.</p>
                    </div>
                ) : (
                    data?.data?.map((card: VisitingCard) => {
                        const personName = card.student?.name || card.user?.name || 'Unknown';
                        const info1 = card.student?.admissionNo || card.user?.email || card.cardNumber;
                        const photo = card.student?.photoUrl || card.user?.image || null;

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    'group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                                    selectedCards.includes(card.id)
                                        ? 'border-[#E63946] ring-2 ring-red-500/20'
                                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                )}
                                onClick={() => toggleSelectCard(card.id)}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[1.586] bg-gray-100 relative group-hover:scale-105 transition-transform duration-300">
                                    {card.thumbnailUrl ? (
                                        <div className="absolute inset-0">
                                            <img src={card.thumbnailUrl} alt={personName} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                                                {photo ? (
                                                    <img src={photo} alt={personName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Contact className="w-8 h-8 text-gray-400 m-auto mt-4" />
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm truncate w-full">{personName}</h3>
                                            <p className="text-xs text-gray-500">{info1}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Selection indicator */}
                                <div
                                    className={cn(
                                        'absolute top-2 left-2 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
                                        selectedCards.includes(card.id)
                                            ? 'bg-[#E63946] border-[#E63946]'
                                            : 'bg-white border-gray-300'
                                    )}
                                >
                                    {selectedCards.includes(card.id) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(card.frontPdfUrl, '_blank'); }}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setDeleteId(card.id); }}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(card.frontPdfUrl, '_blank'); }}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Info */}
                                <div className="p-3 bg-white dark:bg-gray-800">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {personName}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">{card.cardNumber}</span>
                                        <span
                                            className={cn(
                                                'text-xs px-1.5 py-0.5 rounded',
                                                card.status === 'completed' || card.status === 'generated'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            )}
                                        >
                                            {card.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                        Page {page} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= data.pagination.totalPages}
                            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            <GenerateDocsModal
                isOpen={isGenerateOpen}
                onClose={() => {
                    setVcOverrides({ website: '', linkedinUrl: '' });
                    setIsGenerateOpen(false);
                }}
                title="Generate Visiting Cards"
                description="Select students or staff to generate visiting cards."
                serviceType="visiting_card"
                institutionId={institutionId || undefined}
                submitLabel="Generate Cards"
                audienceType="both"
                onGenerate={async ({ studentIds, userIds, templateId }) => {
                    const res: any = await generateBulkVisiting.mutateAsync({ 
                        studentIds: studentIds || [], 
                        userIds: userIds || [],
                        templateId,
                        ...(vcOverrides.website && { website: vcOverrides.website }),
                        ...(vcOverrides.linkedinUrl && { linkedinUrl: vcOverrides.linkedinUrl }),
                    });
                    const body = res?.data ?? res;
                    return { successful: body?.successful?.length ?? 0, failed: body?.failed?.length ?? 0 };
                }}
            >
                <div className="space-y-3 pt-1">
                    <p className="text-xs text-muted-foreground">
                        These fields override the profile data for this batch only.
                    </p>
                    <div className="space-y-1">
                        <Label className="text-xs">Website</Label>
                        <Input
                            placeholder="https://school.edu.in"
                            value={vcOverrides.website}
                            onChange={(e) => setVcOverrides((prev) => ({ ...prev, website: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">LinkedIn URL</Label>
                        <Input
                            placeholder="https://linkedin.com/in/username"
                            value={vcOverrides.linkedinUrl}
                            onChange={(e) => setVcOverrides((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                        />
                    </div>
                </div>
            </GenerateDocsModal>

            <AlertDialog open={!!deleteId || showBulkDelete} onOpenChange={() => { setDeleteId(null); setShowBulkDelete(false); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {showBulkDelete
                                ? `This will permanently delete ${selectedCards.length} selected visiting cards.`
                                : "This action cannot be undone. This will permanently delete the visiting card."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                                if (showBulkDelete) {
                                    handleBulkDelete();
                                } else if (deleteId) {
                                    handleDelete(deleteId);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
