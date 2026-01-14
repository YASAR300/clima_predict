import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { marketPrices } = await import('@/data/staticData');
        return NextResponse.json(marketPrices);
    } catch (error) {
        console.error('Market Prices GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
