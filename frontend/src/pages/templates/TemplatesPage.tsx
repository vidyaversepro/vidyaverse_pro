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
import { Card, CardContent } from '@/components/ui/card';
import { useTemplates, useSetDefaultTemplate, type Template, useDeleteTemplate, useDuplicateTemplate } from '@/lib/queries/templates/template-queries';
import { cn } from '@/lib/utils';

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

const serviceTypeColors: Record<string, string> = {
    id_card: 'from-[#E63946] to-[#C41E3A]',
    certificate: 'from-amber-500 to-orange-500',
    group_photo: 'from-blue-500 to-cyan-500',
    hall_ticket: 'from-red-500 to-pink-500',
    marksheet: 'from-emerald-500 to-green-500',
    library_card: 'from-indigo-500 to-blue-500',
    transfer_certificate: 'from-gray-500 to-slate-500',
    portfolio: 'from-pink-500 to-rose-500',
    visiting_card: 'from-violet-500 to-purple-600',
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage document templates for all services
                    </p>
                </div>
                <Button 
                    onClick={() => navigate('/app/templates/new')}
                    className="bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] shadow-lg shadow-red-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Service Type Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!selectedType ? 'default' : 'outline'}
                    size="sm"
                    className={!selectedType ? 'bg-gradient-to-r from-[#E63946] to-[#C41E3A]' : ''}
                    onClick={() => setSelectedType(null)}
                >
                    All Templates
                </Button>
                {serviceTypes.map((type) => {
                    const Icon = serviceTypeIcons[type.value];
                    return (
                        <Button
                            key={type.value}
                            variant={selectedType === type.value ? 'default' : 'outline'}
                            size="sm"
                            className={selectedType === type.value ? `bg-gradient-to-r ${serviceTypeColors[type.value]} text-white border-transparent` : ''}
                            onClick={() => setSelectedType(type.value)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                        </Button>
                    );
                })}
            </div>

            {/* Audience Filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                    variant={!selectedAudience ? 'secondary' : 'ghost'}
                    size="sm"
                    className={!selectedAudience ? 'bg-gray-200 dark:bg-gray-800' : 'text-gray-500'}
                    onClick={() => setSelectedAudience(null)}
                >
                    Any Audience
                </Button>
                {audienceTypes.map((audience) => (
                    <Button
                        key={audience.value}
                        variant={selectedAudience === audience.value ? 'secondary' : 'ghost'}
                        size="sm"
                        className={selectedAudience === audience.value ? 'bg-gray-200 dark:bg-gray-800' : 'text-gray-500'}
                        onClick={() => setSelectedAudience(audience.value)}
                    >
                        {audience.label}
                    </Button>
                ))}
            </div>

            {/* Search */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-[#E63946]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Templates Yet</h3>
                        <p className="text-gray-500 mt-1">Create your first template to get started.</p>
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
                                className="group"
                            >
                                <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all h-full">
                                    {/* Header with gradient */}
                                    <div
                                        className={cn(
                                            'h-24 relative bg-gradient-to-br',
                                            serviceTypeColors[template.serviceType] || 'from-gray-500 to-slate-500'
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon className="w-10 h-10 text-white/80" />
                                        </div>

                                        {/* Default badge */}
                                        {template.isDefault && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur rounded text-xs text-white font-medium">
                                                Default
                                            </div>
                                        )}

                                        {/* Status indicator */}
                                        <div
                                            className={cn(
                                                'absolute top-2 right-2 w-2 h-2 rounded-full',
                                                template.isActive ? 'bg-green-400' : 'bg-red-400'
                                            )}
                                        />
                                    </div>

                                    <CardContent className="p-4">
                                        {/* Title */}
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {template.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                                            {template.description || 'No description'}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-400">
                                            <span className="capitalize">{template.targetAudience?.toLowerCase() || 'all'}</span>
                                            <span>•</span>
                                            <span>{template.widthMm}×{template.heightMm}mm</span>
                                            <span>•</span>
                                            <span className="capitalize">{template.orientation}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-wrap mt-4 pt-3 border-t dark:border-gray-700">
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                                <Eye className="w-4 h-4 mr-1" />
                                                Preview
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleSetDefault(template.id)} disabled={setDefaultTemplateMutation.isPending || template.isDefault} title="Set Default">
                                                <Star className={cn("w-4 h-4", template.isDefault ? "fill-yellow-400 text-yellow-400" : "")} />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Edit" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Duplicate" onClick={() => handleDuplicate(template.id)} disabled={duplicateMutation.isPending}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(template.id)} disabled={deleteMutation.isPending}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
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
