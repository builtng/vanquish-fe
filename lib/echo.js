import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export const getEcho = () => {
    if (typeof window === 'undefined') return null;
    
    if (echoInstance) return echoInstance;

    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    if (!key || key === 'your-pusher-key' || key === 'YOUR_PUSHER_KEY') {
        if (key) {
            console.info('Pusher key is still at default value. Real-time notifications disabled.');
        } else {
            console.warn('Pusher key missing. Real-time notifications via Echo will be disabled.');
        }
        return null;
    }

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        },
    });

    return echoInstance;
};
