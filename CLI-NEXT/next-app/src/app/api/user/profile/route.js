import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { verifyToken } from '@/utils/auth';

export async function GET(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                crops: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                location: user.location,
                farmSize: user.farmSize,
                cropsCount: user.crops.length,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
                location: data.location,
                farmSize: data.farmSize,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                location: user.location,
                farmSize: user.farmSize,
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
