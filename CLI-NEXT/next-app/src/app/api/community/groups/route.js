import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { verifyToken } from '@/utils/auth';

export async function GET(req) {
    try {
        const userId = await verifyToken(req);

        // Fetch all groups the user is a member of
        const groups = await prisma.communityGroup.findMany({
            where: {
                members: {
                    some: { userId: userId || '' }
                }
            },
            include: {
                channels: true,
                _count: {
                    select: { members: true }
                }
            }
        });

        // If user not logged in or has no groups, show global/recommended groups
        const recommendedGroups = await prisma.communityGroup.findMany({
            take: 5,
            include: {
                channels: true,
                _count: {
                    select: { members: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            groups: groups.length > 0 ? groups : recommendedGroups
        });
    } catch (error) {
        console.error('Groups fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name, description, image } = await req.json();

        const group = await prisma.communityGroup.create({
            data: {
                name,
                description,
                image,
                ownerId: userId,
                channels: {
                    create: [
                        { name: 'general', type: 'TEXT' },
                        { name: 'weather', type: 'TEXT' },
                        { name: 'crop-help', type: 'TEXT' }
                    ]
                },
                members: {
                    create: { userId, role: 'OWNER' }
                }
            },
            include: {
                channels: true
            }
        });

        return NextResponse.json({ success: true, group });
    } catch (error) {
        console.error('Group creation error:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
