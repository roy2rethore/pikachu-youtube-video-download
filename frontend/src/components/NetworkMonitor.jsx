
/**
 * NetworkMonitor Component
 * Monitors online/offline status and displays notifications
 */
import { useEffect, useRef } from 'react';
import { useToast } from './ui/toast';

export function NetworkMonitor() {
    const { addToast } = useToast();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Handler for offline event
        const handleOffline = () => {
            addToast({
                title: 'No Internet Connection',
                description: 'You are currently offline. Please check your network connection.',
                variant: 'destructive',
                duration: 5000,
            });
        };

        // Handler for online event
        const handleOnline = () => {
            addToast({
                title: 'Back Online',
                description: 'You are now connected to the internet.',
                variant: 'default',
                className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none shadow-xl shadow-green-500/20', // Premium Green
                duration: 3000,
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check initial status only if not first render (avoid spamming on load if already online)
        // But commonly apps just listen to changes.
        // If user loads offline, browser acts differently. 
        // Let's just stick to event listeners for changes.

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast]);

    return null; // Headless component
}
