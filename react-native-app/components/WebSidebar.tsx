import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Users, BarChart3, Plus, Sparkles, User, LogOut, LayoutDashboard, House } from 'lucide-react-native';
import BrandMark from './BrandMark';

if (Platform.OS !== 'web') {
  // Export nothing on native
  module.exports = { default: () => null };
}

export default function WebSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hide sidebar on login/register/landing pages or if not logged in
  const authRoutes = ['/', '/login', '/register'];
  if (!user || authRoutes.includes(pathname || '/')) {
    return null;
  }

  const isActive = (path: string) => {
    const normalized = path.replace(/\/\([^/]+\)/g, '');
    return pathname === normalized || pathname === path;
  };

  const adminNavItems = [
    { label: 'Басты бет', path: '/(admin)/dashboard', icon: LayoutDashboard, House },
    { label: 'Тест жасау', path: '/(admin)/create', icon: Plus },
    { label: 'Сұрақ генераторы', path: '/(admin)/ai', icon: Sparkles },
    { label: 'Студенттер', path: '/(admin)/students', icon: Users },
    { label: 'Нәтижелер', path: '/(admin)/results', icon: BarChart3 },
    { label: 'Профиль', path: '/(admin)/profile', icon: User },
  ];

  const studentNavItems = [
    { label: 'Басты бет', path: '/(student)/dashboard', icon: House, House },
    { label: 'Нәтижелер', path: '/(student)/results', icon: BarChart3 },
  ];

  const navItems = user.role === 'admin' ? adminNavItems : studentNavItems;

  const initials = (user.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <View className="w-[264px] bg-white border-r border-[#E0E5ED] flex-col flex-1 z-50">
      
      {/* Brand Header */}
      <View className="p-5 pb-5 border-b border-[#E0E5ED]">
        <BrandMark compact />
        <Text className="text-[12px] text-[#707B90] font-bold mt-3 ml-1">
          {user.role === 'admin' ? 'Мұғалім кабинеті' : 'Оқушы кабинеті'}
        </Text>
      </View>

      {/* Navigation Links */}
      <View className="flex-1 p-4 gap-1.5 overflow-hidden">
        <Text className="text-[12px] font-bold text-[#707B90] px-3 mb-2">
          Мәзір
        </Text>
        
        {navItems.map(item => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-[#FBEFF3] border border-transparent'
                  : 'bg-transparent border border-transparent hover:bg-[#FCFAF6]'
              }`}
            >
              <IconComponent 
                size={22}
                color={active ? '#990F2E' : '#707B90'}
                strokeWidth={active ? 2.5 : 2}
              />
              <Text className={`text-[16px] ${active ? 'font-bold text-[#990F2E]' : 'font-bold text-[#707B90]'}`}>
                {item.label}
              </Text>
              {active && (
                <View className="ml-auto w-1.5 h-1.5 rounded-full bg-[#990F2E]" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Footer Profile */}
      <View className="p-4 border-t border-[#E0E5ED] bg-white">
        <View className="flex-row items-center gap-3 mb-3 p-2">
          <View className="w-10 h-10 rounded-full bg-[#FBEFF3] items-center justify-center border border-[#E0E5ED]">
            <Text className="text-[#990F2E] font-bold text-[13px]">{initials}</Text>
          </View>
          <View className="flex-[1] overflow-hidden">
            <Text className="font-bold text-[#101827] text-[17px]" numberOfLines={1}>{user.name}</Text>
            <Text className="text-[#707B90] text-[13px] font-medium" numberOfLines={1}>{user.role === 'admin' ? 'Мұғалім' : 'Оқушы'}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center gap-3 px-2 py-3 border-t border-[#E0E5ED]"
        >
          <LogOut size={16} color="#990F2E" />
          <Text className="text-[#990F2E] font-bold text-[13px]">Жүйеден шығу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
