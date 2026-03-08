import React from 'react';
import { Platform } from 'react-native';
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
    await logout();
    router.replace('/login');
  };

  return (
    <div className="web-sidebar">
      {/* Brand */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND}, #6366f1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'white', fontWeight: 900,
          }}>L</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>LuminaPortal</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
              {user.role === 'admin' ? '🛡️ Мұғалім' : '🎓 Студент'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', padding: '0 10px 8px', letterSpacing: 1.2, textTransform: 'uppercase' as any }}>
          Навигация
        </div>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: active ? '#eef2ff' : 'transparent',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!active) (e.target as any).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!active) (e.target as any).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <span style={{
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? BRAND : '#475569',
              }}>{item.label}</span>
              {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 3, background: BRAND }} />}
            </button>
          );
        })}
      </div>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: `linear-gradient(135deg, ${BRAND}, #6366f1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 13,
          }}>{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            padding: '8px 10px', borderRadius: 8, border: 'none',
            background: '#fef2f2', cursor: 'pointer', color: '#ef4444',
            fontWeight: 700, fontSize: 13,
          }}
        >
          🚪 Шығу
        </button>
      </div>
    </div>
  );
}
