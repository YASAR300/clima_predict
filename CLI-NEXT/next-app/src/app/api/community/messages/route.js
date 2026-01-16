import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { verifyToken } from '@/utils/auth';
import { getPusherServer } from '@/utils/pusher';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { channelId },
            include: {
                user: {
                    select: { id: true, name: true }
                },
                repliedTo: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                reactions: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('Messages fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { channelId, message, audioUrl, fileUrl, fileType, repliedToId, isAI } = await req.json();

        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId,
                channelId,
                message,
                audioUrl,
                fileUrl,
                fileType,
                repliedToId,
                isAI: isAI || false
            },
            include: {
                user: {
                    select: { id: true, name: true }
                },
                repliedTo: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                reactions: true
            }
        });

        // Trigger Pusher event for real-time update
        try {
            const pusher = getPusherServer();
            if (pusher) {
                await pusher.trigger(`channel-${channelId}`, 'new-message', chatMessage);
            }
        } catch (pusherError) {
            console.error('Pusher broadcast failed:', pusherError);
            // We don't fail the request if broadcasting fails
        }

        return NextResponse.json({ success: true, message: chatMessage });
    } catch (error) {
        console.error('Message creation error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get('id');

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        // Verify ownership
        const msg = await prisma.chatMessage.findUnique({
            where: { id: messageId }
        });

        if (!msg || msg.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.chatMessage.delete({
            where: { id: messageId }
        });

        const pusher = getPusherServer();
        if (pusher) {
            await pusher.trigger(`channel-${msg.channelId}`, 'message-deleted', { id: messageId });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Message deletion error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
