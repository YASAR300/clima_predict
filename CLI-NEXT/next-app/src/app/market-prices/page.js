'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IoArrowBack,
  IoTrendingUp,
  IoTrendingDown,
  IoStatsChart,
  IoLocation,
  IoSync
} from 'react-icons/io5';

function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market-prices');
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error('Failed to fetch market prices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="min-h-screen text-white pb-12">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
        <header className="pt-8 pb-4 flex items-center gap-4 md:mb-10">
          <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
            <IoArrowBack size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase">Market Intelligence</h1>
            <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Real-time commodity pricing and trade analytics</p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-white/5 animate-pulse">
            <IoSync size={48} className="text-white/20 animate-spin-slow mb-4" />
            <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Decoding market streams…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((price, index) => {
              const isUp = price.trend === 'up';
              return (
                <div key={index} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] transition-all group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-10 -mt-10 transition-colors duration-500 ${isUp ? 'bg-[#00D09C]' : 'bg-[#FF6B35]'}`} />

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                      <IoStatsChart size={32} className={isUp ? 'text-[#00D09C]' : 'text-[#FF6B35]'} />
                    </div>
                    <div className={`flex items-center gap-1 font-black text-sm uppercase tracking-widest ${isUp ? 'text-[#00D09C]' : 'text-[#FF6B35]'}`}>
                      {isUp ? <IoTrendingUp size={20} /> : <IoTrendingDown size={20} />}
                      {price.change}
                    </div>
                  </div>

                  <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-black text-white uppercase mb-1">{price.crop}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      <IoLocation size={12} />
                      Central Mandi Network
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-black text-white leading-none">₹{price.price.toLocaleString()}</span>
                    <span className="text-sm font-bold text-white/20 uppercase tracking-tighter">{price.unit}</span>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Volume: High</span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#00D09C] bg-[#00D09C]/10 px-4 py-2 rounded-xl border border-[#00D09C]/10 hover:bg-[#00D09C] hover:text-[#0D0D0D] transition-all">Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketPrices;
