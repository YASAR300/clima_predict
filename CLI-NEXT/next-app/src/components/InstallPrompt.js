'use client';

import { useState, useEffect } from 'react';
import { SmartphoneDevice, Xmark } from 'iconoir-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    if (window.localStorage.getItem('pwa-installed') === 'true') {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already dismissed today
    const dismissedDate = window.localStorage.getItem('pwa-prompt-dismissed-date');
    const today = new Date().toDateString();

    if (dismissedDate === today) {
      return; // Don't show if dismissed today
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Show immediately on mobile, after 2 seconds on desktop
      const isMobile = window.innerWidth < 768;
      const delay = isMobile ? 500 : 2000; // 0.5s on mobile, 2s on desktop

      setTimeout(() => {
        console.log('PWA: Showing install prompt');
        setShowPrompt(true);
      }, delay);
    };

    const handleAppInstalled = () => {
      console.log('PWA: App installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
      setIsInstalled(true);
      window.localStorage.setItem('pwa-installed', 'true');
    } else {
      console.log('User dismissed the install prompt');
      // Don't show again for this session
      setShowPrompt(false);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for today
    const today = new Date().toDateString();
    window.localStorage.setItem('pwa-prompt-dismissed-date', today);
  };

  // Don't show if already installed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .install-prompt-animate {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />
      <div className="fixed bottom-32 md:bottom-28 left-0 right-0 z-50 px-4 md:px-6 install-prompt-animate">
        <div className="max-w-md mx-auto bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D09C]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4D9FFF]/10 rounded-full blur-2xl" />

          <div className="flex items-start gap-3 md:gap-4 relative z-10">
            <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl p-3 md:p-3.5 flex-shrink-0 shadow-lg shadow-[#00D09C]/20">
              <SmartphoneDevice width={24} height={24} className="text-white md:w-7 md:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight uppercase">
                Install App
              </h3>
              <p className="text-xs text-white/60 mb-4 md:mb-5 leading-relaxed font-medium">
                Add ClimaPredict to your home screen for instant access and offline support.
              </p>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] text-[#0D0D0D] font-black text-sm py-3 md:py-3.5 px-4 md:px-6 rounded-xl md:rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#00D09C]/30 uppercase tracking-wide touch-target"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 md:px-6 py-3 md:py-3.5 text-white/40 hover:text-white/70 transition-colors font-bold text-xs md:text-sm uppercase tracking-widest touch-target"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 mt-1 p-2 touch-target"
              aria-label="Close"
            >
              <Xmark width={16} height={16} className="md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

