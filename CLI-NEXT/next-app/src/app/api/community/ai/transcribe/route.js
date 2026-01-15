import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken } from '@/utils/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { audioBase64, mimeType } = await req.json();

        if (!audioBase64) {
            return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Please transcribe this audio message accurately. It is likely from a farmer discussing agricultural issues. Return only the transcription text.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: audioBase64,
                    mimeType: mimeType || "audio/webm"
                }
            }
        ]);

        const transcription = result.response.text();

        return NextResponse.json({ success: true, transcription });
    } catch (error) {
        console.error('AI Transcription error:', error);
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
    }
}
