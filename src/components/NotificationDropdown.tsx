import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/data/notificationService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, BellRing, Loader2 } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void }> = 
    ({ notification, onMarkRead }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div 
            className={`p-3 flex items-start gap-3 border-b last:border-b-0 hover:bg-accent cursor-pointer ${
                !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={handleClick}
        >
            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                 !notification.is_read ? 'bg-blue-500' : 'bg-transparent'
            }`}></div>
            <div className="flex-1">
                <p className="text-sm mb-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
};

const NotificationDropdown: React.FC = () => {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

    const handleMarkSingleRead = (id: string) => {
        markAsRead([id]);
    };

    return (
        <div className="w-80 shadow-lg rounded-lg bg-card text-card-foreground">
            <div className="p-3 flex justify-between items-center border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={markAllAsRead}>
                         Mark all as read
                    </Button>
                )}
            </div>

            <ScrollArea className="h-[300px]"> 
                {isLoading && (
                     <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isLoading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <BellRing className="h-10 w-10 text-muted-foreground mb-2"/>
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs text-muted-foreground">You're all caught up!</p>
                    </div>
                )}
                {!isLoading && notifications.length > 0 && (
                     <div>
                        {notifications.map(notif => (
                            <NotificationItem key={notif.id} notification={notif} onMarkRead={handleMarkSingleRead} />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-2 border-t text-center">
                <Button variant="link" size="sm" className="text-xs h-auto p-0 w-full">
                    View all notifications {/* TODO: Link to a dedicated notifications page */}
                </Button>
            </div>
        </div>
    );
};

export default NotificationDropdown; 