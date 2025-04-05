import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Use AuthContext to get user ID
import {
    Notification,
    fetchNotifications,
    markNotificationsAsRead,
    markAllNotificationsAsRead
} from '@/data/notificationService'; // Import from your service
import { toast } from 'sonner'; // For showing errors

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifs: () => Promise<void>; // Manually trigger fetch
    markAsRead: (notificationIds: string[]) => Promise<boolean>;
    markAllAsRead: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth(); // Get the current user
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications when user logs in or manually triggered
    const fetchNotifs = useCallback(async () => {
        if (!user?.id) {
            setNotifications([]); // Clear notifications if no user
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all notifications initially, including read ones
            const fetchedNotifs = await fetchNotifications(user.id, 20, false); 
            setNotifications(fetchedNotifs);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError("Could not load notifications.");
            // toast.error("Could not load notifications."); // Optional: show toast
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]); // Dependency on user.id

    // Initial fetch on user change
    useEffect(() => {
        fetchNotifs();
    }, [fetchNotifs]);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Mark specific notifications as read
    const markAsRead = async (notificationIds: string[]): Promise<boolean> => {
        if (!user?.id || notificationIds.length === 0) return false;

        // Optimistic UI update: Mark as read locally immediately
        const originalNotifications = [...notifications];
        setNotifications(prev => 
            prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: true } : n)
        );

        try {
            const success = await markNotificationsAsRead(user.id, notificationIds);
            if (!success) throw new Error("Failed to mark as read on backend.");
            // No need to refetch, UI is already updated
            console.log("Notifications marked as read:", notificationIds);
            return true;
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
            toast.error("Failed to update notification status.");
            // Revert optimistic update on error
            setNotifications(originalNotifications);
            return false;
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async (): Promise<boolean> => {
        if (!user?.id || unreadCount === 0) return false;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        // Optimistic UI update
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); 

        try {
            const success = await markAllNotificationsAsRead(user.id);
            if (!success) throw new Error("Failed to mark all as read on backend.");
            console.log("All notifications marked as read.");
            return true;
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
            toast.error("Failed to update all notification statuses.");
            // Revert optimistic update
            setNotifications(originalNotifications);
            return false;
        }
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifs,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 