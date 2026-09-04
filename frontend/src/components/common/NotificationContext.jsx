import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  getStudentNotifications,
  saveCurrentStudentNotifications,
  updateStudentNotification
} from "../../hooks/studentPortalData";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => getStudentNotifications());

  const reloadNotifications = useCallback(() => {
    setNotifications(getStudentNotifications());
  }, []);

  useEffect(() => {
    reloadNotifications();
    window.addEventListener("studentNotificationsUpdated", reloadNotifications);
    window.addEventListener("studentEnrollmentUpdated", reloadNotifications);
    return () => {
      window.removeEventListener("studentNotificationsUpdated", reloadNotifications);
      window.removeEventListener("studentEnrollmentUpdated", reloadNotifications);
    };
  }, [reloadNotifications]);

  // Count of unread notifications
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Mark a single notification as read (reduces count by 1)
  const markAsRead = useCallback((notifId) => {
    updateStudentNotification(notifId, { read: true });
    reloadNotifications();
  }, [reloadNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveCurrentStudentNotifications(updated);
    reloadNotifications();
  }, [notifications, reloadNotifications]);

  // Remove a single notification
  const dismissNotification = useCallback((notifId) => {
    saveCurrentStudentNotifications(notifications.filter((n) => n.id !== notifId));
    reloadNotifications();
  }, [notifications, reloadNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    saveCurrentStudentNotifications([]);
    reloadNotifications();
  }, [reloadNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      clearAll,
      reloadNotifications,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll, reloadNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      dismissNotification: () => {},
      clearAll: () => {},
      reloadNotifications: () => {},
    };
  }
  return ctx;
}

export default NotificationContext;
