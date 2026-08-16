import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Upload,
    Users,
    Scan,
    Check,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useGroupPhotos, useCreateGroupPhoto, useExtractFaces, GroupPhoto } from '@/lib/queries';
import { FaceMappingModal } from './components/FaceMappingModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function GroupPhotosPage() {
    const { toast } = useToast();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedPhoto, setSelectedPhoto] = useState<GroupPhoto | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useGroupPhotos({
        page,
        limit: 9, // Grid layout
        search,
    });

    const createMutation = useCreateGroupPhoto();

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Mock upload - in real app would upload to S3/Cloudinary first
        // Then create record
        try {
            await createMutation.mutateAsync({
                name: file.name.split('.')[0],
                photoUrl: URL.createObjectURL(file), // Temporary mock URL
                institutionId: 'inst-123', // TODO: Get from context
                status: 'pending',
                processingStatus: 'uploaded',
            });

            toast({
                title: 'Photo uploaded',
                description: 'Group photo has been uploaded and queued for processing.',
            });
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: 'Could not save photo info.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const extractMutation = useExtractFaces();

    const handleExtractFaces = async (photoId: string) => {
        try {
            toast({
                title: 'Face extraction started',
                description: 'This may take a few seconds...',
            });
            await extractMutation.mutateAsync(photoId);
            toast({
                title: 'Face extraction completed',
                description: 'Faces have been detected and extracted.',
            });
        } catch (error) {
            toast({
                title: 'Extraction failed',
                description: 'Could not extract faces.',
                variant: 'destructive',
            });
        }
    };

    const handleMatchStudents = async (photoId: string) => {
        const photo = data?.data?.find(p => p.id === photoId);
        if (photo) {
            setSelectedPhoto(photo);
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Group Photos' },
                ]}
                title="Group Photos"
                description="Upload, process, and extract individual photos"
                action={
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        <Button asChild disabled={isUploading}>
                            <span>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                Upload Photo
                            </span>
                        </Button>
                    </label>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <StatCard title="Total Photos" value={data?.pagination?.total || 0} icon={ImageIcon} tone="teal" />
                <StatCard title="Faces Detected" value="-" icon={Users} tone="gold" />
                <StatCard title="Matched" value="-" icon={Check} tone="saffron" />
                <StatCard title="Pending Review" value="-" icon={Scan} tone="indigo" />
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by event name or class…"
                    className="h-11 rounded-xl pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Photos Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : data?.data?.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No group photos"
                    description="Upload your first group photo to start extracting individual student photos."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {data?.data?.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="indic-card rounded-2xl overflow-hidden group">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-muted">
                                    {photo.thumbnailUrl || photo.photoUrl ? (
                                        <img
                                            src={photo.thumbnailUrl || photo.photoUrl}
                                            alt={photo.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users className="w-12 h-12 text-muted-foreground/40" />
                                        </div>
                                    )}

                                    {/* Status badge */}
                                    <div
                                        className={cn(
                                            'absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium',
                                            statusColors[photo.status] || statusColors.pending
                                        )}
                                    >
                                        {photo.status}
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(photo)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleExtractFaces(photo.id)}>
                                            <Scan className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="secondary">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-base line-clamp-1">
                                        {photo.name}
                                    </h3>
                                    {photo.eventName && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">{photo.eventName}</p>
                                    )}

                                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                        {photo.class && <span>{photo.class.name}</span>}
                                        {photo.section && <span>• {photo.section.name}</span>}
                                        <span>• {photo._count?.extractions || 0} faces</span>
                                    </div>

                                    {/* Actions */}
                                    {photo.status === 'completed' && (
                                        <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleMatchStudents(photo.id)}>
                                                <Users className="w-4 h-4 mr-1" />
                                                Match
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedPhoto(photo)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
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
            <FaceMappingModal
                isOpen={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                photo={selectedPhoto}
            />
        </div>
    );
}
