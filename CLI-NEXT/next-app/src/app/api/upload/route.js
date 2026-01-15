import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { uploadToCloudinary } from '@/utils/cloudinary';

/**
 * General media upload endpoint for images, videos, and other files
 * Supports: Profile pictures, group logos, post images, etc.
 */
export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'image'; // 'image', 'video', 'raw'
        const folder = formData.get('folder') || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine resource type
        let resourceType = 'auto';
        if (type === 'image') resourceType = 'image';
        else if (type === 'video') resourceType = 'video';
        else if (type === 'raw') resourceType = 'raw';

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, {
            folder: `clima-predict/${folder}`,
            resourceType,
            publicId: `${userId}-${Date.now()}`
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        });
    } catch (error) {
        console.error('Media upload error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error.message
        }, { status: 500 });
    }
}
