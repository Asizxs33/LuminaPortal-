import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, HelpCircle, ArrowRight, Lock, BookOpen, CheckCircle, Sparkles, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'Математика': { bg: '#ede9fe', text: '#7c3aed', accent: '#4848e5' },
  'Физика': { bg: '#dcfce7', text: '#15803d', accent: '#059669' },
  'Химия': { bg: '#fef9c3', text: '#a16207', accent: '#d97706' },
  'Биология': { bg: '#dcfce7', text: '#15803d', accent: '#059669' },
  'Тарих': { bg: '#fce7f3', text: '#9d174d', accent: '#ec4899' },
  'default': { bg: '#dbeafe', text: '#1d4ed8', accent: '#2563eb' },
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
    <SafeAreaView className="flex-grow bg-[#f6f6f8]">
      <ScrollView contentContainerClassName="pt-6 lg:pt-10 px-4 lg:px-10 pb-16" showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View className="flex-col lg:flex-row justify-between items-stretch lg:items-end mb-6 gap-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Студент порталы</Text>
              <Text className="text-2xl lg:text-3xl font-black text-slate-900 mt-1">Қош келдіңіз, {user?.name?.split(' ')[0]} 👋</Text>
            </View>
            <View className="flex lg:hidden w-11 h-11 rounded-full bg-indigo-600 items-center justify-center">
              <Text className="text-white font-black text-base">{getInitials(user?.name || '')}</Text>
            </View>
          </View>

          {/* Admin Back Button / Profile Header Right Side */}
          <View className="flex-row items-center gap-4">
            {user?.role === 'admin' && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/dashboard')}
                className="flex-row items-center bg-indigo-100 px-4 py-3 rounded-xl gap-2.5"
              >
                <ShieldAlert size={18} color="#4848e5" />
                <View>
                  <Text className="text-indigo-600 font-extrabold text-[13px]">Админ режиміне оралу</Text>
                </View>
              </TouchableOpacity>
            )}

            <View className="hidden lg:flex flex-row items-center gap-3 bg-white p-2 pr-4 rounded-[30px] border border-slate-200">
              <View className="w-9 h-9 rounded-full bg-indigo-600 items-center justify-center">
                <Text className="text-white font-black text-sm">{getInitials(user?.name || '')}</Text>
              </View>
              <Text className="font-bold text-slate-700">{user?.name}</Text>
            </View>
          </View>
        </View>

        {/* Global Stats - Horizontal Row */}
        <View className="flex-col md:flex-row flex-wrap lg:flex-nowrap gap-4 mb-6">
          <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
            <View className="bg-indigo-50 p-3 rounded-xl">
              <BookOpen size={24} color="#4848e5" />
            </View>
            <View>
              <Text className="text-2xl font-black text-slate-900">{tests.length}</Text>
              <Text className="text-[13px] text-slate-500 font-semibold">Бос тестер</Text>
            </View>
          </View>

          <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
            <View className="bg-green-50 p-3 rounded-xl">
              <CheckCircle size={24} color="#15803d" />
            </View>
            <View>
              <Text className="text-2xl font-black text-slate-900">{completedIds.size}</Text>
              <Text className="text-[13px] text-slate-500 font-semibold">Аяқталғандар</Text>
            </View>
          </View>

          <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
            <View className="bg-amber-50 p-3 rounded-xl">
              <Clock size={24} color="#b45309" />
            </View>
            <View>
              <Text className="text-2xl font-black text-slate-900">{tests.length - completedIds.size}</Text>
              <Text className="text-[13px] text-slate-500 font-semibold">Кезектегілер</Text>
            </View>
          </View>
        </View>

        {/* Layout Split for Desktop vs Mobile */}
        <View className="flex-col lg:flex-row gap-6">

          {/* LEFT/MAIN COLUMN - Tests Grid */}
          <View className="w-full lg:flex-[3]">

            {/* Toolbar: Search and Filter */}
            <View className="flex-col md:flex-row justify-between gap-4 mb-5">

              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 flex-1">
                <Search size={18} color="#94a3b8" />
                <TextInput
                  value={search} onChangeText={setSearch}
                  placeholder="Пән немесе тест атауын іздеу..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 py-3.5 text-slate-900 text-[15px] outline-none"
                />
              </View>

              <View className="flex-row bg-slate-200 p-1 rounded-xl items-center w-full md:w-[220px]">
                {[{ key: 'all', label: 'Барлығы' }, { key: 'completed', label: 'Аяқталған' }].map(f => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setActiveFilter(f.key as any)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                      backgroundColor: activeFilter === f.key ? 'white' : 'transparent',
                      shadowColor: activeFilter === f.key ? '#000' : 'transparent',
                      shadowOpacity: 0.05, shadowRadius: 2, elevation: activeFilter === f.key ? 1 : 0
                    }}
                  >
                    <Text style={{ fontWeight: '700', fontSize: 13, color: activeFilter === f.key ? '#0f172a' : '#64748b' }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TESTS GRID */}
            <View className="flex-row flex-wrap justify-between">
              {filtered.length === 0 ? (
                <View className="w-full bg-white p-16 rounded-2xl items-center border border-slate-200">
                  <BookOpen size={48} color="#cbd5e1" />
                  <Text className="text-slate-400 mt-4 font-bold text-lg">Тесттер табылмады</Text>
                  <Text className="text-slate-400 mt-1">Іздеу сөздерін өзгертіп көріңіз</Text>
                </View>
              ) : (
                filtered.map(test => {
                  const colors = SUBJECT_COLORS[test.subject] || SUBJECT_COLORS.default;
                  const isDone = completedIds.has(test.id);
                  return (
                    <View key={test.id} className="w-full md:w-[48%] mb-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <View style={{ height: 4, backgroundColor: colors.accent }} />

                      <View className="p-5">
                        <View className="flex-row justify-between items-start mb-4">
                          <View style={{ backgroundColor: colors.bg }} className="px-3 py-1.5 rounded-lg">
                            <Text style={{ color: colors.text }} className="font-extrabold text-xs tracking-wide">{test.subject.toUpperCase()}</Text>
                          </View>
                          {isDone && (
                            <View className="flex-row items-center gap-1.5 bg-green-100 px-2.5 py-1.5 rounded-lg">
                              <CheckCircle size={14} color="#15803d" />
                              <Text className="text-green-700 text-xs font-bold">Тапсырылды</Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-lg font-extrabold text-slate-900 mb-2 leading-relaxed" numberOfLines={2}>
                          {test.title}
                        </Text>

                        {test.description ? (
                          <Text className="text-slate-500 text-sm mb-4 leading-relaxed" numberOfLines={2}>
                            {test.description}
                          </Text>
                        ) : <View className="h-4" />}

                        <View className="flex-row gap-4 mb-5">
                          <View className="flex-row items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md">
                            <Clock size={16} color="#64748b" />
                            <Text className="text-slate-600 text-[13px] font-semibold">{test.duration_minutes} мин</Text>
                          </View>
                          <View className="flex-row items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md">
                            <HelpCircle size={16} color="#64748b" />
                            <Text className="text-slate-600 text-[13px] font-semibold">{test.question_count}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => isDone
                            ? Alert.alert('Аяқталған', 'Бұл тестті бұрын тапсырдыңыз')
                            : router.push(`/test/${test.id}/start` as any)
                          }
                          style={{ backgroundColor: isDone ? '#f1f5f9' : colors.accent }}
                          className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl min-h-[48px]"
                        >
                          {isDone
                            ? <Text className="text-slate-500 font-extrabold text-sm">Нәтижелерді көру</Text>
                            : <>
                              <Text className="text-white font-extrabold text-[15px]">Тестті бастау</Text>
                              <ArrowRight size={18} color="white" />
                            </>
                          }
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* RIGHT/SIDE COLUMN - Practice Banner (Desktop) */}
          <View className="flex-none lg:flex-1 lg:min-w-[300px]">
            {/* Practice Banner */}
            <View className="bg-[#2e2e38] rounded-[20px] p-6 items-center">
              <View className="w-16 h-16 rounded-full bg-indigo-600 items-center justify-center mb-4 shadow-xl shadow-indigo-600/50">
                <Sparkles size={32} color="white" />
              </View>
              <Text className="text-white text-xl font-black mb-2 text-center">ЖИ Тәжірибе режимі</Text>
              <Text className="text-slate-400 text-center text-sm leading-relaxed mb-6">
                Емтиханға дейін қосымша сұрақтар генерациялап, дағдыларыңызды шыңдап шығыңыз. Жасанды интеллект сізге бейімделеді.
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Жақында', 'Тәжірибе режимі дайындалып жатыр')}
                className="bg-white w-full py-3.5 rounded-xl items-center"
              >
                <Text className="text-slate-900 font-black text-[15px]">Тәжірибені бастау</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Tips (Desktop Only) */}
            <View className="hidden lg:flex bg-white rounded-3xl p-6 mt-4 border border-slate-200">
              <Text className="text-base font-extrabold text-slate-900 mb-4">Кеңестер</Text>

              <View className="flex-row gap-3 mb-4">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Clock size={16} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-700 text-[13px] mb-1">Уақытты қадағалаңыз</Text>
                  <Text className="text-slate-500 text-xs leading-5">Әр сұраққа орташа есеппен қанша уақыт кететінін ескеріңіз.</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Lock size={16} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-700 text-[13px] mb-1">Интернет тұрақтылығы</Text>
                  <Text className="text-slate-500 text-xs leading-5">Тест барысында қосылым үзілсе, парақшаны жаңартпаңыз.</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
