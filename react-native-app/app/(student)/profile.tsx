import { displayFont } from '../../theme';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        <Text style={{ fontFamily: displayFont, fontSize: 24, fontWeight: '800', color: '#10131B', marginBottom: 24 }}>Профиль</Text>

        {/* Avatar Card */}
        <View style={{
          backgroundColor: 'white', borderRadius: 12, padding: 28,
          alignItems: 'center', borderWidth: 1, borderColor: '#F3EDE4', marginBottom: 16
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#800F1D', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12
          }}>
            <Text style={{ color: 'white', fontFamily: displayFont, fontSize: 28, fontWeight: '700' }}>
              {getInitials(user?.name || '')}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#10131B' }}>{user?.name}</Text>
          <Text style={{ color: '#756D70', marginTop: 4, fontSize: 14 }}>{user?.email}</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#F4E6E6', paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 12, marginTop: 10
          }}>
            <GraduationCap size={14} color="#800F1D" />
            <Text style={{ color: '#800F1D', fontWeight: '700', fontSize: 13 }}>Студент</Text>
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#fef3c7', paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#fde68a'
          }}>
            <Coins size={14} color="#d97706" />
            <Text style={{ color: '#b45309', fontWeight: '800', fontSize: 13 }}>Баланс: {coins !== null ? coins : '...'} ₿</Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#FCFAF6', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#800F1D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#A29792', fontWeight: '600' }}>АТЫ-ЖӨНІ</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#10131B', marginTop: 2 }}>{user?.name}</Text>
            </View>
          </View>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="#800F1D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#A29792', fontWeight: '600' }}>ЭЛЕКТРОНДЫҚ ПОШТА</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#10131B', marginTop: 2 }}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Quick links */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Жақында', 'Бұл мүмкіндік дайындалуда')}
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#FCFAF6' }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#800F1D" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#10131B' }}>Оқу материалдары</Text>
            <ChevronRight size={18} color="#DFD2C3" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('LuminaPortal', 'Нұсқа: 1.0.0')}
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="#a16207" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#10131B' }}>LuminaPortal туралы</Text>
            <ChevronRight size={18} color="#DFD2C3" />
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
