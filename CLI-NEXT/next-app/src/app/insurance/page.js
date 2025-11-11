'use client';

import Link from 'next/link';
import { insuranceData } from '@/data/staticData';

export default function Insurance() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/profile" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Insurance</h1>
        </header>

        {/* Policy Card */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-3xl p-6">
            <div className="text-sm text-white/70 mb-2">Policy Number</div>
            <div className="text-2xl font-bold text-white mb-4">{insuranceData.policyNumber}</div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-white/70 mb-1">Coverage</div>
                <div className="text-xl font-bold text-white">₹{insuranceData.coverageAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Premium</div>
                <div className="text-xl font-bold text-white">₹{insuranceData.premium.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 bg-white/20 rounded-lg">
                <span className="text-sm font-semibold text-white">{insuranceData.status}</span>
              </div>
              <div className="text-sm text-white/70">
                Expires: {insuranceData.expiryDate}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="px-5 mb-6">
          <div className="bg-[#252525] rounded-2xl p-5">
            <div className="text-base font-semibold text-white mb-4">Risk Assessment</div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-[#00D09C] mb-1">{insuranceData.riskScore}</div>
                <div className="text-sm text-[#B0B0B0]">Risk Score</div>
              </div>
              <div className="px-4 py-2 bg-[#00D09C]/20 rounded-xl">
                <span className="text-base font-semibold text-[#00D09C]">{insuranceData.riskCategory} Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Claims History */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Claims History</h2>
          <div className="space-y-3">
            {insuranceData.claimsHistory.map((claim, index) => (
              <div key={index} className="bg-[#252525] rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-base font-medium text-white mb-1">{claim.type}</div>
                    <div className="text-sm text-[#B0B0B0]">{claim.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white mb-1">₹{claim.amount.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      claim.status === 'Approved' ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#4D9FFF]/20 text-[#4D9FFF]'
                    }`}>
                      {claim.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

