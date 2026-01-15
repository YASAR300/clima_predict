import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { verifyToken } from '@/utils/auth';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');

        if (!groupId) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }

        const channels = await prisma.channel.findMany({
            where: { groupId },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ success: true, channels });
    } catch (error) {
        console.error('Channels fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { groupId, name, type } = await req.json();

        if (!groupId || !name) {
            return NextResponse.json({ error: 'Group ID and Name are required' }, { status: 400 });
        }

        const channel = await prisma.channel.create({
            data: {
                groupId,
                name: name.toLowerCase().replace(/\s+/g, '-'),
                type: type || 'TEXT'
            }
        });

        return NextResponse.json({ success: true, channel });
    } catch (error) {
        console.error('Channel creation error:', error);
        return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
    }
}
