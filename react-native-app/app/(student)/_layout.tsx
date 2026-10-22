import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutGrid, BarChart3, User } from 'lucide-react-native';
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
      screenOptions={{ headerShown: false, tabBarActiveTintColor: '#800F1D', tabBarInactiveTintColor: '#756D70', tabBarLabelStyle:{fontSize:12,lineHeight:16,marginTop:2,flexShrink:0}, tabBarIconStyle:{height:26,flexGrow:0,flexShrink:0}, tabBarStyle: { backgroundColor: '#FCFAF7', borderTopColor: '#DFD2C3',height:68,paddingTop:8,paddingBottom:8 } }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Тақта',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
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
          tabBarIcon: ({ color, size, focused }) => <View style={{alignItems:'center'}}>{focused&&<View style={{position:'absolute',top:-9,width:24,height:3,borderRadius:3,backgroundColor:'#800F1D'}}/>}<User size={size} color={color} /></View>,
        }}
      />
    </Tabs>
  );
}
