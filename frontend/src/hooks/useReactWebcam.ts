import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

export function useReactWebcam() {
    const webcamRef = useRef<Webcam>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const startCamera = useCallback(() => setIsCameraActive(true), []);
    const stopCamera = useCallback(() => setIsCameraActive(false), []);

    const capturePhoto = useCallback(() => {
        if (!webcamRef.current) return null;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return null;

        // Convert base64 dataUrl to File object for unified multipart upload
        const arr = imageSrc.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        
        return new File([u8arr], 'webcam-capture.jpg', { type: mime });
    }, []);

    return { webcamRef, isCameraActive, startCamera, stopCamera, capturePhoto };
}
