import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, BarChart3, Plus, Sparkles, User, Settings, LogOut, LayoutDashboard } from 'lucide-react-native';

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

  const isActive = (path: string) => pathname === path || (path !== '/(admin)/dashboard' && pathname?.startsWith(path));

  const adminNavItems = [
    { label: 'Басты бет', path: '/(admin)/dashboard', icon: LayoutDashboard },
    { label: 'Тест жасау', path: '/(admin)/create', icon: Plus },
    { label: 'Сұрақ генераторы', path: '/(admin)/ai', icon: Sparkles },
    { label: 'Студенттер', path: '/(admin)/students', icon: Users },
    { label: 'Нәтижелер', path: '/(admin)/results', icon: BarChart3 },
    { label: 'Профиль', path: '/(admin)/profile', icon: User },
  ];

  const studentNavItems = [
    { label: 'Басты бет', path: '/(student)/dashboard', icon: LayoutDashboard },
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
    <View className="w-[260px] bg-white/80 backdrop-blur-3xl border-r border-white flex-col flex-1 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      
      {/* Brand Header */}
      <View className="p-6 pb-5 border-b border-slate-100/60">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-600/30">
            <BookOpen size={20} color="white" />
          </View>
          <View>
            <Text className="text-base font-black text-slate-900 tracking-tight">LuminaPortal</Text>
            <Text className="text-[11px] text-indigo-500 font-bold tracking-wider uppercase">
              {user.role === 'admin' ? 'Мұғалім режимі' : 'Студент режимі'}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Links */}
      <View className="flex-1 p-4 gap-1.5 overflow-hidden">
        <Text className="text-[10px] font-black text-slate-400 px-3 mb-2 tracking-[0.15em] uppercase">
          Навигация мәзірі
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
                  ? 'bg-indigo-50 border border-indigo-100/50' 
                  : 'bg-transparent border border-transparent hover:bg-slate-50'
              }`}
            >
              <IconComponent 
                size={20} 
                color={active ? '#4848e5' : '#64748b'} 
                strokeWidth={active ? 2.5 : 2}
              />
              <Text className={`text-[14px] ${active ? 'font-black text-indigo-600' : 'font-bold text-slate-600'}`}>
                {item.label}
              </Text>
              {active && (
                <View className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-600/50" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Footer Profile */}
      <View className="p-4 border-t border-slate-100/60 bg-white/40">
        <View className="flex-row items-center gap-3 mb-3 p-2">
          <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center border border-indigo-200">
            <Text className="text-indigo-700 font-black text-[13px]">{initials}</Text>
          </View>
          <View className="flex-[1] overflow-hidden">
            <Text className="font-bold text-slate-900 text-[13px]" numberOfLines={1}>{user.name}</Text>
            <Text className="text-slate-500 text-[11px] font-medium" numberOfLines={1}>{user.email}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50/80 hover:bg-red-100 transition-colors border border-red-100/50"
        >
          <LogOut size={16} color="#ef4444" />
          <Text className="text-red-500 font-black text-[13px]">Жүйеден шығу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
