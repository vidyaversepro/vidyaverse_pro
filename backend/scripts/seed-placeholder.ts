import sharp from 'sharp';
import { initializeMinio, uploadToMinio } from '../src/config/minio.js';

async function seed() {
    await initializeMinio();
    console.log('Generating placeholder image...');
    
    // Create a 413x531 gray WebP placeholder image with some dummy text if possible, but a solid color is fine
    const buffer = await sharp({
        create: {
            width: 413,
            height: 531,
            channels: 3,
            background: { r: 220, g: 220, b: 220 }
        }
    })
    .webp({ quality: 80 })
    .toBuffer();

    console.log('Uploading placeholder to MinIO...');
    await uploadToMinio('photos/placeholders/default.webp', buffer, 'image/webp');
    console.log('Successfully seeded photos/placeholders/default.webp');
    
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
