import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import prisma from '@/utils/prisma';
import agronomistAI from '@/services/AgronomistAI';
import cropVisionAI from '@/services/CropVisionAI';

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const {
            cropId,
            cropType,
            growthStage,
            location,
            soilData,
            weather,
            photoBase64
        } = body;

        // 1. Get Visual Signals (Optional)
        let visualSignals = null;
        if (photoBase64) {
            visualSignals = await cropVisionAI.analyzePlantPhoto(photoBase64);
        }

        // 2. Fetch Farm History (Skip if ID is not a valid UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cropId);
        let history = [];
        if (isUuid) {
            history = await prisma.agronomyRecord.findMany({
                where: { cropId: cropId },
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
        }

        // 3. Get Expert AI Advice
        console.log('Generating AI Advice for:', { cropType, growthStage });
        const expertAdvice = await agronomistAI.getExpertAdvice({
            cropType,
            growthStage,
            location,
            soilData,
            weather,
            pestsRisk: { predictedRisk: 'moderate', details: 'Automated predictive analysis' },
            history,
            photoAnalysis: visualSignals
        });

        // 4. Record the "Decision" (Optional, for learning)
        // We could save this as a record but usually we save when the user acts.

        return NextResponse.json({
            success: true,
            data: expertAdvice,
            visualSignals
        });

    } catch (error) {
        console.error('Expert Advice API Error:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error.message,
                stack: error.stack,
                hint: 'Check GEMINI_API_KEY and DATABASE_URL in .env'
            },
            { status: 500 }
        );
    }
}
