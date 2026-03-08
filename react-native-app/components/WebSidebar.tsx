import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, PlusCircle, Sparkles, User, LogOut,
  BookOpen, BarChart3, Settings, GraduationCap, ShieldCheck, Users
} from 'lucide-react-native';

const BRAND_COLOR = '#4848e5';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export default function WebSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  const isActive = (path: string) => pathname?.startsWith(path);

  const studentNav: NavItem[] = [
    { label: 'Дашборд', path: '/(student)/dashboard', icon: <LayoutDashboard size={18} color={isActive('/(student)/dashboard') ? BRAND_COLOR : '#94a3b8'} /> },
    { label: 'Нәтижелер', path: '/(student)/results', icon: <BarChart3 size={18} color={isActive('/(student)/results') ? BRAND_COLOR : '#94a3b8'} /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Тесттер', path: '/(admin)/dashboard', icon: <FileText size={18} color={isActive('/(admin)/dashboard') ? BRAND_COLOR : '#94a3b8'} /> },
    { label: 'Студенттер', path: '/(admin)/students', icon: <Users size={18} color={isActive('/(admin)/students') ? BRAND_COLOR : '#94a3b8'} /> },
    { label: 'Нәтижелер', path: '/(admin)/results', icon: <BarChart3 size={18} color={isActive('/(admin)/results') ? BRAND_COLOR : '#94a3b8'} /> },
  ];

  const navItems = user?.role === 'admin' ? adminNav : studentNav;
  const getInitials = (name: string) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{
      width: 240,
      minHeight: '100vh' as any,
      backgroundColor: 'white',
      borderRightWidth: 1,
      borderRightColor: '#f1f5f9',
      flexDirection: 'column',
      paddingTop: 24,
      paddingBottom: 24,
    }}>
      {/* Brand */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ backgroundColor: BRAND_COLOR, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={18} color="white" />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>LuminaPortal</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600' }}>
            {user?.role === 'admin' ? 'Мұғалім панелі' : 'Студент порталы'}
          </Text>
        </View>
      </View>

      {/* Role badge */}
      {user?.role === 'admin' && (
        <View style={{ marginHorizontal: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <ShieldCheck size={14} color="#7c3aed" />
          <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 12 }}>Администратор</Text>
        </View>
      )}

      {/* Navigation */}
      <View style={{ flex: 1, paddingHorizontal: 12, gap: 2 }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#94a3b8', paddingHorizontal: 8, marginBottom: 6, letterSpacing: 1 }}>
          НАВИГАЦИЯ
        </Text>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
                backgroundColor: active ? '#eef2ff' : 'transparent',
                marginBottom: 2,
              }}
            >
              {item.icon}
              <Text style={{ fontWeight: active ? '700' : '600', fontSize: 14, color: active ? BRAND_COLOR : '#475569' }}>
                {item.label}
              </Text>
              {active && <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND_COLOR }} />
              </View>}
            </TouchableOpacity>
          );
        })}

        {/* Admin: switch to student view */}
        {user?.role === 'admin' && (
          <>
            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 12, marginHorizontal: 8 }} />
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#94a3b8', paddingHorizontal: 8, marginBottom: 6, letterSpacing: 1 }}>
              СТУДЕНТ РЕЖИМІ
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(student)/dashboard' as any)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: 'transparent' }}
            >
              <GraduationCap size={18} color="#94a3b8" />
              <Text style={{ fontWeight: '600', fontSize: 14, color: '#475569' }}>Студент ретінде кіру</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Bottom: User profile */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND_COLOR, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>{getInitials(user?.name || '')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 13 }} numberOfLines={1}>{user?.name}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11 }} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fef2f2' }}
        >
          <LogOut size={15} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Шығу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
