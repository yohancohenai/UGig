import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import type { AppNotification, NotificationType } from '../constants/MockData';
import { MOCK_NOTIFICATIONS } from '../constants/MockData';

/** Push notification payload structure (ready for Expo Push / APNs / FCM) */
export interface PushPayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data: {
    type: NotificationType;
    gigId?: string;
    notificationId: string;
  };
  sound: 'default';
  badge: number;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: { type: NotificationType; title: string; message: string; gigId?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /** Expo push token (null until registered or if unavailable) */
  expoPushToken: string | null;
  /** Register for push notifications — call once on app start */
  registerForPushNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const registeredRef = useRef(false);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const addNotification = useCallback(
    (notif: { type: NotificationType; title: string; message: string; gigId?: string }) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setNotifications(prev => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /**
   * Register for push notifications using expo-notifications.
   * This is structured so that when expo-notifications is installed,
   * you just uncomment the implementation below.
   *
   * For now it stores a placeholder token to demonstrate the flow.
   */
  const registerForPushNotifications = useCallback(async () => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    // ──────────────────────────────────────────────────
    // Uncomment when expo-notifications is installed:
    //
    // import * as Notifications from 'expo-notifications';
    // import * as Device from 'expo-device';
    //
    // if (!Device.isDevice) {
    //   console.log('Push notifications require a physical device');
    //   return;
    // }
    //
    // const { status: existingStatus } = await Notifications.getPermissionsAsync();
    // let finalStatus = existingStatus;
    // if (existingStatus !== 'granted') {
    //   const { status } = await Notifications.requestPermissionsAsync();
    //   finalStatus = status;
    // }
    // if (finalStatus !== 'granted') {
    //   console.log('Push notification permission not granted');
    //   return;
    // }
    //
    // const tokenData = await Notifications.getExpoPushTokenAsync({
    //   projectId: 'your-expo-project-id',
    // });
    // setExpoPushToken(tokenData.data);
    //
    // // Send token to backend:
    // // await fetch(`${API_BASE}/api/push-tokens`, {
    // //   method: 'POST',
    // //   headers: { 'Content-Type': 'application/json' },
    // //   body: JSON.stringify({ token: tokenData.data, platform: Platform.OS }),
    // // });
    //
    // if (Platform.OS === 'android') {
    //   Notifications.setNotificationChannelAsync('default', {
    //     name: 'default',
    //     importance: Notifications.AndroidImportance.MAX,
    //   });
    // }
    // ──────────────────────────────────────────────────

    // Placeholder for development — simulates a registered token
    setExpoPushToken(`ExponentPushToken[mock_${Platform.OS}_${Date.now()}]`);
  }, []);

  // Auto-register on mount
  useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      expoPushToken,
      registerForPushNotifications,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, expoPushToken, registerForPushNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

/**
 * Helper to build a push notification payload.
 * Use this when sending push notifications from the backend.
 */
export function buildPushPayload(
  token: string,
  notif: AppNotification,
  badge: number
): PushPayload {
  return {
    to: token,
    title: notif.title,
    body: notif.message,
    data: {
      type: notif.type,
      gigId: notif.gigId,
      notificationId: notif.id,
    },
    sound: 'default',
    badge,
  };
}
