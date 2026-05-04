import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Printer,
    Eye,
    Users,
    Download,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useIdCards, type IdCard, useDeleteIdCard } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { IdCardPreviewModal } from './components/IdCardPreviewModal';
import { IdCardEditSheet } from './components/IdCardEditSheet';
import { BulkGenerateModal } from './components/BulkGenerateModal';
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

export default function IdCardsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const deleteMutation = useDeleteIdCard();

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast({ title: 'ID Card deleted' });
            setDeleteId(null);
            if (selectedCards.includes(id)) {
                setSelectedCards(prev => prev.filter(c => c !== id));
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Delete failed' });
        }
    };

    const handleBulkDelete = async () => {
        // Mock bulk delete since API might not support it yet, or loop
        try {
            await Promise.all(selectedCards.map(id => deleteMutation.mutateAsync(id)));
            toast({ title: 'Selected cards deleted' });
            setSelectedCards([]);
            setShowBulkDelete(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Bulk delete failed' });
        }
    };

    const { data, isLoading } = useIdCards({
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
                description: 'Please select at least one ID card to print.',
            });
            return;
        }
        navigate('/app/id-cards/print', { state: { productIds: selectedCards } });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ID Cards</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        View and manage generated ID cards
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
                    <Button 
                        className="bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] shadow-lg shadow-red-500/20"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
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
                                placeholder="Search by student name or admission no..."
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

            {/* ID Cards Grid */}
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
                            <CreditCard className="w-8 h-8 text-[#E63946]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No ID Cards Yet</h3>
                        <p className="text-gray-500 mt-1">Generate ID cards from the Students page.</p>
                    </div>
                ) : (
                    data?.data?.map((idCard: IdCard) => (
                        <motion.div
                            key={idCard.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                'group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                                selectedCards.includes(idCard.id)
                                    ? 'border-[#E63946] ring-2 ring-red-500/20'
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            )}
                            onClick={() => toggleSelectCard(idCard.id)}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[1.586] bg-gray-100 relative group-hover:scale-105 transition-transform duration-300">
                                {/* Placeholder for card preview */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                                        {idCard.student.photoUrl ? (
                                            <img src={idCard.student.photoUrl} alt={idCard.student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-8 h-8 text-gray-400 m-auto mt-4" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm truncate w-full">{idCard.student.name}</h3>
                                    <p className="text-xs text-gray-500">{idCard.student.admissionNo}</p>
                                    {idCard.student.section && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {idCard.student.section.class.name} - {idCard.student.section.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selection indicator */}
                            <div
                                className={cn(
                                    'absolute top-2 left-2 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
                                    selectedCards.includes(idCard.id)
                                        ? 'bg-[#E63946] border-[#E63946]'
                                        : 'bg-white border-gray-300'
                                )}
                            >
                                {selectedCards.includes(idCard.id) && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setPreviewId(idCard.id); }}>
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setEditId(idCard.id); }}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setDeleteId(idCard.id); }}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(idCard.pdfUrl, '_blank'); }}>
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-white dark:bg-gray-800">
                                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {idCard.student?.name}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{idCard.student?.admissionNo}</span>
                                    <span
                                        className={cn(
                                            'text-xs px-1.5 py-0.5 rounded',
                                            idCard.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        )}
                                    >
                                        {idCard.status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex items-center justify-between">
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

            <IdCardPreviewModal
                isOpen={!!previewId}
                onClose={() => setPreviewId(null)}
                idCard={data?.data?.find(c => c.id === previewId) || null}
            />

            <IdCardEditSheet
                isOpen={!!editId}
                onClose={() => setEditId(null)}
                idCard={data?.data?.find(c => c.id === editId) || null}
            />

            <BulkGenerateModal 
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
            />

            <AlertDialog open={!!deleteId || showBulkDelete} onOpenChange={() => { setDeleteId(null); setShowBulkDelete(false); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {showBulkDelete
                                ? `This will permanently delete ${selectedCards.length} selected ID cards.`
                                : "This action cannot be undone. This will permanently delete the ID card."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
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
