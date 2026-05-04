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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useGroupPhotos, useCreateGroupPhoto, useExtractFaces, GroupPhoto } from '@/lib/queries';
import { FaceMappingModal } from './components/FaceMappingModal';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Photos</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Upload, process, and extract individual photos
                    </p>
                </div>
                <div className="flex gap-2">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600" disabled={isUploading}>
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload Photo
                        </Button>
                    </label>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Photos', value: data?.pagination?.total || 0, icon: ImageIcon, color: 'from-[#E63946] to-[#C41E3A]' },
                    { label: 'Faces Detected', value: '-', icon: Users, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Matched', value: '-', icon: Check, color: 'from-green-500 to-emerald-500' },
                    { label: 'Pending Review', value: '-', icon: Scan, color: 'from-amber-500 to-orange-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="border-0 shadow-lg">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn('w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center', stat.color)}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by event name or class..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                            <Users className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Group Photos</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">
                            Upload your first group photo to start extracting individual student photos.
                        </p>
                    </div>
                ) : (
                    data?.data?.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                        >
                            <Card className="border-0 shadow-lg overflow-hidden group">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                    {photo.thumbnailUrl || photo.photoUrl ? (
                                        <img
                                            src={photo.thumbnailUrl || photo.photoUrl}
                                            alt={photo.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users className="w-12 h-12 text-gray-300" />
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

                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                        {photo.name}
                                    </h3>
                                    {photo.eventName && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{photo.eventName}</p>
                                    )}

                                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                        {photo.class && <span>{photo.class.name}</span>}
                                        {photo.section && <span>• {photo.section.name}</span>}
                                        <span>• {photo._count?.extractions || 0} faces</span>
                                    </div>

                                    {/* Actions */}
                                    {photo.status === 'completed' && (
                                        <div className="flex gap-1 mt-3 pt-3 border-t dark:border-gray-700">
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleMatchStudents(photo.id)}>
                                                <Users className="w-4 h-4 mr-1" />
                                                Match
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedPhoto(photo)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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
            <FaceMappingModal
                isOpen={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                photo={selectedPhoto}
            />
        </div>
    );
}
