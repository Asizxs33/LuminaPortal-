import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';

if (Platform.OS !== 'web') {
  // Export nothing on native
  module.exports = { default: () => null };
}

const BRAND = '#4848e5';

export default function WebSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hide sidebar on login/register/landing pages or if not logged in
  const authRoutes = ['/', '/login', '/register'];
  if (!user || authRoutes.includes(pathname || '/')) {
    return null;
  }

  const isActive = (path: string) => pathname?.startsWith(path);

  const navItems = user.role === 'admin'
    ? [
        { label: 'Тесттер', path: '/(admin)/dashboard', emoji: '📝' },
        { label: 'Студенттер', path: '/(admin)/students', emoji: '👥' },
        { label: 'Нәтижелер', path: '/(admin)/results', emoji: '📊' },
      ]
    : [
        { label: 'Дашборд', path: '/(student)/dashboard', emoji: '📋' },
        { label: 'Нәтижелер', path: '/(student)/results', emoji: '📊' },
      ];

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
    <View style={{
      width: 240,
      backgroundColor: 'white',
      borderRightWidth: 1,
      borderRightColor: '#f1f5f9',
      flexDirection: 'column',
      flex: 1,
    }}>
      {/* Brand */}
      <View style={{ padding: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 38, height: 38, borderRadius: 10,
            backgroundColor: BRAND,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, color: 'white', fontWeight: '900' }}>L</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>LuminaPortal</Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>
              {user.role === 'admin' ? '🛡️ Мұғалім' : '🎓 Студент'}
            </Text>
          </View>
        </View>
      </View>

      {/* Nav */}
      <View style={{ flex: 1, padding: 16, gap: 4 }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#94a3b8', paddingHorizontal: 10, marginBottom: 8, letterSpacing: 1 }}>
          НАВИГАЦИЯ
        </Text>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
                backgroundColor: active ? '#eef2ff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              <Text style={{
                fontSize: 13, fontWeight: active ? '700' : '500',
                color: active ? BRAND : '#475569',
              }}>{item.label}</Text>
              {active && <View style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND }} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User */}
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: BRAND,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>{initials}</Text>
          </View>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 13 }} numberOfLines={1}>{user.name}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11 }} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8,
            backgroundColor: '#fef2f2',
          }}
        >
          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>🚪 Шығу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
