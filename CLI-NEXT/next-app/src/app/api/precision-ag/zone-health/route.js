import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import prisma from '@/utils/prisma';

// Import services (using dynamic import for Next.js compatibility)
const getZoneHealthScoreEngine = async () => {
    const module = await import('@/services/zoneHealthScoreEngine');
    return module.default;
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const zoneId = searchParams.get('zoneId') || 'zone_1';
        const lat = parseFloat(searchParams.get('lat') || '28.6139');
        const lon = parseFloat(searchParams.get('lon') || '77.2090');
        const cropType = searchParams.get('cropType') || 'rice';
        const daysAfterSowing = parseInt(searchParams.get('daysAfterSowing') || '45');

        let sensorData = {};
        const sensorDataParam = searchParams.get('sensorData');
        if (sensorDataParam) {
            try { sensorData = JSON.parse(sensorDataParam); } catch (e) { console.error('Invalid sensor data:', e); }
        }

        const zoneHealthScoreEngine = await getZoneHealthScoreEngine();
        const result = await zoneHealthScoreEngine.calculateZoneHealth({
            zoneId, lat, lon, cropType, daysAfterSowing, sensorData, imageAnalysis: null
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to calculate' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Zone Health API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { zoneId, lat, lon, cropType, daysAfterSowing, sensorData = {}, imageAnalysis = null } = body;

        if (!zoneId || !lat || !lon || !cropType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const zoneHealthScoreEngine = await getZoneHealthScoreEngine();
        const result = await zoneHealthScoreEngine.calculateZoneHealth({
            zoneId, lat, lon, cropType, daysAfterSowing, sensorData, imageAnalysis
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Engine failure' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Zone Health API POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
