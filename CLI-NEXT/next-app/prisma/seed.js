const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find a default user (e.g., the first one)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found. Please register first.');
        return;
    }

    // Create Global Community
    const group = await prisma.communityGroup.create({
        data: {
            name: 'Global Farming',
            description: 'Regional agricultural strategies and knowledge sharing.',
            ownerId: user.id,
            channels: {
                create: [
                    { name: 'general', type: 'TEXT' },
                    { name: 'crop-help', type: 'TEXT' },
                    { name: 'weather-chat', type: 'TEXT' },
                    { name: 'voice-lounge', type: 'VOICE' },
                ],
            },
            members: {
                create: { userId: user.id, role: 'OWNER' },
            },
        },
    });

    console.log('Seed successful: Global Farming group created with channels.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
