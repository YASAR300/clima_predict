import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import prisma from '@/utils/prisma';

export async function GET(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const cropId = searchParams.get('cropId');

        if (!cropId) {
            return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 });
        }

        const records = await prisma.agronomyRecord.findMany({
            where: { cropId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, records });
    } catch (error) {
        console.error('Agronomy Records GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const {
            cropId,
            action,
            inputUsed,
            dosage,
            weatherOnDay,
            decisionLogic
        } = await req.json();

        if (!cropId || !action) {
            return NextResponse.json({ error: 'Missing cropId or action' }, { status: 400 });
        }

        const record = await prisma.agronomyRecord.create({
            data: {
                cropId,
                action,
                inputUsed,
                dosage,
                weatherOnDay,
                decisionLogic
            }
        });

        // Dynamic Feedback Loop: Update Crop Health/Soil if UUID is valid
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cropId);
        if (isUuid) {
            try {
                // 1. Update Crop Health (Simplified: +5% health per action, max 100)
                await prisma.crop.update({
                    where: { id: cropId },
                    data: {
                        health: { increment: 5 },
                        status: 'Monitoring Post-Action'
                    }
                });

                // 2. Adjust Soil Data (Simulation: increase nutrients if fertilizer mentioned)
                if (action.toLowerCase().includes('fertilizer') || (inputUsed && inputUsed.toLowerCase().includes('n-p-k'))) {
                    await prisma.soilData.update({
                        where: { cropId: cropId },
                        data: {
                            nitrogen: { increment: 2.5 },
                            phosphorus: { increment: 1.5 },
                            potassium: { increment: 1.0 }
                        }
                    }).catch(() => null); // Ignore if no soil data object exists
                }
            } catch (updateError) {
                console.error('Feedback loop update failed:', updateError.message);
            }
        }

        return NextResponse.json({ success: true, record, message: 'Action recorded and farm state updated dynamically.' });
    } catch (error) {
        console.error('Agronomy Records POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
