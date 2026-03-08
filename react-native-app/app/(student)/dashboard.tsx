import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, HelpCircle, ArrowRight, Lock, BookOpen, CheckCircle, Sparkles, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

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
  
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

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

  // Determine card width dynamically for GRID layout
  // 1 col mobile, 2 cols tablet, 2 cols desktop (since desktop has a side panel)
  const getCardWidth = () => {
    if (isTablet) return '48%';
    if (isDesktop) return '48%';
    return '100%';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView contentContainerStyle={{ paddingTop: isDesktop ? 40 : 24, paddingHorizontal: isDesktop ? 40 : 16, paddingBottom: 60 }}>

        {/* Header Section */}
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'stretch', marginBottom: 24, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Студент порталы</Text>
              <Text style={{ fontSize: isDesktop ? 32 : 24, fontWeight: '900', color: '#0f172a', marginTop: 4 }}>Қош келдіңіз, {user?.name?.split(' ')[0]} 👋</Text>
            </View>
            {!isDesktop && (
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{getInitials(user?.name || '')}</Text>
              </View>
            )}
          </View>

          {/* Admin Back Button / Profile Header Right Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {user?.role === 'admin' && (
              <TouchableOpacity 
                 onPress={() => router.push('/(admin)/dashboard')}
                 style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 10 }}
              >
                <ShieldAlert size={18} color="#4848e5" />
                <View>
                  <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 13 }}>Админ режиміне оралу</Text>
                </View>
              </TouchableOpacity>
            )}
            
            {isDesktop && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', padding: 8, paddingRight: 16, borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>{getInitials(user?.name || '')}</Text>
                </View>
                <Text style={{ fontWeight: '700', color: '#334155' }}>{user?.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Global Stats - Horizontal Row */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: isTablet ? 'wrap' : 'nowrap' }}>
          <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
             <View style={{ backgroundColor: '#eef2ff', padding: 12, borderRadius: 12 }}>
               <BookOpen size={24} color="#4848e5" />
             </View>
             <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{tests.length}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Бос тестер</Text>
             </View>
          </View>

          <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
             <View style={{ backgroundColor: '#dcfce7', padding: 12, borderRadius: 12 }}>
               <CheckCircle size={24} color="#15803d" />
             </View>
             <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{completedIds.size}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Аяқталғандар</Text>
             </View>
          </View>
          
          <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
             <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 12 }}>
               <Clock size={24} color="#b45309" />
             </View>
             <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{tests.length - completedIds.size}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Кезектегілер</Text>
             </View>
          </View>
        </View>

        {/* Layout Split for Desktop vs Mobile */}
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24 }}>
          
          {/* LEFT/MAIN COLUMN - Tests Grid */}
          <View style={{ flex: isDesktop ? 3 : 1 }}>
            
            {/* Toolbar: Search and Filter */}
            <View style={{ flexDirection: isTablet || isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, flex: 1 }}>
                <Search size={18} color="#94a3b8" />
                <TextInput
                  value={search} onChangeText={setSearch}
                  placeholder="Пән немесе тест атауын іздеу..."
                  placeholderTextColor="#94a3b8"
                  style={{ flex: 1, marginLeft: 10, paddingVertical: 14, color: '#0f172a', fontSize: 15 }}
                />
              </View>

              <View style={{ flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 4, borderRadius: 12, alignItems: 'center', width: isTablet || isDesktop ? 220 : '100%' }}>
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filtered.length === 0 ? (
                <View style={{ width: '100%', backgroundColor: 'white', padding: 60, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                  <BookOpen size={48} color="#cbd5e1" />
                  <Text style={{ color: '#94a3b8', marginTop: 16, fontWeight: '700', fontSize: 18 }}>Тесттер табылмады</Text>
                  <Text style={{ color: '#94a3b8', marginTop: 4 }}>Іздеу сөздерін өзгертіп көріңіз</Text>
                </View>
              ) : (
                filtered.map(test => {
                  const colors = SUBJECT_COLORS[test.subject] || SUBJECT_COLORS.default;
                  const isDone = completedIds.has(test.id);
                  return (
                    // React Native flex grid item
                    <View key={test.id} style={{ 
                      width: getCardWidth(), 
                      marginBottom: 16,
                      backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden'
                    }}>
                      <View style={{ height: 4, backgroundColor: colors.accent }} />
                      
                      {/* Hover effect can be achieved purely via opacity feedback on React Native Web */}
                      <View style={{ padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.bg }}>
                            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>{test.subject.toUpperCase()}</Text>
                          </View>
                          {isDone && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                              <CheckCircle size={14} color="#15803d" />
                              <Text style={{ color: '#15803d', fontSize: 12, fontWeight: '700' }}>Тапсырылды</Text>
                            </View>
                          )}
                        </View>

                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8, lineHeight: 26 }} numberOfLines={2}>
                          {test.title}
                        </Text>
                        
                        {test.description ? (
                          <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 16, lineHeight: 20 }} numberOfLines={2}>
                            {test.description}
                          </Text>
                        ) : <View style={{ height: 16 }} />}

                        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                            <Clock size={16} color="#64748b" />
                            <Text style={{ color: '#475569', fontSize: 13, fontWeight: '600' }}>{test.duration_minutes} мин</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                            <HelpCircle size={16} color="#64748b" />
                            <Text style={{ color: '#475569', fontSize: 13, fontWeight: '600' }}>{test.question_count}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => isDone
                            ? Alert.alert('Аяқталған', 'Бұл тестті бұрын тапсырдыңыз')
                            : router.push(`/test/${test.id}/start` as any)
                          }
                          style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            paddingVertical: 14, borderRadius: 12,
                            backgroundColor: isDone ? '#f1f5f9' : colors.accent,
                            minHeight: 48
                          }}
                        >
                          {isDone
                            ? <Text style={{ color: '#64748b', fontWeight: '800', fontSize: 14 }}>Нәтижелерді көру</Text>
                            : <>
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Тестті бастау</Text>
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
          <View style={{ flex: isDesktop ? 1 : undefined, minWidth: isDesktop ? 300 : 'auto' }}>
            {/* Practice Banner */}
            <View style={{ backgroundColor: '#2e2e38', borderRadius: 20, padding: 24, alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#4848e5', shadowOpacity: 0.5, shadowRadius: 20 }}>
                <Sparkles size={32} color="white" />
              </View>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' }}>ЖИ Тәжірибе режимі</Text>
              <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
                Емтиханға дейін қосымша сұрақтар генерациялап, дағдыларыңызды шыңдап шығыңыз. Жасанды интеллект сізге бейімделеді.
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Жақында', 'Тәжірибе режимі дайындалып жатыр')}
                style={{ backgroundColor: 'white', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 15 }}>Тәжірибені бастау</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Tips (Desktop Only) */}
            {isDesktop && (
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>Кеңестер</Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><Clock size={16} color="#64748b" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#334155', fontSize: 13, marginBottom: 4 }}>Уақытты қадағалаңыз</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }}>Әр сұраққа орташа есеппен қанша уақыт кететінін ескеріңіз.</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><Lock size={16} color="#64748b" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#334155', fontSize: 13, marginBottom: 4 }}>Интернет тұрақтылығы</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }}>Тест барысында қосылым үзілсе, парақшаны жаңартпаңыз.</Text>
                  </View>
                </View>

              </View>
            )}
          </View>
          
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
