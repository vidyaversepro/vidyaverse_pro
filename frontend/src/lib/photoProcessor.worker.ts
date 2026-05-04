/// <reference lib="webworker" />

// Since opencv.js is massive, we either load it dynamically from CDN or assume it's exposed globally.
// In a web worker, we load scripts using importScripts.
const OPENCV_URL = 'https://docs.opencv.org/4.8.0/opencv.js';

// We wait for OpenCV to be ready
let cvReady = false;

// Mock definition for CV so TypeScript knows about it if typings aren't perfectly injected.
declare var cv: any;

self.onmessage = async (e: MessageEvent) => {
    const { action, payload, id } = e.data;

    if (action === 'INIT') {
        try {
            if (!cvReady) {
                // Initialize OpenCV.js
                importScripts(OPENCV_URL);
                cv.onRuntimeInitialized = () => {
                    cvReady = true;
                    self.postMessage({ id, status: 'SUCCESS', type: 'INIT_DONE' });
                };
            } else {
                self.postMessage({ id, status: 'SUCCESS', type: 'INIT_DONE' });
            }
        } catch (error) {
            self.postMessage({ id, status: 'ERROR', error: 'Failed to load OpenCV.js' });
        }
        return;
    }

    if (!cvReady) {
        self.postMessage({ id, status: 'ERROR', error: 'OpenCV not initialized' });
        return;
    }

    if (action === 'PROCESS_IMAGE') {
        const { imageData, brightnessParams } = payload;

        try {
            // Load imageData into OpenCV Mat
            const mat = cv.matFromImageData(imageData);

            // Auto Enhance: Histogram Equalization for contrast & brightness
            const enhancedMat = new cv.Mat();

            if (mat.channels() === 4) { // RGBA
                cv.cvtColor(mat, enhancedMat, cv.COLOR_RGBA2RGB); // Convert to RGB
            } else {
                mat.copyTo(enhancedMat);
            }

            // Convert to YCrCb coloring to just equalize the Y (luminance) channel independently of hue/sat
            const ycrcbMat = new cv.Mat();
            cv.cvtColor(enhancedMat, ycrcbMat, cv.COLOR_RGB2YCrCb);

            const channels = new cv.MatVector();
            cv.split(ycrcbMat, channels);

            // Equalize the Y channel
            const yChannel = channels.get(0);

            // Adjust brightness/contrast if manual override is provided
            if (brightnessParams) {
                const alpha = brightnessParams.contrast || 1.2; // Contrast multiplier (1.0-3.0)
                const beta = brightnessParams.brightness || 10; // Brightness offset (-100 to 100)
                yChannel.convertTo(yChannel, -1, alpha, beta);
            } else {
                // CLAHE (Contrast Limited Adaptive Histogram Equalization)
                const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
                clahe.apply(yChannel, yChannel);
                clahe.delete();
            }

            // Merge back
            cv.merge(channels, ycrcbMat);

            // Back to RGB
            const finalRgb = new cv.Mat();
            cv.cvtColor(ycrcbMat, finalRgb, cv.COLOR_YCrCb2RGB);

            // Back to RGBA for canvas ImageData drawing
            const finalRgba = new cv.Mat();
            cv.cvtColor(finalRgb, finalRgba, cv.COLOR_RGB2RGBA);

            // Extract the bytes and construct a new ImageData object
            const resultBytes = new Uint8ClampedArray(finalRgba.data);
            const resultImageData = new ImageData(resultBytes, finalRgba.cols, finalRgba.rows);

            // Cleanup
            mat.delete();
            enhancedMat.delete();
            ycrcbMat.delete();
            channels.delete();
            yChannel.delete();
            finalRgb.delete();
            finalRgba.delete();

            // Post result back
            self.postMessage({ id, status: 'SUCCESS', type: 'IMAGE_PROCESSED', payload: resultImageData });
        } catch (error: any) {
            self.postMessage({ id, status: 'ERROR', error: error.message });
        }
    }
};
