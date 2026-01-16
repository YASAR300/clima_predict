import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { verifyToken } from '@/utils/auth';
import { getPusherServer } from '@/utils/pusher';

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { messageId, emoji } = await req.json();

        if (!messageId || !emoji) {
            return NextResponse.json({ error: 'Missing messageId or emoji' }, { status: 400 });
        }

        // Check if reaction already exists
        const existing = await prisma.messageReaction.findFirst({
            where: { userId, messageId, emoji }
        });

        let result;
        let action;

        if (existing) {
            // Remove reaction (toggle)
            await prisma.messageReaction.delete({
                where: { id: existing.id }
            });
            result = existing;
            action = 'removed';
        } else {
            // Add reaction
            result = await prisma.messageReaction.create({
                data: { userId, messageId, emoji },
                include: {
                    user: { select: { id: true, name: true } }
                }
            });
            action = 'added';
        }

        // Broadcast change
        try {
            const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
            const pusher = getPusherServer();
            if (pusher && msg) {
                await pusher.trigger(`presence-channel-${msg.channelId}`, 'message-reaction', {
                    messageId,
                    userId,
                    emoji,
                    action,
                    reaction: action === 'added' ? result : null
                });
            }
        } catch (pError) {
            console.error('Pusher reaction broadcast failed:', pError);
        }

        return NextResponse.json({ success: true, action, reaction: result });
    } catch (error) {
        console.error('Reaction error:', error);
        return NextResponse.json({ error: 'Failed to react' }, { status: 500 });
    }
}
