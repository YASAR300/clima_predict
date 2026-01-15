import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { uploadToCloudinary } from '@/utils/cloudinary';

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file');
        const extension = formData.get('extension') || 'webm';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, {
            folder: 'clima-predict/voice-notes',
            resourceType: 'video', // Audio files are treated as video in Cloudinary
            publicId: `${userId}-${Date.now()}`
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

