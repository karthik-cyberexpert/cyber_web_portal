import React, { useState, useEffect } from 'react';
import { Bell, Check, X, BellOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Notification, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationAsRead(id);
            // Remove from UI as requested: "Clicked notifications and mark as read should clear up all the notification from the UI"
            // Wait, the user said "clear up all the notification from the UI" when clicked/mark as read.
            // Let's interpret "Clicked notifications" as marking that specific one as read and removing it from view, 
            // and "mark as read" (the button) as clearing all.
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 overflow-hidden bg-card border-border">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="text-base font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-primary hover:text-primary/80 h-auto p-0"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <ScrollArea className={`${notifications.length > 5 ? 'h-[400px]' : 'h-auto'} max-h-[400px]`}>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                <BellOff className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">No new notifications</p>
                            <p className="text-xs text-muted-foreground mt-1">We'll notify you when something happens.</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map((notification) => (
                                <DropdownMenuItem 
                                    key={notification.id} 
                                    className="p-4 cursor-pointer focus:bg-muted/50 border-b border-border/50 last:border-0"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3 w-full">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Bell className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold truncate">{notification.title}</p>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <div className="p-2 bg-muted/30 border-t border-border">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-medium" onClick={handleMarkAllAsRead}>
                            Clear all notifications
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
