import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, HelpCircle, ArrowRight, Lock, BookOpen, CheckCircle, Sparkles, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://172.20.10.2:3001';

const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'Математика': { bg: '#ede9fe', text: '#7c3aed', accent: '#4848e5' },
  'Физика':     { bg: '#dcfce7', text: '#15803d', accent: '#059669' },
  'Химия':      { bg: '#fef9c3', text: '#a16207', accent: '#d97706' },
  'Биология':   { bg: '#dcfce7', text: '#15803d', accent: '#059669' },
  'Тарих':      { bg: '#fce7f3', text: '#9d174d', accent: '#ec4899' },
  'default':    { bg: '#dbeafe', text: '#1d4ed8', accent: '#2563eb' },
};

interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  question_count: number;
  is_published: boolean;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed'>('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const [testsRes, resultsRes] = await Promise.all([
        fetch(`${API}/api/tests`, { headers: { Authorization: `Bearer ${token}` } }),
        user?.id ? fetch(`${API}/api/results/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
      ]);
      if (testsRes.ok) setTests(await testsRes.json());
      if (resultsRes?.ok) {
        const results = await resultsRes.json();
        setCompletedIds(new Set(results.map((r: any) => r.test_id)));
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tests.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'completed') return matchSearch && completedIds.has(t.id);
    return matchSearch;
  });

  const getInitials = (name: string) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

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
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* Greeting */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Қош келдіңіз,</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a' }}>{user?.name?.split(' ')[0] || 'Студент'} 👋</Text>
          </View>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{getInitials(user?.name || '')}</Text>
          </View>
        </View>

        {/* Admin Back Button */}
        {user?.role === 'admin' && (
          <TouchableOpacity 
             onPress={() => router.push('/(admin)/dashboard')}
             style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', padding: 12, borderRadius: 12, marginBottom: 20, gap: 10 }}
          >
            <ShieldAlert size={18} color="#4848e5" />
            <View>
              <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 13 }}>Админ режиміне оралу</Text>
              <Text style={{ color: '#6366f1', fontSize: 11, marginTop: 2 }}>Редактор мен баптауларға қайту</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#4848e5' }}>{tests.length}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' }}>Қолжетімді тест</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#059669' }}>{completedIds.size}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' }}>Аяқталған</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#d97706' }}>{tests.length - completedIds.size}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' }}>Күтілуде</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, marginBottom: 14 }}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Тест іздеу..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, marginLeft: 8, paddingVertical: 11, color: '#0f172a', fontSize: 14 }}
          />
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 10, marginBottom: 18 }}>
          {[{ key: 'all', label: 'Барлығы' }, { key: 'completed', label: 'Аяқталған' }].map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key as any)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
                backgroundColor: activeFilter === f.key ? 'white' : 'transparent'
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: 13, color: activeFilter === f.key ? '#0f172a' : '#64748b' }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Cards */}
        {filtered.length === 0 ? (
          <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
            <BookOpen size={40} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '700' }}>Тест табылмады</Text>
          </View>
        ) : (
          filtered.map(test => {
            const colors = SUBJECT_COLORS[test.subject] || SUBJECT_COLORS.default;
            const isDone = completedIds.has(test.id);
            return (
              <View key={test.id} style={{
                backgroundColor: 'white', borderRadius: 18, marginBottom: 14,
                borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden'
              }}>
                {/* Accent strip */}
                <View style={{ height: 4, backgroundColor: colors.accent }} />

                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                      backgroundColor: colors.bg
                    }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>{test.subject}</Text>
                    </View>
                    {isDone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        <CheckCircle size={12} color="#15803d" />
                        <Text style={{ color: '#15803d', fontSize: 11, fontWeight: '700' }}>Аяқталды</Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 10, lineHeight: 24 }} numberOfLines={2}>
                    {test.title}
                  </Text>

                  {test.description ? (
                    <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 12, lineHeight: 18 }} numberOfLines={2}>
                      {test.description}
                    </Text>
                  ) : null}

                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Clock size={14} color="#94a3b8" />
                      <Text style={{ color: '#64748b', fontSize: 13 }}>{test.duration_minutes} мин</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <HelpCircle size={14} color="#94a3b8" />
                      <Text style={{ color: '#64748b', fontSize: 13 }}>{test.question_count} сұрақ</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 13 }}>🎯 {test.passing_score}%</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => isDone
                      ? Alert.alert('Аяқталған', 'Бұл тестті бұрын тапсырдыңыз')
                      : router.push(`/test/${test.id}/start` as any)
                    }
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      paddingVertical: 13, borderRadius: 12,
                      backgroundColor: isDone ? '#f1f5f9' : colors.accent
                    }}
                  >
                    {isDone
                      ? <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 14 }}>Нәтижені қарау →</Text>
                      : <>
                          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Тестті бастау</Text>
                          <ArrowRight size={16} color="white" />
                        </>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Practice Banner */}
        <View style={{ backgroundColor: '#4848e5', borderRadius: 18, padding: 22, alignItems: 'center', marginTop: 8 }}>
          <Sparkles size={36} color="white" />
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginTop: 10, marginBottom: 6 }}>Тәжірибе режимі</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
            Емтихан алдында дағдыларыңызды шыңдап шығыңыз.
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Жақында', 'Тәжірибе режимі дайындалуда')}
            style={{ backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12 }}
          >
            <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 14 }}>Тәжірибені бастау</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
