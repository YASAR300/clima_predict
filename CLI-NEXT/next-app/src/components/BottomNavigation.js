'use client';

import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/forecast', icon: '☀️', label: 'Forecast' },
  { path: '/community', icon: '👥', label: 'Community' },
  { path: '/insights', icon: '📊', label: 'Insights' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-50">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00D09C]/15 text-[#00D09C]'
                    : 'text-[#707070] hover:text-[#B0B0B0]'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

