import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useAvailableQuizzes, useFootballMatches, useMyQuizSubmissions, useActiveSessions, useMyXpHistory, usePublications, useAdminSettings, useUpcomingTournamentMatches, useTournaments } from '../hooks/useApi';
import { COLORS } from '../config/constants';
import { useViewed } from '../contexts/ViewedContext';
import { notificationService, startEventListener, stopEventListener } from '../lib/notifications';
import { pushNotificationService } from '../lib/pushNotifications';
import { getAccessToken } from '../lib/storage';
import { getNavConfigAsync, type NavConfig } from '../lib/navConfig';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SportsScreen from '../screens/SportsScreen';
import TournamentScreen from '../screens/TournamentScreen';
import EventsScreen from '../screens/EventsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import LoadingScreen from '../screens/LoadingScreen';
import InfoScreen from '../screens/InfoScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  QuizPlay: { quizId: string; title: string };
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Library: undefined;
  Sports: undefined;
  Tournament: undefined;
  Leaderboard: undefined;
  Scan: undefined;
  Quizzes: undefined;
  Profile: undefined;
  Info: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { position: 'absolute', top: -2, right: -6, backgroundColor: COLORS.error, borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: COLORS.surface },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
});

function MainTabs() {
  const { t } = useLang();
  const { viewedPublicationIds } = useViewed();
  const { data: quizzes } = useAvailableQuizzes();
  const { data: matches } = useFootballMatches();
  const { data: submissions } = useMyQuizSubmissions();
  const { data: sessions } = useActiveSessions();
  const { data: history } = useMyXpHistory();
  const { data: publications } = usePublications();
  const { data: adminSettings } = useAdminSettings();
  const { data: tournamentMatches } = useUpcomingTournamentMatches();
  const { data: tournaments } = useTournaments();
  const [navConfig, setNavConfig] = useState<NavConfig>({});

  // Load nav config on mount
  useEffect(() => {
    const loadNavConfig = async () => {
      const config = await getNavConfigAsync();
      setNavConfig(config);
    };
    loadNavConfig();
  }, []);

  // Determine tab visibility based on admin settings (default true if no settings)
  const showSportsTab = adminSettings?.sportsTabVisibilityMobile ?? true;
  const showTournamentTab = adminSettings?.tournamentVisibilityMobile ?? true;

  // Define all possible tabs with their config keys
  const allTabs = [
    { name: 'Home', component: HomeScreen, configKey: 'dashboard' as const, label: 'home' },
    { name: 'Profile', component: ProfileScreen, configKey: 'profile' as const, label: 'profile' },
    { name: 'Leaderboard', component: LeaderboardScreen, configKey: 'leaderboard' as const, label: 'leaderboard' },
    { name: 'Events', component: EventsScreen, configKey: 'events' as const, label: 'events' },
    { name: 'Quizzes', component: QuizListScreen, configKey: 'quizzes' as const, label: 'quizzes' },
    { name: 'Library', component: LibraryScreen, configKey: 'library' as const, label: 'library' },
    ...(showSportsTab ? [{ name: 'Sports', component: SportsScreen, configKey: 'sports' as const, label: 'sports' }] : []),
    ...(showTournamentTab ? [{ name: 'Tournament', component: TournamentScreen, configKey: 'tournament' as const, label: 'tournament' }] : []),
    { name: 'Scan', component: ScannerScreen, configKey: 'scanQr' as const, label: 'scanQr' },
    { name: 'Info', component: InfoScreen, configKey: 'info' as const, label: 'info' },
  ];

  // Filter tabs based on nav config
  const visibleTabs = allTabs.filter(tab => navConfig[tab.configKey] !== false);

  // Badge counts
  const submittedIds = new Set((submissions || []).map((s: any) => s.quizId));
  const newQuizzes = (quizzes || []).filter(q => !submittedIds.has(q.id)).length;
  const liveMatches = (matches || []).filter(m => m.status === 'LIVE').length;
  const activeTournaments = (tournaments || []).filter(t => t.status === 'LIVE' || t.status === 'GROUP_STAGE').length;

  const attendedSessionIds = new Set(
    (history || []).filter(tx => tx.sourceType === 'SESSION' && tx.sourceId).map(tx => tx.sourceId)
  );
  const now = new Date();
  const upcomingSessions = (sessions || []).filter(s => !attendedSessionIds.has(s.id) && new Date(s.endTime) > now);
  const upcomingMatches = (matches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const upcomingTournamentMatches = (tournamentMatches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').length;
  const unsubmittedQuizzes = (quizzes || []).filter(q => !submittedIds.has(q.id));
  const eventsCount = upcomingSessions.length + upcomingMatches.length + upcomingTournamentMatches + unsubmittedQuizzes.length;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newPublications = (publications || []).filter((p: any) => p.publishedAt && new Date(p.publishedAt) > oneDayAgo && !viewedPublicationIds.has(p.id)).length;

  // Badge counts based on real user actions:
  // - Sports: live matches user hasn't viewed
  // - Library: new publications user hasn't opened
  // - Events: sessions user hasn't attended + scheduled/live matches + unsubmitted quizzes
  // - Tournament: tournaments currently LIVE or in GROUP_STAGE
  // - Quizzes: quizzes user hasn't submitted
  const getBadge = (tabName: string) => {
    switch (tabName) {
      case 'Events': return eventsCount;
      case 'Library': return newPublications;
      case 'Sports': return liveMatches;
      case 'Tournament': return activeTournaments;
      case 'Quizzes': return newQuizzes;
      default: return 0;
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 56,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Events': iconName = focused ? 'calendar' : 'calendar-outline'; break;
            case 'Library': iconName = focused ? 'book' : 'book-outline'; break;
            case 'Sports': iconName = focused ? 'football' : 'football-outline'; break;
            case 'Tournament': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Leaderboard': iconName = focused ? 'podium' : 'podium-outline'; break;
            case 'Scan': iconName = focused ? 'qr-code' : 'qr-code-outline'; break;
            case 'Quizzes': iconName = focused ? 'help-circle' : 'help-circle-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            case 'Info': iconName = focused ? 'information-circle' : 'information-circle-outline'; break;
          }
          const badge = getBadge(route.name);
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? COLORS.primary + '18' : 'transparent',
              overflow: 'visible',
            }}>
              <Ionicons name={iconName} size={focused ? 22 : 20} color={color} />
              {badge > 0 && <NotificationBadge count={badge} />}
            </View>
          );
        },
      })}
    >
      {visibleTabs.map((tab) => (
        <Tab.Screen 
          key={tab.name}
          name={tab.name as any} 
          component={tab.component} 
          options={{ 
            tabBarLabel: t(tab.label) || tab.label,
            tabBarIcon: ({ color, size, focused }) => {
              const iconMapping: { [key: string]: [string, string] } = {
                Home: ['home', 'home-outline'],
                Events: ['calendar', 'calendar-outline'],
                Library: ['book', 'book-outline'],
                Sports: ['football', 'football-outline'],
                Tournament: ['trophy', 'trophy-outline'],
                Leaderboard: ['trophy', 'trophy-outline'],
                Scan: ['qr-code', 'qr-code-outline'],
                Quizzes: ['help-circle', 'help-circle-outline'],
                Profile: ['person', 'person-outline'],
                Info: ['information-circle', 'information-circle-outline'],
              };
              const [focusedIcon, unfocusedIcon] = iconMapping[tab.name] || ['home', 'home-outline'];
              const iconName = focused ? focusedIcon : unfocusedIcon;
              const badge = getBadge(tab.name);
              
              return (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: focused ? COLORS.primary + '18' : 'transparent',
                  overflow: 'visible',
                }}>
                  <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={focused ? 22 : 20} color={color} />
                  {badge > 0 && <NotificationBadge count={badge} />}
                </View>
              );
            }
          }} 
        />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Request notification permission on app start
    notificationService.requestPermission().catch(console.error);
    
    // Set up push notification listeners
    const cleanup = pushNotificationService.setupNotificationListeners();
    return cleanup;
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Register for push notifications and start listening for events
      const setupNotifications = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            // Register push token
            const pushToken = await pushNotificationService.getPushToken();
            if (pushToken.token) {
              await pushNotificationService.registerPushToken(user.userId, pushToken.token, token);
            }

            // Start event listener
            startEventListener(token);
          }
        } catch (error) {
          console.error('Failed to setup notifications:', error);
        }
      };
      setupNotifications();

      // Cleanup when user logs out
      return () => {
        stopEventListener();
      };
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="QuizPlay"
              component={QuizPlayScreen}
              options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.surface }, headerTintColor: COLORS.text }}
            />

          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterWrapper} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RegisterWrapper({ navigation }: any) {
  return <RegisterScreen onBack={() => navigation.goBack()} />;
}
