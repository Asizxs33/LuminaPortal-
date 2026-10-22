import { Tabs, useRouter, useSegments, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Users, User, Plus, Sparkles } from 'lucide-react-native';
import { View, Platform, ActivityIndicator } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const segments=useSegments();
  if(isLoading)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color="#990F2E"/></View>;
  if(!isAuthenticated)return <Redirect href="/login"/>;
  if(!['admin','teacher'].includes(user?.role||''))return <Redirect href="/(student)/dashboard"/>;
  if(user?.role==='teacher'&&segments.some(segment=>['students','history'].includes(segment)))return <Redirect href="/(admin)/dashboard"/>;

  return (
    <Tabs 
      tabBar={(props) => (
        <View className={Platform.OS === 'web' ? 'flex md:hidden' : 'flex'}>
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{ headerShown: false, tabBarActiveTintColor: '#800F1D', tabBarInactiveTintColor: '#756D70', tabBarLabelStyle:{fontSize:10,lineHeight:14,flexShrink:0},tabBarIconStyle:{height:24,flexGrow:0,flexShrink:0},tabBarStyle: { backgroundColor: '#FCFAF7', borderTopColor: '#DFD2C3',height:64,paddingTop:7,paddingBottom:7 } }}
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
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Жасау',
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
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
          title: 'Студенттер', href: user?.role==='admin'?undefined:null,
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
      <Tabs.Screen name="history" options={{href:null}} />
    </Tabs>
  );
}
