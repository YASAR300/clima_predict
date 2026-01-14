'use client';

import { useEffect } from 'react';

export default function InstallPrompt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA: Already installed');
      return;
    }

    if (window.localStorage.getItem('pwa-installed') === 'true') {
      console.log('PWA: Marked as installed');
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired - browser will show native prompt');
      // Don't prevent default - let browser show its native UI
      // This will trigger the bottom "Install this site as an app" prompt
    };

    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      window.localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // No UI - browser will handle everything natively
  return null;
}
