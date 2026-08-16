import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    FileText,
    CreditCard,
    Award,
    ClipboardList,
    BarChart3,
    Library,
    FileCheck,
    Users,
    Eye,
    Edit,
    Copy,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Contact,
    Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTemplates, useSetDefaultTemplate, type Template, useDeleteTemplate, useDuplicateTemplate } from '@/lib/queries/templates/template-queries';

const serviceTypeIcons: Record<string, React.ElementType> = {
    id_card: CreditCard,
    certificate: Award,
    group_photo: Users,
    hall_ticket: ClipboardList,
    marksheet: BarChart3,
    library_card: Library,
    transfer_certificate: FileCheck,
    portfolio: FileText,
    visiting_card: Contact,
};

export default function TemplatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

    const { data, isLoading } = useTemplates({
        page: page.toString(),
        limit: '12',
        serviceType: (selectedType || undefined) as never,
        targetAudience: (selectedAudience || undefined) as never,
        search: searchQuery || undefined,
    });

    const setDefaultTemplateMutation = useSetDefaultTemplate();
    const deleteMutation = useDeleteTemplate();
    const duplicateMutation = useDuplicateTemplate();

    const handleSetDefault = async (templateId: string) => {
        try {
            await setDefaultTemplateMutation.mutateAsync(templateId);
            toast.success('Template set as default successfully');
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        } catch {
            toast.error('Failed to set template as default');
        }
    };

    const handleDelete = async (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await deleteMutation.mutateAsync(templateId);
                toast.success('Template deleted successfully');
            } catch (error: any) {
                const message = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete template';
                toast.error(message);
            }
        }
    };

    const handleDuplicate = async (templateId: string) => {
        try {
            await duplicateMutation.mutateAsync(templateId);
            toast.success('Template duplicated successfully');
        } catch {
            toast.error('Failed to duplicate template');
        }
    };

    const serviceTypes = [
        { value: 'id_card', label: 'ID Cards' },
        { value: 'visiting_card', label: 'Visiting Cards' },
        { value: 'certificate', label: 'Certificates' },
        { value: 'hall_ticket', label: 'Hall Tickets' },
        { value: 'marksheet', label: 'Marksheets' },
        { value: 'library_card', label: 'Library Cards' },
        { value: 'transfer_certificate', label: 'Transfer Certs' },
    ];

    const audienceTypes = [
        { value: 'ALL', label: 'All Users' },
        { value: 'STUDENT', label: 'Students' },
        { value: 'TEACHER', label: 'Teachers' },
        { value: 'ADMIN', label: 'Admin' },
    ];

    const chipStyle = (active: boolean) => active
        ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'transparent' }
        : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' };

    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Templates' },
                ]}
                title="Templates"
                description="Manage document templates for all services"
                action={
                    <Button onClick={() => navigate('/app/templates/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                }
            />

            {/* Filters + Search */}
            <div className="flex flex-col gap-2.5 mb-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl pl-10"
                    />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    <button
                        onClick={() => setSelectedType(null)}
                        className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
                        style={chipStyle(!selectedType)}
                    >
                        All Templates
                    </button>
                    {serviceTypes.map((type) => {
                        const Icon = serviceTypeIcons[type.value];
                        return (
                            <button
                                key={type.value}
                                onClick={() => setSelectedType(type.value)}
                                className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors inline-flex items-center gap-1.5"
                                style={chipStyle(selectedType === type.value)}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {type.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-1.5 flex-wrap pt-2 border-t border-border">
                    <button
                        onClick={() => setSelectedAudience(null)}
                        className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
                        style={!selectedAudience ? { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' } : { background: 'transparent', color: 'hsl(var(--muted-foreground))', borderColor: 'transparent' }}
                    >
                        Any Audience
                    </button>
                    {audienceTypes.map((audience) => (
                        <button
                            key={audience.value}
                            onClick={() => setSelectedAudience(audience.value)}
                            className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
                            style={selectedAudience === audience.value ? { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' } : { background: 'transparent', color: 'hsl(var(--muted-foreground))', borderColor: 'transparent' }}
                        >
                            {audience.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState
                            icon={FileText}
                            title="No Templates Yet"
                            description="Create your first template to get started."
                            action={{ label: 'Create Template', onClick: () => navigate('/app/templates/new') }}
                        />
                    </div>
                ) : (
                    data?.data?.map((template: Template) => {
                        const Icon = serviceTypeIcons[template.serviceType] || FileText;
                        return (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="group indic-card overflow-hidden rounded-2xl"
                            >
                                {/* Header — icon on the accent gradient */}
                                <div className="h-24 relative bg-gradient-to-br from-primary to-primary/70">
                                    <div className="absolute inset-0 bg-black/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-10 h-10 text-primary-foreground/80" />
                                    </div>

                                    {template.isDefault && (
                                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur rounded text-xs text-white font-medium">
                                            Default
                                        </div>
                                    )}

                                    <div
                                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                        style={{ background: template.isActive ? '#15803d' : '#C0392B' }}
                                    />
                                </div>

                                <div className="p-4">
                                    <h3 className="text-base line-clamp-1">{template.name}</h3>

                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                                        {template.description || 'No description'}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                                        <span className="capitalize">{template.targetAudience?.toLowerCase() || 'all'}</span>
                                        <span>•</span>
                                        <span>{template.widthMm}×{template.heightMm}mm</span>
                                        <span>•</span>
                                        <span className="capitalize">{template.orientation}</span>
                                    </div>

                                    <div className="flex items-center gap-1 flex-wrap mt-4 pt-3 border-t border-border">
                                        <Button size="sm" variant="ghost" className="flex-1" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                            <Eye className="w-4 h-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleSetDefault(template.id)} disabled={setDefaultTemplateMutation.isPending || template.isDefault} title="Set Default">
                                            <Star className="w-4 h-4" style={template.isDefault ? { fill: 'var(--gold)', color: 'var(--gold)' } : undefined} />
                                        </Button>
                                        <Button size="sm" variant="ghost" title="Edit" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" title="Duplicate" onClick={() => handleDuplicate(template.id)} disabled={duplicateMutation.isPending}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(template.id)} disabled={deleteMutation.isPending}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= data.pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
