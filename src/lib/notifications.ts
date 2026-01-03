import { API_BASE_URL } from './api-config';

export interface Notification {
    id: number;
    user_id: number | null;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const fetchNotifications = async (): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
};
