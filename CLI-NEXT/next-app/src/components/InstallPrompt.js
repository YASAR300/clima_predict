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
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show our custom install prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    const handleAppInstalled = () => {
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
    // Remember dismissal for this session
    window.sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or if dismissed in this session
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  if (window.sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
      <div className="fixed bottom-24 left-0 right-0 z-50 px-5 install-prompt-animate">
        <div className="max-w-md mx-auto bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl p-5 shadow-[0_0_20px_rgba(0,208,156,0.4)] border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
            <SmartphoneDevice width={32} height={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              Install ClimaPredict
            </h3>
            <p className="text-sm text-white/90 mb-4">
              Install our app for a better experience! Get quick access, offline support, and faster loading.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white text-[#00D09C] font-semibold py-2.5 px-4 rounded-xl hover:bg-white/90 transition-colors"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-white/80 hover:text-white transition-colors font-medium"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <Xmark width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

