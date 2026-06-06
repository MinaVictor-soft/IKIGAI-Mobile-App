import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushTokenResponse {
  token: string;
  error?: string;
}

export async function getPushToken(): Promise<PushTokenResponse> {
  if (!Device.isDevice) {
    return {
      token: '',
      error: 'Must use physical device for push notifications',
    };
  }

  try {
    // Request notification permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        token: '',
        error: 'Failed to get push token for push notification!',
      };
    }

    // Get the push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || '',
    });

    return { token: token.data };
  } catch (error) {
    console.error('Error getting push token:', error);
    return {
      token: '',
      error: String(error),
    };
  }
}

// Register push token with backend
export async function registerPushToken(userId: string, token: string, authToken: string): Promise<boolean> {
  try {
    const response = await axios.post(
      'https://ikigai-backend.replit.app/api/v1/notifications/register-token',
      { pushToken: token, deviceId: Device.deviceName },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
}

// Listen to incoming notifications
export function setupNotificationListeners() {
  // Notification received while app is foregrounded
  const foregroundNotificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
  });

  // Notification tapped
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response:', response);
    const data = response.notification.request.content.data;
    
    // Handle navigation based on notification type
    if (data.type === 'QUIZ_CREATED') {
      // Navigate to quizzes screen
      console.log('Navigating to quiz:', data.quizId);
    } else if (data.type === 'MATCH_CREATED') {
      // Navigate to sports screen
      console.log('Navigating to match:', data.matchId);
    } else if (data.type === 'PUBLICATION_CREATED') {
      // Navigate to library screen
      console.log('Navigating to publication:', data.publicationId);
    }
  });

  return () => {
    foregroundNotificationListener.remove();
    responseListener.remove();
  };
}

export const pushNotificationService = {
  getPushToken,
  registerPushToken,
  setupNotificationListeners,
};
