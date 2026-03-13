import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, GraduationCap, ChevronRight, BookOpen, Coins } from 'lucide-react-native';

import { API } from '../constants/api';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`${API}/api/users/coins?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setCoins(data.coins);
          }
        } catch (error) {
          console.error('Error fetching coins', error);
        }
      }
    };
    fetchCoins();
  }, [user?.id]);

  const handleLogout = () => {
    Alert.alert(
      'Шығу',
      'Жүйеден шығуды растаңыз',
      [
        { text: 'Бас тарту', style: 'cancel' },
        {
          text: 'Шығу', style: 'destructive',
          onPress: async () => { await logout(); router.replace('/login'); }
        }
      ]
    );
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 24 }}>Профиль</Text>

        {/* Avatar Card */}
        <View style={{
          backgroundColor: 'white', borderRadius: 20, padding: 28,
          alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
          }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>
              {getInitials(user?.name || '')}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>{user?.name}</Text>
          <Text style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{user?.email}</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#dcfce7', paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20, marginTop: 10
          }}>
            <GraduationCap size={14} color="#15803d" />
            <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 13 }}>Студент</Text>
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#fef3c7', paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: '#fde68a'
          }}>
            <Coins size={14} color="#d97706" />
            <Text style={{ color: '#b45309', fontWeight: '800', fontSize: 13 }}>Баланс: {coins !== null ? coins : '...'} ₿</Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>АТЫ-ЖӨНІ</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{user?.name}</Text>
            </View>
          </View>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>ЭЛЕКТРОНДЫҚ ПОШТА</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Quick links */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Жақында', 'Бұл мүмкіндік дайындалуда')}
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#7c3aed" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Оқу материалдары</Text>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('LuminaPortal', 'Нұсқа: 1.0.0')}
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="#a16207" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a' }}>LuminaPortal туралы</Text>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            backgroundColor: '#fee2e2', paddingVertical: 16, borderRadius: 14,
            borderWidth: 1, borderColor: '#fecaca'
          }}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 16 }}>Жүйеден шығу</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
