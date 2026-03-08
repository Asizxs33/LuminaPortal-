import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, ShieldCheck, GraduationCap, BarChart3, FileText, CheckCircle2, Mail } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://172.20.10.2:3001';

interface Student {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  group_name: string | null;
  tests_completed: number;
  avg_score: number;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error('Students fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: number, role: 'student' | 'admin') => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/students/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, role } : s));
        Alert.alert('✅', `Рөл өзгерті: ${role === 'admin' ? 'Әкімші' : 'Студент'}`);
      }
    } catch {
      Alert.alert('Қате', 'Рөл өзгерту сәтсіз болды');
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.group_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalTests = students.reduce((a, s) => a + (s.tests_completed || 0), 0);
  const avgAll = students.filter(s => s.avg_score > 0).length
    ? Math.round(students.filter(s => s.avg_score > 0).reduce((a, s) => a + s.avg_score, 0) / students.filter(s => s.avg_score > 0).length)
    : 0;

  const avatarColors = ['#4848e5', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0284c7'];

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4848e5" />
        <Text style={{ marginTop: 12, color: '#64748b', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Студенттер</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>Жүйеге тіркелген пайдаланушылар</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Users size={20} color="#15803d" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a' }}>{students.length}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Барлық қолданушы</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <FileText size={20} color="#2563eb" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a' }}>{totalTests}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Аяқталған тесттер</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <BarChart3 size={20} color="#7c3aed" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a' }}>{avgAll}%</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Орташа балл</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 }}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Аты, email немесе топ..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, marginLeft: 8, paddingVertical: 12, color: '#0f172a', fontSize: 14 }}
          />
        </View>

        {/* Students List */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Users size={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '600' }}>Студент табылмады</Text>
            </View>
          ) : (
            filtered.map((s, i) => (
              <View key={s.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#f1f5f9' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: avatarColors[s.id % avatarColors.length], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{getInitials(s.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14 }}>{s.name}</Text>
                    {s.role === 'admin' && (
                      <View style={{ backgroundColor: '#ede9fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: '#7c3aed', fontSize: 10, fontWeight: '700' }}>Әкімші</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{s.email}</Text>
                  {s.group_name && (
                    <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 1 }}>📚 {s.group_name}</Text>
                  )}
                </View>
                {/* Role toggle */}
                <TouchableOpacity
                  onPress={() => Alert.alert(
                    'Рөлді өзгерту',
                    `${s.name} — рөлін өзгерту`,
                    [
                      { text: 'Бас тарту', style: 'cancel' },
                      {
                        text: s.role === 'admin' ? 'Студент ету' : 'Әкімші ету',
                        onPress: () => changeRole(s.id, s.role === 'admin' ? 'student' : 'admin')
                      }
                    ]
                  )}
                  style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 10 }}
                >
                  {s.role === 'admin'
                    ? <ShieldCheck size={18} color="#4848e5" />
                    : <GraduationCap size={18} color="#64748b" />}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 12 }}>
          {filtered.length} / {students.length} қолданушы
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
