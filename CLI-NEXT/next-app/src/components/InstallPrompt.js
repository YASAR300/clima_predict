'use client';

import { useState, useEffect } from 'react';
import { SmartphoneDevice, Xmark } from 'iconoir-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the prompt today
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      // Option: Auto-expire after 3 days if you want to show it again later
      const dismissalDate = new Date(dismissed);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - dismissalDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 7) { // Don't show for 7 days if dismissed
        return;
      }
    }

    // Robust Service Worker Registration
    const registerSW = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => {
            console.log('PWA: Service Worker registered with scope:', reg.scope);
            // Check for updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('PWA: New content is available; please refresh.');
                    } else {
                      console.log('PWA: Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((err) => console.error('PWA: Service Worker registration failed:', err));
      }
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    // Capture the beforeinstallprompt event
    // This is the ONLY event that allows "Install App" vs "Shortcut"
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired! App is installable.');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our premium install banner
      setTimeout(() => setShowPrompt(true), 1500);
    };

    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('load', registerSW);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: Deferred prompt not available');
      return;
    }

    // Trigger the native browser install dialog
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  // Only show if not installed and we have the official prompt event
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-[#111111]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D09C]/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] p-3.5 rounded-2xl shadow-lg shadow-[#00D09C]/30 flex-shrink-0">
            <SmartphoneDevice width={24} height={24} className="text-[#0D0D0D]" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Install App</h4>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Full Native Experience</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              setShowPrompt(false);
              localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
            }}
            className="p-3 text-white/20 hover:text-white/50 transition-colors rounded-xl"
            aria-label="Dismiss"
          >
            <Xmark width={18} height={18} />
          </button>
          <button
            onClick={handleInstallClick}
            className="bg-[#00D09C] hover:bg-[#00D09C]/90 text-[#0D0D0D] font-black py-3.5 px-6 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-[#00D09C]/40 border border-[#00D09C]/50"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
