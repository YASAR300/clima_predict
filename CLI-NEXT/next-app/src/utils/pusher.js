import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (for sending events)
let serverInstance = null;
export const getPusherServer = () => {
    if (!serverInstance) {
        const appId = process.env.PUSHER_APP_ID;
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const secret = process.env.PUSHER_SECRET;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!appId || !key || !secret || !cluster || appId.includes('your-pusher')) {
            console.warn('Pusher server credentials are not configured or are using placeholders. Real-time broadcast disabled.');
            return null;
        }

        try {
            serverInstance = new Pusher({
                appId,
                key,
                secret,
                cluster,
                useTLS: true,
            });
        } catch (e) {
            console.error('Failed to initialize Pusher server:', e);
            return null;
        }
    }
    return serverInstance;
};

// Client-side Pusher (for receiving events)
let clientInstance = null;
export const getPusherClient = () => {
    if (typeof window === 'undefined') return null;

    if (!clientInstance) {
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!key || !cluster || key.includes('your-pusher')) {
            console.warn('Pusher client is not configured or is using placeholders.');
            return null;
        }

        clientInstance = new PusherClient(key, {
            cluster,
            authEndpoint: '/api/pusher/auth',
        });
    }
    return clientInstance;
};

// Keep deprecated exports for backward compatibility but warn
export const pusherServer = typeof process !== 'undefined' && process.env.PUSHER_APP_ID ? new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    useTLS: true,
}) : null;

export const pusherClient = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
}) : null;
