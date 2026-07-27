import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Check, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export interface PhotoCaptureEditorProps {
    studentId?: string;
    currentPhotoUrl?: string;
    mode?: 'volunteer' | 'selfservice' | 'admin' | 'view';
    onSave: (file: File, previewUrl: string) => void;
    onCancel?: () => void;
}

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

export function PhotoCaptureEditor({
    currentPhotoUrl,
    mode,
    onSave,
    onCancel,
}: PhotoCaptureEditorProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [facingMode, setFacingMode] = useState(FACING_MODE_USER);

    const isReadOnly = mode === 'view';
    const hasExistingPhoto = !!currentPhotoUrl;

    const [model, setModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
    const [modelLoading, setModelLoading] = useState(true);

    const [faceDetected, setFaceDetected] = useState(false);
    const [alignmentGood, setAlignmentGood] = useState(false);

    // Auto-capture countdown logic
    const goodAlignmentFrames = useRef(0);

    // States: 'camera' -> 'preview' -> 'cropping' -> 'enhancing'
    const [captureMode, setCaptureMode] = useState<'camera' | 'preview' | 'cropping' | 'enhancing'>(
        hasExistingPhoto ? 'preview' : 'camera'
    );

    useEffect(() => {
        if (hasExistingPhoto) {
            setCaptureMode('preview');
        }
    }, [hasExistingPhoto]);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Crop state
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Enhancement state
    const [brightness, setBrightness] = useState([0]); // -100 to 100
    const [contrast, setContrast] = useState([1.2]); // 0.5 to 3.0
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const workerRef = useRef<Worker | null>(null);

    // 1. Initialize TFJS model & Web Worker
    useEffect(() => {
        let isMounted = true;

        async function loadModel() {
            try {
                const detectorModel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                const detectorConfig = {
                    runtime: 'tfjs' as const,
                    refineLandmarks: false,
                    maxFaces: 1,
                };
                const detector = await faceLandmarksDetection.createDetector(detectorModel, detectorConfig);
                if (isMounted) {
                    setModel(detector);
                    setModelLoading(false);
                }
            } catch (err) {
                console.error("Failed to load TFJS model", err);
                toast.error("Failed to load AI camera assistant. Standard capture enabled.");
                if (isMounted) setModelLoading(false);
            }
        }

        loadModel();

        // Init OpenCV worker
        workerRef.current = new Worker(new URL('../../../lib/photoProcessor.worker.ts', import.meta.url), { type: 'module' });
        workerRef.current.onmessage = (e) => {
            if (e.data.status === 'ERROR') {
                console.error('Worker error:', e.data.error);
                setIsProcessing(false);
                toast.error("Image processing failed");
                return;
            }
            if (e.data.type === 'INIT_DONE') {
                // console.log('OpenCV worker ready');
            }
            if (e.data.type === 'IMAGE_PROCESSED') {
                const imageData = e.data.payload as ImageData;
                // Convert ImageData back to data URL for display
                const canvas = document.createElement('canvas');
                canvas.width = imageData.width;
                canvas.height = imageData.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.putImageData(imageData, 0, 0);
                    setEnhancedImage(canvas.toDataURL('image/jpeg', 0.9));
                }
                setIsProcessing(false);
            }
        };

        workerRef.current.postMessage({ action: 'INIT' });

        return () => {
            isMounted = false;
            workerRef.current?.terminate();
        };
    }, []);

    // 2. Face Detection Loop
    const detectFace = useCallback(async () => {
        if (!model || captureMode !== 'camera' || !webcamRef.current || !canvasRef.current) return;

        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) return;

        try {
            const faces = await model.estimateFaces(video);

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            // Match canvas size to video
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

            if (faces.length === 1) {
                setFaceDetected(true);
                const face = faces[0];
                const box = face.box;

                // Check if face is roughly centered and large enough
                const videoCenterX = video.videoWidth / 2;
                const videoCenterY = video.videoHeight / 2;
                const faceCenterX = box.xMin + box.width / 2;
                const faceCenterY = box.yMin + box.height / 2;

                // Alignment heuristic
                const isCentered = Math.abs(videoCenterX - faceCenterX) < video.videoWidth * 0.15 &&
                    Math.abs(videoCenterY - faceCenterY) < video.videoHeight * 0.15;
                const isGoodSize = box.width > video.videoWidth * 0.25; // Face occupies at least 25% width

                // Note: TFJS MediaMesh provides 3D landmarks, could check Z-depth for pitch/yaw, 
                // but bounding box heuristic is usually sufficient for ID photos.

                if (isCentered && isGoodSize) {
                    setAlignmentGood(true);
                    ctx.strokeStyle = '#22c55e'; // Green
                    goodAlignmentFrames.current += 1;
                } else {
                    setAlignmentGood(false);
                    ctx.strokeStyle = '#eab308'; // Yellow
                    goodAlignmentFrames.current = 0;
                }

                // Draw face box for debugging (can be disabled)
                // ctx.lineWidth = 4;
                // ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);

            } else {
                setFaceDetected(false);
                setAlignmentGood(false);
                goodAlignmentFrames.current = 0;
            }
        } catch (err) {
            // Ignore frame errors silently
        }

        requestAnimationFrame(detectFace);
    }, [model, captureMode]);

    useEffect(() => {
        if (captureMode === 'camera' && !modelLoading) {
            detectFace();
        }
    }, [captureMode, modelLoading, detectFace]);

    // 3. User Actions
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setCaptureMode('cropping');
            setEnhancedImage(null);
        }
    }, [webcamRef]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT : FACING_MODE_USER);
    };

    const processPhoto = async () => {
        if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) return;
        setIsProcessing(true);

        try {
            // 1. First, crop the image on a hidden canvas
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

            const canvas = document.createElement('canvas');
            canvas.width = completedCrop.width * scaleX;
            canvas.height = completedCrop.height * scaleY;
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('No 2d context');

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // 2. Extract ImageData
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 3. Send to Worker
            workerRef.current?.postMessage({
                action: 'PROCESS_IMAGE',
                payload: {
                    imageData,
                    // If these are touched, pass them, otherwise pass null to trigger CLAHE
                    brightnessParams: (brightness[0] !== 0 || contrast[0] !== 1.2) ?
                        { brightness: brightness[0], contrast: contrast[0] } : null
                }
            });

            setCaptureMode('enhancing');

        } catch (e) {
            console.error(e);
            toast.error("Failed to process cropped photo");
            setIsProcessing(false);
        }
    };

    // Auto-retrigger worker if sliders change during 'enhancing' mode
    useEffect(() => {
        if (captureMode === 'enhancing' && !isProcessing && imgRef.current) {
            // We need to re-crop and re-send to worker with new params.
            // For performance, debounce this in a real app.
            const timer = setTimeout(() => {
                processPhoto();
            }, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brightness, contrast]);

    const saveAndSubmit = async () => {
        const finalDataUrl = enhancedImage || capturedImage;
        if (!finalDataUrl) return;

        try {
            // Convert DataURL to File object
            const res = await fetch(finalDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `student-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

            onSave(file, finalDataUrl);
        } catch (e) {
            toast.error("Failed to prepare file for upload");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            {isReadOnly && hasExistingPhoto && (
                <div className="flex flex-col items-center gap-4 py-8">
                    <img src={currentPhotoUrl} alt="Student photo" className="w-48 h-48 object-cover rounded-md shadow-md" />
                    <p className="text-sm text-gray-500 font-medium">Photo already uploaded.</p>
                </div>
            )}

            {captureMode === 'preview' && hasExistingPhoto && !isReadOnly && (
                <div className="flex flex-col items-center gap-6 py-6">
                    <h3 className="font-semibold text-lg w-full text-left">Current Photo</h3>
                    <img src={currentPhotoUrl} alt="Student photo" className="w-48 h-48 object-cover rounded-md shadow-md" />
                    <Button onClick={() => setCaptureMode('camera')} variant="secondary" className="px-8">
                        Retake Photo
                    </Button>
                </div>
            )}

            {captureMode === 'camera' && !isReadOnly && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Position Photo</h3>
                        {modelLoading && <div className="text-sm text-amber-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading AI...</div>}
                    </div>

                    <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] md:aspect-video flex items-center justify-center">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode, width: 1280, height: 720 }}
                            className="w-full h-full object-cover"
                            mirrored={facingMode === FACING_MODE_USER}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />

                        {/* ID Photo Guide Overlay */}
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10">
                            <div className="w-full h-full border-2 border-white/30 rounded-full relative overflow-hidden">
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className={`w-48 h-64 border-2 rounded-[40%] transition-colors duration-300 ${alignmentGood ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : faceDetected ? 'border-amber-400' : 'border-dashed border-white/50'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Status Bubbles */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-md ${faceDetected ? (alignmentGood ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300') : 'bg-black/50 text-white'}`}>
                                {!faceDetected ? "No face detected" : alignmentGood ? "Perfect alignment" : "Center your face"}
                            </span>

                            <Button variant="secondary" size="icon" onClick={toggleCamera} className="rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border-0 text-white">
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button onClick={capture} size="lg" className="rounded-full px-8 gap-2">
                            <Camera className="w-5 h-5" /> Capture
                        </Button>
                    </div>
                </div>
            )}

            {captureMode === 'cropping' && capturedImage && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg">Crop ID Photo</h3>
                        <p className="text-sm text-gray-500">Crop to standard passport size (3:4 ratio)</p>
                    </div>

                    <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden p-4 max-h-[500px]">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={3 / 4}
                            circularCrop={false}
                        >
                            <img ref={imgRef} src={capturedImage} alt="Crop me" className="max-h-[460px] object-contain" />
                        </ReactCrop>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCaptureMode('camera')}>Retake</Button>
                        <Button onClick={processPhoto} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Enhance"}
                        </Button>
                    </div>
                </div>
            )}

            {captureMode === 'enhancing' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg">Final Adjustments</h3>
                        <p className="text-sm text-gray-500">AI has automatically balanced the lighting. Fine-tune if necessary.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                            {isProcessing && !enhancedImage ? (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                                    <span>Applying AI Enhancements...</span>
                                </div>
                            ) : (
                                <img src={enhancedImage || capturedImage!} alt="Enhanced result" className="rounded-lg shadow-lg max-h-[350px]" />
                            )}
                        </div>

                        <div className="w-full md:w-64 space-y-8 py-4">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Brightness</label>
                                    <span className="text-sm text-gray-500">{brightness[0]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-100" max="100" step="1"
                                    value={brightness[0]}
                                    onChange={(e) => setBrightness([parseInt(e.target.value)])}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Contrast</label>
                                    <span className="text-sm text-gray-500">{contrast[0]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5" max="3" step="0.1"
                                    value={contrast[0]}
                                    onChange={(e) => setContrast([parseFloat(e.target.value)])}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => { setBrightness([0]); setContrast([1.2]); }}
                            >
                                Reset Auto
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button variant="ghost" onClick={() => setCaptureMode('cropping')}>Back to Crop</Button>
                        <Button onClick={saveAndSubmit} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="w-5 h-5" /> Save ID Photo
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
