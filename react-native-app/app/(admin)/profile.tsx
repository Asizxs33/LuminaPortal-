import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, Shield, BookOpen, ChevronRight, Settings } from 'lucide-react-native';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Шығу',
      'Жүйеден шығуды растаңыз',
      [
        { text: 'Бас тарту', style: 'cancel' },
        {
          text: 'Шығу',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 24 }}>Профиль</Text>

        {/* Avatar Card */}
        <View style={{
          backgroundColor: 'white', borderRadius: 20, padding: 24,
          alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16
        }}>
          {/* Avatar */}
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, shadowColor: '#4848e5', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
          }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>
              {getInitials(user?.name || '')}
            </Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>{user?.name || 'Пайдаланушы'}</Text>
          <Text style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{user?.email}</Text>

          {/* Role badge */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 5,
            borderRadius: 20, marginTop: 10
          }}>
            <Shield size={14} color="#7c3aed" />
            <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 13 }}>Әкімші</Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>АТЫ-ЖӨНІ</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{user?.name}</Text>
            </View>
          </View>

          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>ЭЛЕКТРОНДЫҚ ПОШТА</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}
            onPress={() => Alert.alert('Жақында', 'Бұл мүмкіндік дайындалуда')}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} color="#a16207" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Баптаулар</Text>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            onPress={() => Alert.alert('LuminaPortal', 'Нұсқа: 1.0.0')}
          >
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#7c3aed" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a' }}>LuminaPortal туралы</Text>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
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
