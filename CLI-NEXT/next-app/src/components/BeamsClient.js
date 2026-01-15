'use client';

import { useEffect } from 'react';

export default function BeamsClient() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Load Beams SDK dynamically
            const script = document.createElement('script');
            script.src = "https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js";
            script.async = true;
            script.onload = () => {
                if (window.PusherPushNotifications) {
                    const beamsClient = new window.PusherPushNotifications.Client({
                        instanceId: '09dfb88d-7da8-48bc-8fd8-07d267383a1c',
                    });

                    beamsClient.start()
                        .then(() => {
                            console.log('PWA: Beams SDK started.');
                            return beamsClient.addDeviceInterest('hello');
                        })
                        .then(() => console.log('PWA: Successfully subscribed to Beams!'))
                        .catch((error) => {
                            console.error('PWA: Beams Registration Error:', error);
                            if (error.message.includes('push service error')) {
                                console.warn('PWA: Push service is unavailable. This usually happens in Incognito mode, on a non-secure origin, or if Google Services are blocked.');
                            }
                        });
                }
            };
            document.head.appendChild(script);
        }
    }, []);

    return null;
}
