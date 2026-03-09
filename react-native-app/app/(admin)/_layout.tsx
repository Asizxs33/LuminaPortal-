import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Users, User, Plus, Sparkles } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'admin') {
      router.replace('/(student)/dashboard');
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
          title: 'Конструктор',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'ЖИ',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          href: Platform.OS === 'web' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Жасау',
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
          href: Platform.OS === 'web' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Аналитика',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Студенттер',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="test/[id]/edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="test/[id]/results"
        options={{ href: null }}
      />
    </Tabs>
  );
}
