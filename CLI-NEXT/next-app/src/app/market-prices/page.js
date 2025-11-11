'use client';

import Link from 'next/link';
import { marketPrices } from '@/data/staticData';

export default function MarketPrices() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/insights" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Market Prices</h1>
        </header>

        <div className="px-5 space-y-3 pb-6">
          {marketPrices.map((price, index) => (
            <div key={index} className="bg-[#252525] rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xl font-bold text-white mb-1">{price.crop}</div>
                  <div className="text-sm text-[#B0B0B0]">₹{price.price.toLocaleString()} {price.unit}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold mb-1 ${
                      price.trend === 'up' ? 'text-[#00D09C]' : 'text-[#FF6B35]'
                    }`}
                  >
                    {price.change}
                  </div>
                  <div className={`text-2xl ${price.trend === 'up' ? 'text-[#00D09C]' : 'text-[#FF6B35]'}`}>
                    {price.trend === 'up' ? '↗️' : '↘️'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

