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
import { Card, CardContent } from '@/components/ui/card';
import { useCertificates, useGenerateBulkCertificates, type Certificate } from '@/lib/queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';
import { cn } from '@/lib/utils';

const certificateTypeColors: Record<string, string> = {
    merit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    participation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    achievement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completion: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    appreciation: 'bg-[var(--peacock-teal)]/10 text-[var(--peacock-teal)] dark:bg-[var(--peacock-teal)]/20 dark:text-[var(--teal-light)]',
    custom: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Create and manage student certificates
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500" onClick={() => setIsGenerateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Certificate
                </Button>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
                {['all', 'merit', 'participation', 'achievement', 'sports', 'cultural'].map((type) => (
                    <Button
                        key={type}
                        variant={selectedType === type || (type === 'all' && !selectedType) ? 'default' : 'outline'}
                        size="sm"
                        className={
                            selectedType === type || (type === 'all' && !selectedType)
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : ''
                        }
                        onClick={() => setSelectedType(type === 'all' ? null : type)}
                    >
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Search */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search certificates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <Award className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Certificates Yet</h3>
                        <p className="text-gray-500 mt-1">Create your first certificate to get started.</p>
                    </div>
                ) : (
                    data?.data?.map((certificate: Certificate) => (
                        <motion.div
                            key={certificate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="group"
                        >
                            <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                                    {certificate.thumbnailUrl ? (
                                        <img
                                            src={certificate.thumbnailUrl}
                                            alt={certificate.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Award className="w-12 h-12 text-amber-300" />
                                        </div>
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

                                <CardContent className="p-4">
                                    {/* Type badge */}
                                    <span
                                        className={cn(
                                            'inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2',
                                            certificateTypeColors[certificate.certificateType] || certificateTypeColors.custom
                                        )}
                                    >
                                        {certificate.certificateType}
                                    </span>

                                    {/* Title */}
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                        {certificate.title}
                                    </h3>

                                    {/* Student */}
                                    <p className="text-sm text-gray-500 mt-1">
                                        {certificate.student?.firstName} {certificate.student?.lastName}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
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
                                    <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                        <p className="text-xs font-mono text-gray-400">{certificate.certificateNo}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Certificate Type</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b7102a]/20"
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="e.g. Certificate of Academic Excellence" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b7102a]/20"
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
