import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Download,
    Award,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCertificates, useGenerateBulkCertificates, type Certificate } from '@/lib/queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';
import { DocumentPreviewCrest } from '@/components/printables/DocumentPreviewCrest';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function CertificatesPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const institutionId = usePageInstitution();
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [certType, setCertType] = useState('academic_excellence');
    const [certTitle, setCertTitle] = useState('');
    const [certDesc, setCertDesc] = useState('');
    const generateBulk = useGenerateBulkCertificates();

    const { data, isLoading } = useCertificates({
        page: page.toString(),
        limit: '12',
        certificateType: (selectedType || undefined) as never,
    });

    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Certificates' },
                ]}
                title="Certificates"
                description="Create and manage student certificates"
                action={
                    <Button onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Create Certificate</span>
                        <span className="sm:hidden">Create</span>
                    </Button>
                }
            />

            {/* Type Filters + Search */}
            <div className="flex flex-col gap-2.5 mb-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search certificates…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl pl-10"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {['all', 'merit', 'participation', 'achievement', 'sports', 'cultural'].map((type) => {
                        const active = selectedType === type || (type === 'all' && !selectedType);
                        return (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type === 'all' ? null : type)}
                                className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
                                style={active
                                    ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'transparent' }
                                    : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}
                            >
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Certificates Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : data?.data?.length === 0 ? (
                <EmptyState
                    icon={Award}
                    title="No certificates yet"
                    description="Create your first certificate to get started."
                    action={{ label: 'Create Certificate', onClick: () => setIsGenerateOpen(true) }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {data?.data?.map((certificate: Certificate) => (
                        <motion.div
                            key={certificate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="group indic-card overflow-hidden rounded-2xl"
                        >
                            {/* Preview — the hero */}
                            <div className="relative h-36">
                                {certificate.thumbnailUrl ? (
                                    <img
                                        src={certificate.thumbnailUrl}
                                        alt={certificate.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <DocumentPreviewCrest label={certificate.certificateType} />
                                )}

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => window.open(certificate.pdfUrl, '_blank')}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Type badge */}
                                <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 bg-primary/10 text-primary border border-primary/20 capitalize">
                                    {certificate.certificateType}
                                </span>

                                {/* Title */}
                                <h3 className="text-base line-clamp-1">{certificate.title}</h3>

                                {/* Student */}
                                <p className="text-sm text-muted-foreground mt-1">
                                    {certificate.student?.firstName} {certificate.student?.lastName}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    {certificate.eventName && (
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-3 h-3" />
                                            <span className="truncate max-w-[120px]">{certificate.eventName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(certificate.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Certificate number */}
                                <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs font-mono text-muted-foreground">{certificate.certificateNo}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * data.pagination.limit + 1} to{' '}
                        {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                        {data.pagination.total} certificates
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

            <GenerateDocsModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                title="Generate Certificates"
                description="Issue the same certificate to every student in the selected scope."
                serviceType="certificate"
                institutionId={institutionId}
                canSubmit={!!certTitle.trim()}
                submitLabel="Generate Certificates"
                onGenerate={async ({ studentIds, templateId }) => {
                    const safeStudentIds = studentIds || [];
                    const res: any = await generateBulk.mutateAsync({
                        studentIds: safeStudentIds,
                        certificateType: certType,
                        title: certTitle.trim(),
                        description: certDesc.trim() || undefined,
                        templateId,
                    });
                    const body = res?.data ?? res;
                    return {
                        successful: body?.successful?.length ?? safeStudentIds.length,
                        failed: body?.failed?.length ?? 0,
                    };
                }}
            >
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Certificate Type</label>
                    <select
                        className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                        value={certType}
                        onChange={(e) => setCertType(e.target.value)}
                    >
                        <option value="academic_excellence">Academic Excellence</option>
                        <option value="topper">Topper</option>
                        <option value="sports">Sports</option>
                        <option value="cultural">Cultural</option>
                        <option value="attendance">Attendance</option>
                        <option value="character">Character</option>
                        <option value="scholarship">Scholarship</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                        Title <span className="text-destructive">*</span>
                    </label>
                    <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="e.g. Certificate of Academic Excellence" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                        className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                        rows={3}
                        value={certDesc}
                        onChange={(e) => setCertDesc(e.target.value)}
                        placeholder="Body text shown on the certificate"
                    />
                </div>
            </GenerateDocsModal>
        </div>
    );
}
