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

// GET - Fetch user preferences
export async function GET(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let preferences = await prisma.userPreferences.findUnique({
            where: { userId },
        });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await prisma.userPreferences.create({
                data: { userId },
            });
        }

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('Preferences fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user preferences
export async function PUT(req) {
    try {
        const userId = await getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await req.json();

        const preferences = await prisma.userPreferences.upsert({
            where: { userId },
            update: updates,
            create: {
                userId,
                ...updates,
            },
        });

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('Preferences update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
