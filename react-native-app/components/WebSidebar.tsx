import { notify } from '../lib/notify';
import { confirmAction } from '../lib/confirmAction';
import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Users, BarChart3, Plus, Sparkles, User, LogOut, History, LayoutGrid, ChevronRight, House, BookOpen, Info } from 'lucide-react-native';
import BrandMark from './BrandMark';

if (Platform.OS !== 'web') {
  // Export nothing on native
  module.exports = { default: () => null };
}

export default function WebSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const studentView = user?.role !== 'admin' || segments[0] === '(student)';

  // Hide sidebar on login/register/landing pages or if not logged in
  const authRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  if (!user || authRoutes.includes(pathname || '/')) {
    return null;
  }

  const isActive = (path: string) => {
    const normalized = path.replace(/\/\([^/]+\)/g, '');
    return pathname === normalized || pathname === path || (normalized === '/results' && /^\/test\/[^/]+\/results?$/.test(pathname || '')) || (normalized === '/create' && /^\/test\/[^/]+\/edit$/.test(pathname || ''));
  };

  const adminNavItems = [
    { label: 'Басты бет', path: '/(admin)/dashboard', icon: LayoutGrid, ChevronRight, House, BookOpen, Info },
    { label: 'Тест жасау', path: '/(admin)/create', icon: Plus },
    { label: 'Сұрақ генераторы', path: '/(admin)/ai', icon: Sparkles },
    { label: 'Студенттер', path: '/(admin)/students', icon: Users },
    { label: 'Нәтижелер', path: '/(admin)/results', icon: BarChart3 },
    { label: 'Профиль', path: '/(admin)/profile', icon: User },
    { label: 'Тарих және көшірмелер', path: '/(admin)/history', icon: History },
  ];

  const studentNavItems = [
    { label: 'Басты бет', path: '/(student)/dashboard', icon: LayoutGrid },
    { label: 'Нәтижелер', path: '/(student)/results', icon: BarChart3 },
    { label: 'Профиль', path: '/(student)/profile', icon: User },
  ];

  const navItems = studentView ? studentNavItems : adminNavItems;

  const initials = (user.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    if (!await confirmAction('Жүйеден шығуды растаңыз')) return;
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
    <View className="w-[264px] bg-white border-r border-[#E7E1DC] flex-col flex-1 z-50">
      
      {/* Brand Header */}
      <View className="p-5 pb-5 border-b border-[#E7E1DC]">
        <BrandMark compact />
        <Text className="text-[12px] text-[#707B90] font-bold mt-3 ml-1">
          {studentView ? 'Студент кабинеті' : 'Мұғалім кабинеті'}
        </Text>
      </View>

      {/* Navigation Links */}
      <View className="flex-1 p-4 pt-6 gap-2 overflow-hidden">

        
        {navItems.map(item => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-[#940B27] border border-transparent'
                  : 'bg-transparent border border-transparent hover:bg-[#FCFAF6]'
              }`}
            >
              <IconComponent 
                size={22}
                color={active ? '#FFFFFF' : '#687080'}
                strokeWidth={active ? 2.5 : 2}
              />
              <Text className={`flex-1 text-[16px] ${active ? 'font-bold text-white' : 'font-bold text-[#707B90]'}`}>
                {item.label}
              </Text>
              {active && (
                <ChevronRight size={16} color="white" />
              )}
            </TouchableOpacity>
          );
        })}
        {studentView&&<View style={{borderTopWidth:1,borderTopColor:'#E7E1DC',marginTop:15,paddingTop:15,gap:8}}>{[{label:'Оқу материалдары',Icon:BookOpen,message:'Оқу материалдары бөлімі дайындалуда.'},{label:'LuminaPortal туралы',Icon:Info,message:'LuminaPortal — білімді бағалау және оқу нәтижелерін талдау платформасы.'}].map(({label,Icon,message})=><TouchableOpacity accessibilityRole="button" key={label} onPress={()=>notify.info(message)} style={{flexDirection:'row',alignItems:'center',gap:14,paddingHorizontal:14,paddingVertical:13}}><Icon size={22} color="#7C8497"/><Text style={{flex:1,fontSize:14,lineHeight:21,color:'#7C8497'}}>{label}</Text></TouchableOpacity>)}</View>}
      </View>

      {/* User Footer Profile */}
      <View className="p-4 border-t border-[#E7E1DC] bg-white">
        <View className="flex-row items-center gap-3 mb-3 p-2">
          <View className="w-10 h-10 rounded-full bg-[#FBEFF3] items-center justify-center border border-[#E7E1DC]">
            <Text className="text-[#990F2E] font-bold text-[13px]">{initials}</Text>
          </View>
          <View className="flex-[1] overflow-hidden">
            <Text className="font-bold text-[#101827] text-[17px]" numberOfLines={1}>{user.name}</Text>
            <Text className="text-[#707B90] text-[13px] font-medium" numberOfLines={1}>{studentView ? 'Студент' : 'Мұғалім'}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center gap-3 px-2 py-3 border-t border-[#E7E1DC]"
        >
          <LogOut size={16} color="#990F2E" />
          <Text className="text-[#990F2E] font-bold text-[13px]">Жүйеден шығу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
