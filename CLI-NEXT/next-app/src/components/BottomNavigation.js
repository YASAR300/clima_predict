'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Map, StatsReport, User } from 'iconoir-react';

const navItems = [
  { 
    path: '/', 
    icon: Home,
    label: 'Home',
    customIcon: true
  },
  { 
    path: '/forecast', 
    icon: Calendar,
    label: 'Forecast'
  },
  { 
    path: '/weather-map', 
    icon: Map,
    label: 'Map'
  },
  { 
    path: '/insights', 
    icon: StatsReport,
    label: 'Insights'
  },
  { 
    path: '/profile', 
    icon: User,
    label: 'Profile'
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/' && pathname === '/');
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`relative flex flex-col items-center justify-center flex-1 min-w-0 py-1 transition-all duration-200 select-none touch-none ${
                  isActive ? '' : 'active:scale-95'
                }`}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-[#00D09C] rounded-full" />
                )}
                {item.path === '/' && isActive ? (
                  <div className="relative mb-0.5">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">N</span>
                    </div>
                  </div>
                ) : (
                  <div className={`mb-0.5 transition-all duration-200 ${
                    isActive ? 'scale-110' : 'opacity-60'
                  }`}>
                    <item.icon 
                      width={24} 
                      height={24} 
                      className={isActive ? 'text-[#00D09C]' : 'text-white/60'}
                    />
                  </div>
                )}
                <span className={`text-[10px] font-medium leading-tight mt-0.5 ${
                  isActive ? 'text-[#00D09C]' : 'text-white/60'
                }`}>
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