import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_BASE_URL } from './api';

export const resetEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};

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

    const token = localStorage.getItem('api_token');
    if (!token) return null;

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        authEndpoint: `${API_BASE_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });

    return echoInstance;
};
