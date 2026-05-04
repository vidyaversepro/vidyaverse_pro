import { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Camera, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const MAX_FILE_SIZE_MB = 5;
const COMPRESS_THRESHOLD_MB = 1.5;
const MAX_COMPRESSED_SIZE_MB = 1.5;
const MAX_WIDTH_OR_HEIGHT = 1500;

export default function StudentPhotoUploadPage() {
    const { token } = useParams<{ token: string }>();

    const [photoMode, setPhotoMode] = useState<'choose' | 'camera' | 'preview'>('choose');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);

    // Fetch draft to guarantee the token is valid before showing the form
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['student-draft', token],
        queryFn: async () => {
            const res = await api.get(`/onboard/${token}`);
            return res.data;
        },
        retry: 0
    });

    const student = responseData?.data || responseData;

    const saveMutation = useMutation({
        mutationFn: async (photoUrl: string) => {
            const res = await api.patch(`/onboard/${token}/save-tab`, {
                tab: 'photo',
                data: { photoUrl }
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Photo uploaded successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to save photo. Please try again.');
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type. Please upload an image (JPG, PNG, or WEBP).');
            return;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        let processedFile: File | Blob = file;

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
                processedFile = file;
            } finally {
                setIsCompressing(false);
            }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const url = reader.result as string;
            setPreviewUrl(url);
            setPhotoMode('preview');
        };
        reader.readAsDataURL(processedFile);
    };

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreviewUrl(imageSrc);
            setPhotoMode('preview');
        }
    }, []);

    const clearPhoto = () => {
        setPreviewUrl(null);
        setPhotoMode('choose');
    };

    const handleSave = () => {
        if (!previewUrl) return;
        saveMutation.mutate(previewUrl);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (isError || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-red-200 dark:border-red-900/30 w-full max-w-sm">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 dark:text-gray-300">This photo upload link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    if (saveMutation.isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="text-center p-8 bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md flex flex-col items-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Photo Uploaded!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for providing the photograph for <strong>{student.name}</strong>. You may now close this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center">
            {/* Header */}
            <div className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {student.institution?.logoUrl ? (
                        <img src={student.institution.logoUrl} alt="Institution Logo" className="h-8 w-auto" />
                    ) : (
                        <div className="bg-primary text-white font-bold w-10 h-10 rounded-lg flex items-center justify-center">
                            {student.institution?.name?.[0] || 'V'}
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{student.institution?.name || 'Institution'}</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">PHOTO COLLECTION</p>
                    </div>
                </div>
            </div>

            {/* Container */}
            <div className="w-full max-w-md px-4 pb-12">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">Upload Photo</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">For <strong>{student.name}</strong></p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    {photoMode === 'choose' && (
                        <div className="flex flex-col gap-4">
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                                {isCompressing ? (
                                    <div className="flex flex-col items-center text-primary">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                        <span className="text-sm font-medium">Optimizing image...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">No photo selected</p>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full h-12"
                                    onClick={() => setPhotoMode('camera')}
                                    disabled={isCompressing}
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Photo
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full h-12 relative overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isCompressing}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <p className="text-xs text-center text-gray-500">Max size 5MB. JPG, PNG, WEBP.</p>
                        </div>
                    )}

                    {photoMode === 'camera' && (
                        <div className="flex flex-col gap-4">
                            <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "user" }}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
                                    <Button type="button" size="icon" className="h-14 w-14 rounded-full border-4 border-white bg-transparent hover:bg-white/20" onClick={capturePhoto}>
                                        <span className="sr-only">Take photo</span>
                                    </Button>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" onClick={() => setPhotoMode('choose')}>
                                Cancel
                            </Button>
                        </div>
                    )}

                    {photoMode === 'preview' && previewUrl && (
                        <div className="flex flex-col gap-4">
                            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-black">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute top-2 right-2">
                                    <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm opacity-80 hover:opacity-100" onClick={clearPhoto}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                className="w-full h-12 text-lg" 
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Submit Photo
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
