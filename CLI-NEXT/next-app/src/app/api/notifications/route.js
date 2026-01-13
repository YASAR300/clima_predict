import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Helper to get user from token
async function getUserFromToken(req) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// GET - Fetch user notifications
export async function GET(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly && { isRead: false }),
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new notification
export async function POST(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, title, message } = await req.json();

        if (!type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
            },
        });

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        console.error('Notification creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Mark notification as read
export async function PUT(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { notificationId, markAllAsRead } = await req.json();

        if (markAllAsRead) {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });

            return NextResponse.json({ message: 'All notifications marked as read' });
        }

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
        }

        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json({ notification });
    } catch (error) {
        console.error('Notification update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete notification
export async function DELETE(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
        }

        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
        });

        return NextResponse.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Notification deletion error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
