'use client';

import Link from 'next/link';
import {
  IoArrowBack,
  IoShieldCheckmark,
  IoCheckmarkCircle,
  IoAdd,
  IoServer,
  IoWarning,
  IoLeaf,
  IoStatsChart
} from 'react-icons/io5';

export default function Insurance() {
  const insurancePolicies = [
    {
      id: 1,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      type: 'Crop Insurance',
      coverage: '₹5,00,000',
      premium: '₹12,500/year',
      status: 'Active',
      validUntil: 'March 31, 2026',
      crops: ['Wheat', 'Cotton', 'Rice'],
      icon: IoLeaf,
      color: '#00D09C',
    },
    {
      id: 2,
      name: 'Weather Based Crop Insurance',
      type: 'Weather Insurance',
      coverage: '₹3,00,000',
      premium: '₹8,000/year',
      status: 'Active',
      validUntil: 'December 31, 2025',
      crops: ['Sugarcane'],
      icon: IoShieldCheckmark,
      color: '#4D9FFF',
    },
  ];

  const recentClaims = [
    {
      id: 1,
      date: 'Oct 15, 2025',
      reason: 'Heavy Rainfall Damage',
      amount: '₹45,000',
      status: 'Approved',
      statusColor: '#00D09C',
    },
    {
      id: 2,
      date: 'Aug 22, 2025',
      reason: 'Drought Impact',
      amount: '₹32,000',
      status: 'Processing',
      statusColor: '#FFC857',
    },
  ];

  return (
    <div className="min-h-screen text-white pb-12 uppercase">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
        <header className="pt-8 pb-4 flex items-center gap-4 md:mb-10">
          <Link href="/profile" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10 uppercase">
            <IoArrowBack size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Indemnity Portfolio</h1>
            <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Asset protection and risk mitigation records</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Summary Stats */}
          <div className="lg:col-span-12">
            <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center gap-8">
                  <div className="p-8 bg-white/20 backdrop-blur-xl rounded-[2.5rem] border border-white/30 hidden md:block">
                    <IoShieldCheckmark size={64} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[#0D0D0D]/40 tracking-[0.4em] mb-4">Total Aggregate Coverage</div>
                    <div className="text-5xl md:text-7xl font-black text-[#0D0D0D] tracking-tighter">₹8,00,000</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 md:gap-16 w-full md:w-auto pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-[#0D0D0D]/10 md:pl-16">
                  <div>
                    <div className="text-[10px] font-black text-[#0D0D0D]/40 tracking-widest mb-1 uppercase">Active Policies</div>
                    <div className="text-3xl font-black text-[#0D0D0D]">02</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[#0D0D0D]/40 tracking-widest mb-1 uppercase">Annual Premium</div>
                    <div className="text-3xl font-black text-[#0D0D0D]">₹20.5K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Policies */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Active Underwriting</h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-[#00D09C] tracking-widest">
                <IoAdd size={16} />
                New Policy
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {insurancePolicies.map((policy) => {
                const Icon = policy.icon;
                return (
                  <div key={policy.id} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] transition-all group">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-white/20 group-hover:text-white transition-colors" style={{ color: policy.color }}>
                          <Icon size={28} />
                        </div>
                        <div>
                          <div className="text-xl font-black text-white mb-1 uppercase tracking-tight">{policy.name}</div>
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{policy.type}</div>
                        </div>
                      </div>
                      <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] text-[#00D09C]">
                        {policy.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                      <div>
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Coverage Allocation</div>
                        <div className="text-xl font-black text-white">{policy.coverage}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Policy Premium</div>
                        <div className="text-xl font-black text-white">{policy.premium}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-3">Biological Scope</div>
                        <div className="flex flex-wrap gap-2">
                          {policy.crops.map((crop, idx) => (
                            <span key={idx} className="text-[8px] font-black bg-white/5 border border-white/5 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 text-[10px] font-black text-white/10 tracking-[0.3em] uppercase">
                      Termination: <span className="text-white/40">{policy.validUntil}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Claims */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Indemnity Claims</h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-[#FFC857] tracking-widest uppercase">
                History
              </button>
            </div>
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-lg font-black text-white mb-1 uppercase tracking-tight">{claim.reason}</div>
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{claim.date}</div>
                    </div>
                    <div className="px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${claim.statusColor}10`, borderColor: `${claim.statusColor}20`, color: claim.statusColor }}>
                      {claim.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-black text-[#00D09C] tracking-tighter">{claim.amount}</div>
                    <div className="p-3 bg-white/5 rounded-xl text-white/10 group-hover:text-white transition-colors">
                      <IoServer size={18} />
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full bg-white/5 border border-dashed border-white/10 rounded-[2rem] py-8 flex flex-col items-center justify-center group hover:bg-white/10 transition-all gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-[#00D09C] transition-all">
                  <IoAdd size={32} />
                </div>
                <div className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase group-hover:text-white transition-all">Initiate New Indemnity Claim</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
