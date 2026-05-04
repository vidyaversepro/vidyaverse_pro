import { useState, useRef, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, User, CheckCircle2, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

// File size limits
const MAX_FILE_SIZE_MB = 5;       // Hard reject above this
const COMPRESS_THRESHOLD_MB = 1.5; // Compress files above this
const MAX_COMPRESSED_SIZE_MB = 1.5; // Target after compression
const MAX_WIDTH_OR_HEIGHT = 1500;   // Max dimension (preserves quality for ID cards/certificates)

export function PhotoTab({ studentId: _studentId, mode: _mode }: { studentId: string, mode: 'admin' | 'selfservice' | 'volunteer' | 'view' }) {
    const { control, setValue, watch } = useFormContext();
    const currentPhotoUrl = watch('photoUrl');

    const [photoMode, setPhotoMode] = useState<'choose' | 'camera' | 'preview'>('choose');
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);

    // Sync external changes to form state (e.g. async data loaded from backend or switching students) into local state
    useEffect(() => {
        if (currentPhotoUrl && currentPhotoUrl !== previewUrl) {
            setPreviewUrl(currentPhotoUrl);
            setPhotoMode('preview');
        } else if (!currentPhotoUrl && previewUrl) {
            setPreviewUrl(null);
            setPhotoMode('choose');
        }
    }, [currentPhotoUrl, previewUrl]);

    // Handle file upload with size validation and compression
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type. Please upload an image (JPG, PNG, or WEBP).');
            return;
        }

        // Hard size limit — reject outright
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        let processedFile: File | Blob = file;

        // Compress if above threshold — prevents base64 inflation (~33%) from exceeding server body limit
        if (file.size > COMPRESS_THRESHOLD_MB * 1024 * 1024) {
            try {
                setIsCompressing(true);
                processedFile = await imageCompression(file, {
                    maxSizeMB: MAX_COMPRESSED_SIZE_MB,
                    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
                    useWebWorker: true,
                    fileType: 'image/jpeg',
                });
                const savedPct = ((1 - processedFile.size / file.size) * 100).toFixed(0);
                toast.success(`Photo optimized (${savedPct}% smaller) — ready to upload.`);
            } catch (err) {
                console.error('Image compression failed, using original:', err);
                processedFile = file; // Fallback to original
            } finally {
                setIsCompressing(false);
            }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const url = reader.result as string;
            setPreviewUrl(url);
            setValue('photoUrl', url, { shouldValidate: true });
            setPhotoMode('preview');
        };
        reader.readAsDataURL(processedFile);
    };

    // Capture from webcam
    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreviewUrl(imageSrc);
            setValue('photoUrl', imageSrc, { shouldValidate: true });
            setPhotoMode('preview');
        }
    }, [setValue]);

    // Clear photo
    const clearPhoto = () => {
        setPreviewUrl(null);
        setValue('photoUrl', '', { shouldValidate: true });
        setPhotoMode('choose');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Student Photograph</h3>
                <p className="text-sm text-gray-500">
                    Upload a photo or use your camera to capture a clear, front-facing photo.
                </p>
            </div>

            <FormField
                control={control}
                name="photoUrl"
                render={() => (
                    <FormItem>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Compression loading overlay */}
                        {isCompressing && (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Optimizing photo quality…</p>
                            </div>
                        )}

                        {/* CHOOSE MODE: Two buttons */}
                        {photoMode === 'choose' && !previewUrl && !isCompressing && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-8">
                                <div className="w-32 h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    <User className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-16 text-base gap-3 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-5 h-5 text-indigo-500" />
                                        Upload Photo
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-16 text-base gap-3 border-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 transition-all"
                                        onClick={() => setPhotoMode('camera')}
                                    >
                                        <Camera className="w-5 h-5 text-emerald-500" />
                                        Click Photo
                                    </Button>
                                </div>

                                <p className="text-xs text-gray-400 text-center">
                                    Supported formats: JPG, PNG, WEBP — Max 5MB (auto-compressed for best quality)
                                </p>
                            </div>
                        )}

                        {/* CAMERA MODE */}
                        {photoMode === 'camera' && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-w-sm mx-auto shadow-lg">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            facingMode: 'user',
                                            width: 720,
                                            height: 960,
                                        }}
                                        className="w-full h-full object-cover"
                                        mirrored
                                    />
                                    {/* Face guide overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-48 h-60 border-2 border-dashed border-white/40 rounded-[40%]" />
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setPhotoMode('choose')}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={capturePhoto}
                                        size="lg"
                                        className="px-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <Camera className="w-5 h-5" />
                                        Capture
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* PREVIEW MODE */}
                        {(photoMode === 'preview' || previewUrl) && photoMode !== 'camera' && previewUrl && (
                            <div className="flex flex-col items-center space-y-4 py-4">
                                <div className="relative group">
                                    <div className="w-48 h-60 rounded-2xl overflow-hidden shadow-xl border-4 border-emerald-200 dark:border-emerald-800">
                                        <img
                                            src={previewUrl}
                                            alt="Student photo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearPhoto}
                                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Photo Ready
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Change (Upload)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setPreviewUrl(null); setPhotoMode('camera'); }}
                                        className="gap-2"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Retake (Camera)
                                    </Button>
                                </div>
                            </div>
                        )}

                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
