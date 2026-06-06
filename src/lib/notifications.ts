import { Platform } from 'react-native';
import axios from 'axios';

// Web Notifications API for web platform
const requestNotificationPermission = async () => {
  if (Platform.OS !== 'web') return false;
  
  if (!('Notification' in (globalThis as any))) {
    console.log('This browser does not support notifications');
    return false;
  }

  if ((globalThis as any).Notification.permission === 'granted') {
    return true;
  }

  if ((globalThis as any).Notification.permission !== 'denied') {
    try {
      const permission = await (globalThis as any).Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  return false;
};

const sendNotification = (title: string, options?: any) => {
  if (Platform.OS !== 'web') return;
  
  if (!('Notification' in (globalThis as any))) {
    console.log('This browser does not support notifications');
    return;
  }

  if ((globalThis as any).Notification.permission === 'granted') {
    try {
      new (globalThis as any).Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
};

export const notificationService = {
  requestPermission: requestNotificationPermission,
  sendNotification,
  
  // Quiz notifications
  notifyQuizResult: (score: number, passed: boolean, xpEarned: number) => {
    const title = passed ? '✅ أجابتك صحيحة!' : '❌ حاول مرة أخرى';
    sendNotification(title, {
      body: `النتيجة: ${score}% ${xpEarned > 0 ? `• +${xpEarned} XP` : ''}`,
      tag: 'quiz-result',
    });
  },

  notifyNewQuiz: (quizTitle: string, xpReward: number) => {
    sendNotification('🎯 مسابقة جديدة!', {
      body: `${quizTitle} • ${xpReward} XP`,
      tag: 'new-quiz',
      requireInteraction: true,
    });
  },

  // Event notifications
  notifyNewEvent: (eventTitle: string, startTime: string) => {
    sendNotification('📅 حدث جديد!', {
      body: `${eventTitle} • ${new Date(startTime).toLocaleString('ar-EG')}`,
      tag: 'new-event',
      requireInteraction: true,
    });
  },

  notifyEventStarting: (eventTitle: string) => {
    sendNotification('⏰ الحدث يبدأ الآن!', {
      body: eventTitle,
      tag: 'event-starting',
      requireInteraction: true,
    });
  },

  // Sports/Match notifications
  notifyNewMatch: (matchTitle: string, sport: string) => {
    sendNotification('⚽ مباراة جديدة!', {
      body: `${matchTitle} • ${sport}`,
      tag: 'new-match',
      requireInteraction: true,
    });
  },

  notifyMatchLive: (matchTitle: string) => {
    sendNotification('🔴 المباراة مباشرة الآن!', {
      body: matchTitle,
      tag: 'match-live',
      requireInteraction: true,
    });
  },

  notifyMatchResult: (matchTitle: string, result: string, xpEarned: number) => {
    sendNotification('🏆 نتيجة المباراة', {
      body: `${matchTitle}\n${result} • +${xpEarned} XP`,
      tag: 'match-result',
    });
  },

  // Publication/Magazine notifications
  notifyNewPublication: (publicationTitle: string, author: string) => {
    sendNotification('📰 منشور جديد!', {
      body: `${publicationTitle} بقلم ${author}`,
      tag: 'new-publication',
      requireInteraction: true,
    });
  },

  // Achievement notifications
  notifyAchievement: (achievement: string) => {
    sendNotification(`🎉 إنجاز جديد!`, {
      body: achievement,
      tag: 'achievement',
    });
  },

  notifyLevelUp: (levelName: string) => {
    sendNotification(`⬆️ ارتقاء مستوى!`, {
      body: levelName,
      tag: 'level-up',
    });
  },

  // XP notifications
  notifyXpAwarded: (amount: number, reason: string) => {
    sendNotification(`⭐ +${amount} XP`, {
      body: reason,
      tag: 'xp-awarded',
    });
  },

  // Generic notifications
  notifyInfo: (title: string, message: string) => {
    sendNotification(title, {
      body: message,
      tag: 'info',
    });
  },
};

// Real-time event listener setup
let eventListenerInterval: any = null;
let lastEventCheckTime = new Date();

export const startEventListener = async (token: string, onNewEvent?: (event: any) => void) => {
  if (eventListenerInterval) return; // Already running

  const checkForNewEvents = async () => {
    try {
      const response = await axios.get('https://ikigai-backend.replit.app/api/v1/events/recent', {
        headers: { Authorization: `Bearer ${token}` },
        params: { since: lastEventCheckTime.toISOString() },
      });

      const events = response.data.data || [];
      for (const event of events) {
        onNewEvent?.(event);
        
        // Send appropriate notification based on event type
        switch (event.type) {
          case 'QUIZ_CREATED':
            notificationService.notifyNewQuiz(event.data.title, event.data.xpReward);
            break;
          case 'EVENT_CREATED':
            notificationService.notifyNewEvent(event.data.title, event.data.startTime);
            break;
          case 'MATCH_CREATED':
            notificationService.notifyNewMatch(event.data.title, event.data.sport);
            break;
          case 'MATCH_LIVE':
            notificationService.notifyMatchLive(event.data.title);
            break;
          case 'PUBLICATION_CREATED':
            notificationService.notifyNewPublication(event.data.title, event.data.author);
            break;
          case 'ACHIEVEMENT_EARNED':
            notificationService.notifyAchievement(event.data.achievement);
            break;
          case 'LEVEL_UP':
            notificationService.notifyLevelUp(event.data.levelName);
            break;
        }
      }

      lastEventCheckTime = new Date();
    } catch (error) {
      console.error('Error checking for new events:', error);
    }
  };

  // Check for new events every 30 seconds
  eventListenerInterval = setInterval(checkForNewEvents, 30000);
  
  // Initial check
  await checkForNewEvents();
};

export const stopEventListener = () => {
  if (eventListenerInterval) {
    clearInterval(eventListenerInterval);
    eventListenerInterval = null;
  }
};
