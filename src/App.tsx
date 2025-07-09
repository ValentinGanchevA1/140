import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { LocationService } from './services/location/LocationService';
import { PushNotificationService } from './services/push/PushNotificationService';
// Screens
import MapScreen from './screens/main/MapScreen';
import ChatListScreen from './screens/social/ChatListScreen';
import SwipeScreen from './screens/dating/SwipeScreen';
import MarketplaceScreen from './screens/trading/MarketplaceScreen';
import ProfileScreen from './screens/main/ProfileScreen';
// Icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

interface TabConfig {
  name: string;
  component: React.ComponentType<any>;
  iconName: string;
}

const TAB_CONFIGS: TabConfig[] = [
  { name: 'Map', component: MapScreen, iconName: 'map' },
  { name: 'Chat', component: ChatListScreen, iconName: 'chat' },
  { name: 'Dating', component: SwipeScreen, iconName: 'favorite' },
  { name: 'Marketplace', component: MarketplaceScreen, iconName: 'shopping-cart' },
  { name: 'Profile', component: ProfileScreen, iconName: 'person' },
];

const TAB_BAR_THEME = {
  activeTintColor: '#007AFF',
  inactiveTintColor: 'gray',
} as const;

const createTabBarIcon = (iconName: string) =>
  ({ color, size }: { color: string; size: number }) => (
    <Icon name={iconName} size={size} color={color} />
  );

const initializeAppServices = async (): Promise<void> => {
  try {
    await LocationService.initialize();
    if (typeof PushNotificationService.initialize === 'function') {
      await PushNotificationService.initialize();
    }
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
};

const cleanupAppServices = (): void => {
  if (typeof LocationService.cleanup === 'function') {
    LocationService.cleanup();
  }
  if (typeof PushNotificationService.cleanup === 'function') {
    PushNotificationService.cleanup();
  }
};

const App: React.FC = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeAppServices();
      } catch (error) {
        console.error('Service initialization failed:', error);
        // Consider showing user feedback or fallback UI
      }
    };

    initializeApp();
    return cleanupAppServices;
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: TAB_BAR_THEME.activeTintColor,
              tabBarInactiveTintColor: TAB_BAR_THEME.inactiveTintColor,
            }}
          >
            {TAB_CONFIGS.map(({ name, component, iconName }) => (
              <Tab.Screen
                name={name}
                component={component}
                options={{
                  tabBarIcon: createTabBarIcon(iconName),
                }}
              />
            ))}
          </Tab.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
