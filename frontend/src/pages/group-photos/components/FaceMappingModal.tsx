import { useState, useRef, useEffect } from 'react';
import { Search, Check, User as UserIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GroupPhoto, useGroupPhotoFaces, useUpdateFaceMapping, useStudents } from '@/lib/queries';
import { cn } from '@/lib/utils';

interface FaceMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    photo: GroupPhoto | null;
}

export function FaceMappingModal({ isOpen, onClose, photo }: FaceMappingModalProps) {
    const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const imageRef = useRef<HTMLImageElement>(null);

    const { data: faces, isLoading: isLoadingFaces } = useGroupPhotoFaces(photo?.id || '');
    const updateMapping = useUpdateFaceMapping();
    const { data: studentsData } = useStudents({ search: searchQuery, limit: '10' });

    // Reset selection when photo changes or closes
    useEffect(() => {
        if (!isOpen) setSelectedFaceId(null);
    }, [isOpen]);

    if (!photo) return null;

    const handleAssignStudent = async (faceId: string, studentId: string) => {
        try {
            await updateMapping.mutateAsync({ id: faceId, studentId });
            setSelectedFaceId(null); // Close popover
        } catch (error) {
            console.error('Failed to update mapping', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>{photo.name}</DialogTitle>
                    <DialogDescription>
                        Click on a face to assign a student. ({faces?.filter(f => f.isMatched).length || 0}/{faces?.length || 0} matched)
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Image Area */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-auto flex items-center justify-center">
                        <div className="relative inline-block">
                            <img
                                ref={imageRef}
                                src={photo.photoUrl}
                                alt={photo.name}
                                className="max-w-full max-h-[80vh] object-contain"
                            />

                            {/* Face Overlays */}
                            {!isLoadingFaces && faces?.map((face) => {
                                // Calculate position percentages if dimensions are known, 
                                // assuming x,y,width,height are relative (0-1) or absolute pixels.
                                // If backend returns absolute pixels, we need to scale based on displayed image size.
                                // For simplicity, let's assume backend returns absolute pixels matching the original image resolution.
                                // We need to handle scaling.
                                // A robust way is to use percentages from backend or calculate them here if we know original dims.
                                // Let's assume for this mock/implementation that x,y,w,h are percentages (0-1).
                                // If they are pixels, we'd need image natural dimensions.

                                const style = {
                                    left: `${face.x * 100}%`,
                                    top: `${face.y * 100}%`,
                                    width: `${face.width * 100}%`,
                                    height: `${face.height * 100}%`,
                                };

                                return (
                                    <Popover key={face.id} open={selectedFaceId === face.id} onOpenChange={(open: boolean) => setSelectedFaceId(open ? face.id : null)}>
                                        <PopoverTrigger asChild>
                                            <div
                                                className={cn(
                                                    "absolute border-2 cursor-pointer transition-colors hover:bg-white/20",
                                                    face.isMatched ? "border-green-500" : "border-red-500",
                                                    selectedFaceId === face.id && "ring-2 ring-blue-500 z-10"
                                                )}
                                                style={style}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFaceId(face.id);
                                                }}
                                            >
                                                {face.isMatched && (
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-1 rounded whitespace-nowrap">
                                                        {face.student?.name}
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" side="right" align="start">
                                            <div className="p-3 border-b">
                                                <h4 className="font-medium mb-2">Assign Student</h4>
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Search student..."
                                                        className="pl-8"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <ScrollArea className="h-64">
                                                <div className="p-1">
                                                    {studentsData?.data?.map((student) => (
                                                        <Button
                                                            key={student.id}
                                                            variant="ghost"
                                                            className="w-full justify-start font-normal"
                                                            onClick={() => handleAssignStudent(face.id, student.id)}
                                                        >
                                                            <div className="flex items-center gap-2 w-full overflow-hidden">
                                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                    {student.photoUrl ? (
                                                                        <img src={student.photoUrl} className="w-full h-full rounded-full object-cover" />
                                                                    ) : (
                                                                        <UserIcon className="w-3 h-3 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 text-left truncate">
                                                                    <div className="truncate">{student.name}</div>
                                                                    <div className="text-xs text-gray-500">{(student as {admissionNumber?: string; admissionNo?: string}).admissionNumber || (student as {admissionNumber?: string; admissionNo?: string}).admissionNo}</div>
                                                                </div>
                                                                {face.studentId === student.id && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                                                            </div>
                                                        </Button>
                                                    ))}
                                                    {studentsData?.data?.length === 0 && (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No students found.
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar / Gallery Preview (Optional, for now just image focus) */}
                </div>
            </DialogContent>
        </Dialog>
    );
}
