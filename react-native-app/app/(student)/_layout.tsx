import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, User } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

export default function StudentLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Tabs 
      tabBar={(props) => (
        <View className={Platform.OS === 'web' ? 'flex md:hidden' : 'flex'}>
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4848e5' }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Тақта',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Нәтижелер',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
