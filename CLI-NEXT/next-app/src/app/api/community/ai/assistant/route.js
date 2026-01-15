import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken } from '@/utils/auth';
import { getPusherServer } from '@/utils/pusher';
import prisma from '@/utils/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { channelId, message, context } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert Agricultural AI Advisor named "ClimaAI". 
            You are helping a farmer in a community chat channel: ${context.channelName}.
            
            Current Context:
            - User Location: ${context.userLocation || 'Unknown'}
            - User Query: ${message}
            
            Guidelines:
            1. Be helpful, concise, and professional.
            2. Use information about weather and crops if available.
            3. If the farmer asks about disease, suggest organic and chemical solutions.
            4. If the query is in Hindi/Marathi/Urdu, reply in the same language.
            5. Since this is a chat, keep it natural.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Save AI message to database
        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId, // We attribute AI responses to the system or help user find them
                channelId,
                message: aiResponse,
                isAI: true
            }
        });

        // Trigger Pusher event for real-time delivery
        try {
            const pusher = getPusherServer();
            if (pusher) {
                await pusher.trigger(`channel-${channelId}`, 'new-message', chatMessage);
            }
        } catch (pusherError) {
            console.error('Pusher AI broadcast failed:', pusherError);
        }

        return NextResponse.json({ success: true, response: aiResponse });
    } catch (error) {
        console.error('AI Assistant error:', error);
        return NextResponse.json({ error: 'AI Assistant failed' }, { status: 500 });
    }
}
