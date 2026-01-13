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

// GET - Fetch group chat messages
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const messages = await prisma.chatMessage.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            skip: offset,
            take: limit,
        });

        const totalCount = await prisma.chatMessage.count();

        return NextResponse.json({
            messages,
            totalCount,
            hasMore: offset + limit < totalCount,
        });
    } catch (error) {
        console.error('Group chat fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Send new message
export async function POST(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, isAI } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId,
                message,
                isAI: isAI || false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ message: chatMessage }, { status: 201 });
    } catch (error) {
        console.error('Message send error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
