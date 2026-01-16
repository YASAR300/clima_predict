import { NextResponse } from 'next/server';
import { getPusherServer } from '@/utils/pusher';
import { verifyToken } from '@/utils/auth';
import prisma from '@/utils/prisma';

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const socketId = formData.get('socket_id');
        const channelName = formData.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true }
        });

        const pusher = getPusherServer();
        if (!pusher) return NextResponse.json({ error: 'Pusher not configured' }, { status: 500 });

        const presenceData = {
            user_id: user.id,
            user_info: { name: user.name || 'Farmer' }
        };

        const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
