import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body?.prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    const { prompt, context = '', provider } = body;

    if (!OPENAI_API_KEY && !HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        {
          error:
            'No AI provider configured. Set OPENAI_API_KEY or HUGGINGFACE_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    if ((provider === 'gemini' || provider === 'google' || !provider) && GEMINI_API_KEY) {
      const result = await queryGemini({ prompt, context });
      return NextResponse.json({ provider: 'gemini', ...result });
    }

    if ((provider === 'openai' || !provider) && OPENAI_API_KEY) {
      const result = await queryOpenAI({ prompt, context });
      return NextResponse.json({ provider: 'openai', ...result });
    }

    if ((provider === 'huggingface' || !provider) && HUGGINGFACE_API_KEY) {
      const result = await queryHuggingFace({ prompt, context });
      return NextResponse.json({ provider: 'huggingface', ...result });
    }

    return NextResponse.json(
      {
        error:
          'Requested provider is unavailable. Ensure the corresponding API key is set.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ai-advisor.integration] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to generate AI advice.' },
      { status: 500 }
    );
  }
}

async function queryOpenAI({ prompt, context }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI weather and climate advisor. Provide concise, actionable guidance backed by the provided data.',
        },
        {
          role: 'user',
          content: `${context ? `${context}\n\n` : ''}${prompt}`,
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message?.content?.trim();

  return {
    message:
      message ||
      'No response generated. Try refining your question with more context.',
    raw: data,
  };
}

async function queryHuggingFace({ prompt, context }) {
  const model = process.env.HUGGINGFACE_MODEL || DEFAULT_HF_MODEL;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: `${context ? `${context}\n\n` : ''}${prompt}`,
        parameters: { max_new_tokens: 512, temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Hugging Face request failed (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  const output =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : data.generated_text;

  return {
    message:
      typeof output === 'string'
        ? output.trim()
        : 'Model returned an unexpected response format.',
    raw: data,
  };
}

async function queryGemini({ prompt, context }) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemContext = "You are an AI weather and climate advisor. Provide concise, actionable guidance backed by the provided data.";
    const fullPrompt = `${systemContext}\n\n${context ? `Context: ${context}\n\n` : ''}User Query: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      message: text || 'No response generated. Try refining your question.',
      raw: result,
    };
  } catch (error) {
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}
