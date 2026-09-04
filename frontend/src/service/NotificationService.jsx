import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

const getToken = () => localStorage.getItem("token");

const NotificationService = {

    // 1. Send Notification
    sendNotification: (notification) => {
        return axios.post(BASE_URL, notification, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    // 2. Get My Notifications
    getNotifications: () => {
        return axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    // 3. Mark Notification as Read
    markAsRead: (id) => {
        return axios.put(`${BASE_URL}/${id}/read`, {}, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    // 4. Get Unread Notification Count
    getUnreadCount: () => {
        return axios.get(`${BASE_URL}/unread-count`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    }

};

export default NotificationService;