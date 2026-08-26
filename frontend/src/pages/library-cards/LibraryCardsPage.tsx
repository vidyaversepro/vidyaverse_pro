import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Printer,
    Users,
    Download,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Ban,
    CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLibraryCards, type LibraryCard, useSuspendLibraryCard, useReactivateLibraryCard, useBulkGenerateLibraryCards } from '@/lib/queries/library-cards/library-card-queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { cn } from '@/lib/utils';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
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

export default function LibraryCardsPage() {
    const institutionId = usePageInstitution();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    
    const [actionId, setActionId] = useState<{ id: string, type: 'suspend' | 'reactivate' } | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const suspendMutation = useSuspendLibraryCard();
    const reactivateMutation = useReactivateLibraryCard();
    const { mutateAsync: generateBulkAsync } = useBulkGenerateLibraryCards();

    const handleAction = async () => {
        if (!actionId || !institutionId) return;
        try {
            if (actionId.type === 'suspend') {
                await suspendMutation.mutateAsync({ id: actionId.id, institutionId });
                toast({ title: 'Library Card suspended' });
            } else {
                await reactivateMutation.mutateAsync({ id: actionId.id, institutionId });
                toast({ title: 'Library Card reactivated' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: error?.response?.data?.message || 'Action failed' });
        } finally {
            setActionId(null);
        }
    };

    const { data, isLoading } = useLibraryCards({
        institutionId: institutionId || '',
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
                description: 'Please select at least one library card to print.',
            });
            return;
        }
        navigate('/app/library-cards/print', { state: { productIds: selectedCards } });
    };

    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Library Cards' },
                ]}
                title="Library Cards"
                description="View and manage generated library cards"
                action={
                    <>
                        {selectedCards.length > 0 && (
                            <Button variant="outline" onClick={handlePrintSelected}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print ({selectedCards.length})
                            </Button>
                        )}
                        <Button onClick={() => setIsGenerateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Generate New</span>
                            <span className="sm:hidden">Generate</span>
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student name or admission no…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl pl-10"
                    />
                </div>
                <Button variant="outline" className="h-11">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Library Cards Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-[1.586] rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            ) : !institutionId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    Please select an institution from the top-bar switcher.
                </div>
            ) : data?.data?.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title="No library cards yet"
                    description="Generate library cards using the button above."
                    action={{ label: 'Generate New', onClick: () => setIsGenerateModalOpen(true) }}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.data?.map((card: LibraryCard) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                'group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                                selectedCards.includes(card.id)
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent hover:border-border'
                            )}
                            onClick={() => toggleSelectCard(card.id)}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[1.586] bg-muted relative group-hover:scale-105 transition-transform duration-300">
                                {card.pdfUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                                        <CreditCard className="w-12 h-12 mb-2 opacity-20" />
                                        <span className="absolute text-sm font-medium">Library Card</span>
                                    </div>
                                )}
                                {/* Fallback layout when no rendered card image is available */}
                                <div className={cn('absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-card', card.pdfUrl && 'hidden')}>
                                    <div className="w-16 h-16 rounded-full bg-muted mb-2 overflow-hidden border-2 border-primary">
                                        {card.student?.photoUrl ? (
                                            <img src={card.student.photoUrl} alt={card.student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-8 h-8 text-muted-foreground m-auto mt-4" />
                                        )}
                                    </div>
                                    <h3 className="text-sm truncate w-full">{card.student?.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono mt-1">{card.cardNumber}</p>
                                    {card.student?.section && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {card.student.section.class.name} - {card.student.section.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selection indicator */}
                            <div
                                className={cn(
                                    'absolute top-2 left-2 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
                                    selectedCards.includes(card.id)
                                        ? 'bg-primary border-primary'
                                        : 'bg-background border-input'
                                )}
                            >
                                {selectedCards.includes(card.id) && (
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
                                {card.pdfUrl && (
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(card.pdfUrl, '_blank'); }}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                )}
                                {card.status === 'active' ? (
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setActionId({ id: card.id, type: 'suspend' }); }}>
                                        <Ban className="w-4 h-4 text-amber-500" />
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setActionId({ id: card.id, type: 'reactivate' }); }}>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </Button>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-card border-t border-border">
                                <p className="font-medium text-sm text-foreground truncate">
                                    {card.student?.name}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-muted-foreground">{card.student?.admissionNumber}</span>
                                    <span
                                        className={cn(
                                            'text-xs px-1.5 py-0.5 rounded capitalize font-medium',
                                            card.status === 'active'
                                                ? 'pill-green'
                                                : 'pill-temple'
                                        )}
                                    >
                                        {card.status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.meta && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {data.meta.totalPages || 1}
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
                            disabled={page >= (data.meta.totalPages || 1)}
                            onClick={() => setPage((p) => Math.min(data.meta.totalPages || 1, p + 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            <GenerateDocsModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title="Generate Library Cards"
                description="Select a class and section to generate library cards."
                serviceType="library_card"
                institutionId={institutionId || undefined}
                submitLabel="Generate"
                onGenerate={async ({ studentIds, institutionId: inst, templateId }) => {
                    const res: any = await generateBulkAsync({ institutionId: inst, data: { studentIds: studentIds || [], templateId } });
                    const body = res?.data ?? res;
                    return { successful: body?.successful?.length ?? 0, failed: body?.failed?.length ?? 0 };
                }}
            />

            <AlertDialog open={!!actionId} onOpenChange={() => setActionId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionId?.type === 'suspend'
                                ? "This will suspend the library card. The student won't be able to issue books using this card until reactivated."
                                : "This will reactivate the library card."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={actionId?.type === 'suspend' ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                            onClick={handleAction}
                        >
                            {actionId?.type === 'suspend' ? 'Suspend' : 'Reactivate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
