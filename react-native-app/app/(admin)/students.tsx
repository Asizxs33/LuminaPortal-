import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, ShieldCheck, GraduationCap, BarChart3, FileText, CheckCircle2, Mail, Trash2, Coins } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

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
      const res = await fetch(`${API}/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, role } : s));
        Alert.alert('✅', `Рөл өзгерті: ${role === 'admin' ? 'Әкімші' : 'Студент'}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert('Қате', errData.error || 'Рөл өзгерту сәтсіз болды (Сервер қатесі)');
      }
    } catch {
      Alert.alert('Қате', 'Сервермен байланыс үзілді немесе желіде ақау бар');
    }
  };

  const grantCoins = async (student: Student, amount: number) => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/admin/users/grant-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: student.id, amount }),
      });
      if (res.ok) {
        Alert.alert('✅', `${student.name} қолданушысына ${amount} ₿ қосылды!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert('Қате', errData.error || 'Биткоин жіберу сәтсіз болды');
      }
    } catch {
      Alert.alert('Қате', 'Сервермен байланыс үзілді немесе желіде ақау бар');
    }
  };

  const deleteStudent = async (student: Student) => {
    const handleConfirm = async () => {
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/students/${student.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStudents(prev => prev.filter(s => s.id !== student.id));
        } else {
          Alert.alert('Қате', 'Студент өшірілмеді');
        }
      } catch {
        Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`«${student.name}» пайдаланушысын толық өшіресіз бе?`)) handleConfirm();
    } else {
      Alert.alert(
        'Жою',
        `«${student.name}» пайдаланушысын толық өшіресіз бе?`,
        [
          { text: 'Бас тарту', style: 'cancel' },
          { text: 'Өшіру', style: 'destructive', onPress: handleConfirm }
        ]
      );
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

  const avatarColors = ['#800F1D', '#800F1D', '#059669', '#d97706', '#dc2626', '#800F1D'];

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: displayFont, fontSize: 24, fontWeight: '800', color: '#10131B' }}>Студенттер</Text>
          <Text style={{ color: '#756D70', marginTop: 4 }}>Жүйеге тіркелген пайдаланушылар</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Users size={20} color="#15803d" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{students.length}</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2 }}>Барлық қолданушы</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <FileText size={20} color="#800F1D" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{totalTests}</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2 }}>Аяқталған тесттер</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <BarChart3 size={20} color="#800F1D" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{avgAll}%</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2 }}>Орташа балл</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#DFD2C3', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 }}>
          <Search size={16} color="#A29792" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Аты, email немесе топ..."
            placeholderTextColor="#A29792"
            style={{ flex: 1, marginLeft: 8, paddingVertical: 12, color: '#10131B', fontSize: 14 }}
          />
        </View>

        {/* Students List */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Users size={40} color="#DFD2C3" />
              <Text style={{ color: '#A29792', marginTop: 12, fontWeight: '600' }}>Студент табылмады</Text>
            </View>
          ) : (
            filtered.map((s, i) => (
              <View key={s.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#F3EDE4' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: avatarColors[s.id % avatarColors.length], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{getInitials(s.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontWeight: '700', color: '#10131B', fontSize: 14 }}>{s.name}</Text>
                    {s.role === 'admin' && (
                      <View style={{ backgroundColor: '#F4E6E6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: '#800F1D', fontSize: 10, fontWeight: '700' }}>Әкімші</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: '#756D70', fontSize: 12, marginTop: 2 }}>{s.email}</Text>
                  {s.group_name && (
                    <Text style={{ color: '#A29792', fontSize: 11, marginTop: 1 }}>📚 {s.group_name}</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const nextRole = s.role === 'admin' ? 'student' : 'admin';
                      if (Platform.OS === 'web') {
                        if (window.confirm(`${s.name} — ${s.role === 'admin' ? 'студент етуді' : 'әкімші етуді'} растайсыз ба?`)) {
                          changeRole(s.id, nextRole);
                        }
                      } else {
                        Alert.alert(
                          'Рөлді өзгерту',
                          `${s.name} — рөлін өзгерту`,
                          [
                            { text: 'Бас тарту', style: 'cancel' },
                            {
                              text: s.role === 'admin' ? 'Студент ету' : 'Әкімші ету',
                              onPress: () => changeRole(s.id, nextRole)
                            }
                          ]
                        );
                      }
                    }}
                    style={{ padding: 8, backgroundColor: '#F3EDE4', borderRadius: 10 }}
                  >
                    {s.role === 'admin'
                      ? <ShieldCheck size={18} color="#800F1D" />
                      : <GraduationCap size={18} color="#756D70" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'web') {
                            const amountStr = window.prompt(`${s.name} қолданушысына қанша Биткоин бергіңіз келеді?`, '100');
                            if (amountStr) {
                                const amount = parseInt(amountStr, 10);
                                if (!isNaN(amount) && amount > 0) {
                                    grantCoins(s, amount);
                                } else {
                                    window.alert('Қате сан енгізілді!');
                                }
                            }
                        } else {
                            // Basic prompt for mobile (Alert.prompt is iOS only, handling gracefully)
                            Alert.prompt(
                                'Биткоин жіберу',
                                `${s.name} қолданушысына қанша Биткоин бергіңіз келеді?`,
                                [
                                    { text: 'Бас тарту', style: 'cancel' },
                                    { text: 'Жіберу', onPress: (amountStr?: string) => {
                                        const amount = parseInt(amountStr || '0', 10);
                                        if (!isNaN(amount) && amount > 0) {
                                            grantCoins(s, amount);
                                        } else {
                                            Alert.alert('Қате', 'Қате сан енгізілді!');
                                        }
                                    }}
                                ],
                                'plain-text',
                                '100',
                                'number-pad'
                            );
                        }
                    }}
                    style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 10, borderWidth: 1, borderColor: '#fde68a' }}
                  >
                    <Coins size={18} color="#d97706" />
                  </TouchableOpacity>

                  {/* Delete button */}
                  <TouchableOpacity
                    onPress={() => deleteStudent(s)}
                    style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 10 }}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={{ textAlign: 'center', color: '#A29792', fontSize: 12, marginTop: 12 }}>
          {filtered.length} / {students.length} қолданушы
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
