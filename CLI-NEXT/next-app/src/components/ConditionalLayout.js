'use client';

import { usePathname } from 'next/navigation';
import DesktopSidebar from '@/components/DesktopSidebar';
import BottomNavigation from '@/components/BottomNavigation';

export default function ConditionalLayout({ children }) {
    const pathname = usePathname();

    // Hide sidebar and bottom nav on auth pages and ALSO on community page for full-screen Discord experience
    const isAuthPage = pathname && pathname.startsWith('/auth');
    const isCommunityPage = pathname === '/community';
    const hideNavs = isAuthPage || isCommunityPage;

    return (
        <>
            {!hideNavs && <DesktopSidebar />}

            <div className={`relative z-10 w-full h-screen overflow-y-auto transition-all duration-300 scroll-smooth custom-scrollbar ${!hideNavs ? 'md:pl-72' : ''}`}>
                <div className={`w-full mx-auto bg-[#0D0D0D] md:bg-transparent shadow-[0_0_100px_rgba(0,0,0,0.5)] md:shadow-none border-x border-white/[0.02] md:border-none min-h-full ${!hideNavs ? 'px-4 md:px-12 py-4 md:py-6 pb-32 md:pb-6' : (isCommunityPage ? 'p-0' : 'px-4 md:px-12 py-4 md:py-6 pb-32 md:pb-6')}`}>
                    {children}
                </div>
            </div>

            {!hideNavs && <BottomNavigation />}
        </>
    );
}
