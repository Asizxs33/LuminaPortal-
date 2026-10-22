import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, ArrowUpRight, FileText, Grid2X2, Monitor, Info, BookOpen, CheckCircle2, Clock3, Coins, HelpCircle, Search, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API } from '../constants/api';

const COLORS = { ink: '#101827', muted: '#707B90', border: '#E0E5ED', primary: '#990F2E', canvas: '#F5F7FA' };

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
  const { width } = useWindowDimensions();
  const compact = width < 1100;
  const mobile = width < 640;
  const [subject, setSubject] = useState<string | null>(null);
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [coins, setCoins] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setError('');
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const [testsRes, resultsRes, coinsRes] = await Promise.all([
        fetch(`${API}/api/tests`, { headers }),
        user?.id ? fetch(`${API}/api/results/user/${user.id}`, { headers }) : Promise.resolve(null),
        user?.id ? fetch(`${API}/api/users/coins?userId=${user.id}`, { headers }) : Promise.resolve(null),
      ]);
      if (!testsRes.ok) throw new Error('tests');
      setTests(await testsRes.json());
      if (resultsRes?.ok) {
        const results = await resultsRes.json();
        setCompletedIds(new Set(results.map((result: { test_id: string }) => String(result.test_id))));
      }
      if (coinsRes?.ok) setCoins((await coinsRes.json()).coins);
    } catch {
      setError('Деректерді жүктеу мүмкін болмады. Интернет байланысын тексеріп, қайта көріңіз.');
    }
  }, [user?.id]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filtered = useMemo(() => tests.filter((test) => {
    const query = search.trim().toLowerCase();
    const matches = !query || test.title.toLowerCase().includes(query) || test.subject.toLowerCase().includes(query);
    return matches && (!subject || test.subject === subject) && (activeFilter === 'all' || completedIds.has(String(test.id)));
  }), [activeFilter, completedIds, search, tests, subject]);

  const firstName = user?.name?.trim().split(' ')[0] || 'оқушы';
  const completed = tests.filter(test => completedIds.has(String(test.id))).length;
  const remaining = tests.length - completed;
  const subjects = Array.from(new Set(tests.map(test => test.subject).filter(Boolean)));
  const results = () => router.push('/(student)/results');

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ color: COLORS.muted, fontWeight: '700', marginTop: 12 }}>Оқу бағыты жүктелуде…</Text>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: '100%', maxWidth: 1440, alignSelf: 'center', paddingHorizontal: mobile ? 14 : 36, paddingTop: mobile ? 16 : 28, paddingBottom: 36 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.muted, fontSize: mobile ? 12 : 15, fontWeight: '600', marginBottom: 5 }}>Қайырлы күн, {firstName}</Text>
            <Text accessibilityRole="header" style={{ color: COLORS.ink, fontSize: mobile ? 22 : 36, lineHeight: mobile ? 28 : 44, fontWeight: '700', letterSpacing: -0.8 }}>Бүгінгі оқу бағыты</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: mobile ? 8 : 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFF7E5', borderWidth: 1, borderColor: '#FBE8BB', borderRadius: 14, paddingHorizontal: mobile ? 10 : 17, paddingVertical: mobile ? 9 : 13 }}><Coins size={mobile ? 16 : 23} color="#B2770C" /><Text style={{ color: '#A46709', fontSize: mobile ? 16 : 21, fontWeight: '700' }}>{coins ?? '—'}</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Профильді ашу" onPress={() => router.push('/(student)/profile')} style={{ width: mobile ? 38 : 48, height: mobile ? 38 : 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border }}><UserRound size={mobile ? 20 : 24} color={COLORS.ink} /></TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mobile ? 8 : 16, marginBottom: 22 }}>
          {[{ value: tests.length, label: 'Қолжетімді тест', icon: FileText, color: COLORS.primary, bg: '#FAEAF0' }, { value: completed, label: 'Аяқталған', icon: CheckCircle2, color: '#087C49', bg: '#E3FAEF' }, { value: remaining, label: 'Кезекте', icon: Clock3, color: '#B2770C', bg: '#FFF6E0' }].map(item => {
            const Icon = item.icon;
            return <View key={item.label} style={{ flexGrow: 1, flexBasis: mobile ? 0 : 200, minWidth: 0, flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center', gap: mobile ? 10 : 20, backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: mobile ? 12 : 22 }}><View style={{ width: mobile ? 38 : 60, height: mobile ? 38 : 60, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}><Icon size={mobile ? 24 : 32} color={item.color} strokeWidth={1.8} /></View><View style={{ flex: 1 }}><Text style={{ color: COLORS.ink, fontSize: mobile ? 23 : 28, fontWeight: '700' }}>{item.value}</Text><Text style={{ color: COLORS.muted, fontSize: mobile ? 12 : 16, fontWeight: '600', marginTop: 4 }}>{item.label}</Text></View></View>;
          })}
        </View>

        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: mobile ? 14 : 22, marginBottom: mobile ? 20 : 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ fontSize: mobile ? 16 : 20, fontWeight: '700', color: COLORS.ink }}>Пән бойынша таңдау</Text>
            <TouchableOpacity accessibilityRole="button" onPress={results} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 }}><Text style={{ color: COLORS.primary, fontSize: mobile ? 12 : 15, fontWeight: '600' }}>Нәтижелерді көру</Text><ArrowUpRight color={COLORS.primary} size={19} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[null, ...subjects].map(value => {
              const selected = subject === value;
              const Icon = value ? Monitor : Grid2X2;
              return <TouchableOpacity key={value || 'all'} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSubject(value)} style={{ flexDirection: 'row', alignItems: 'center', gap: mobile ? 8 : 16, paddingHorizontal: mobile ? 12 : 22, paddingVertical: mobile ? 11 : 19, borderRadius: 10, borderWidth: 1, borderColor: selected ? COLORS.primary : COLORS.border, backgroundColor: selected ? COLORS.primary : 'white', minWidth: mobile ? 0 : 245 }}><Icon size={mobile ? 21 : 29} strokeWidth={1.8} color={selected ? 'white' : COLORS.primary} /><Text style={{ fontSize: mobile ? 13 : 17, fontWeight: selected ? '600' : '500', color: selected ? 'white' : COLORS.ink }}>{value || 'Барлық пәндер'}</Text>{value && <View style={{ backgroundColor: selected ? '#B63A54' : '#F0F2F6', paddingHorizontal: mobile ? 6 : 10, paddingVertical: 5, borderRadius: 12 }}><Text style={{ color: selected ? 'white' : COLORS.muted, fontSize: 13, fontWeight: '600' }}>{tests.filter(test => test.subject === value).length} тест</Text></View>}</TouchableOpacity>;
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          <Text accessibilityRole="header" style={{ color: COLORS.ink, fontSize: mobile ? 23 : 28, fontWeight: '700' }}>Барлық тесттер</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#EBEDF2', borderRadius: 12 }}>{[{ key: 'all', label: 'Барлығы' }, { key: 'completed', label: 'Аяқталған' }].map(filter => <TouchableOpacity key={filter.key} accessibilityRole="button" accessibilityState={{ selected: activeFilter === filter.key }} onPress={() => setActiveFilter(filter.key as 'all' | 'completed')} style={{ borderRadius: 11, paddingHorizontal: mobile ? 13 : 22, paddingVertical: mobile ? 10 : 14, backgroundColor: activeFilter === filter.key ? COLORS.primary : 'transparent' }}><Text style={{ color: activeFilter === filter.key ? 'white' : COLORS.muted, fontWeight: '600', fontSize: mobile ? 13 : 15 }}>{filter.label}</Text></TouchableOpacity>)}</View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 18, marginBottom: 18 }}><Search size={24} color={COLORS.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Тест немесе пән атауын іздеу" placeholderTextColor={COLORS.muted} accessibilityLabel="Тесттерді іздеу" style={{ flex: 1, minWidth: 0, color: COLORS.ink, fontSize: mobile ? 13 : 16, paddingVertical: mobile ? 12 : 17 }} /></View>
        {!!error && <View style={{ backgroundColor: '#FFF0F2', borderRadius: 12, padding: 18, marginBottom: 18 }}><Text style={{ color: COLORS.primary, lineHeight: 22 }}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={onRefresh} style={{ paddingVertical: 12 }}><Text style={{ color: COLORS.primary, fontWeight: '700' }}>Қайта жүктеу</Text></TouchableOpacity></View>}
        <View style={{ gap: 16 }}>
          {filtered.map(test => {
            const done = completedIds.has(String(test.id));
            return <View key={test.id} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: mobile ? 15 : 24, flexDirection: compact ? 'column' : 'row', gap: mobile ? 14 : 24 }}>
              <View style={{ flex: 1, flexDirection: 'row', gap: 22 }}>
                {!mobile && <View style={{ width: 82, height: 82, backgroundColor: '#FAEAF0', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><FileText size={40} color={COLORS.primary} strokeWidth={1.7} /></View>}
                <View style={{ flex: 1 }}>
                  <View style={{ alignSelf: 'flex-start', backgroundColor: '#FAEAF0', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 5 }}><Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>{test.subject}</Text></View>
                  <Text style={{ fontSize: mobile ? 20 : 24, lineHeight: mobile ? 26 : 31, color: COLORS.ink, fontWeight: '700', marginTop: 8 }}>{test.title}</Text>
                  {!!test.description && !test.description.startsWith('Imported from ') && <Text numberOfLines={2} style={{ fontSize: 15, lineHeight: 23, color: COLORS.muted, marginTop: 4 }}>{test.description}</Text>}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 22, marginTop: 14 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Clock3 size={21} color={COLORS.muted} /><Text style={{ color: COLORS.muted, fontWeight: '600', fontSize: 15 }}>{test.duration_minutes} мин</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><HelpCircle size={21} color={COLORS.muted} /><Text style={{ color: COLORS.muted, fontWeight: '600', fontSize: 15 }}>{test.question_count} сұрақ</Text></View></View>
                </View>
              </View>
              <View style={{ justifyContent: 'space-between', alignItems: compact ? 'stretch' : 'flex-end', gap: mobile ? 14 : 24 }}>
                <View style={{ alignSelf: compact ? 'flex-start' : 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E3FAEF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}><CheckCircle2 size={17} color="#087C49" /><Text style={{ color: '#087C49', fontSize: 13, fontWeight: '600' }}>{done ? 'Аяқталды' : 'Қолжетімді'}</Text></View>
                <TouchableOpacity accessibilityRole="button" onPress={() => done ? results() : router.push(`/test/${test.id}/start` as any)} style={{ minHeight: mobile ? 44 : 52, minWidth: compact ? 0 : 238, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 25, borderRadius: 12, backgroundColor: COLORS.primary }}><Text style={{ color: 'white', fontSize: mobile ? 15 : 17, fontWeight: '600' }}>{done ? 'Нәтижені көру' : 'Тестті бастау'}</Text><ArrowRight size={23} color="white" /></TouchableOpacity>
              </View>
            </View>;
          })}
          {!filtered.length && !error && <View style={{ alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 34 }}><BookOpen size={34} color={COLORS.muted} /><Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 18, marginTop: 12 }}>Тесттер табылмады</Text><Text style={{ color: COLORS.muted, marginTop: 6, textAlign: 'center' }}>Іздеу сөзін немесе сүзгіні өзгертіп көріңіз.</Text><TouchableOpacity accessibilityRole="button" onPress={() => { setSearch(''); setSubject(null); setActiveFilter('all'); }} style={{ padding: 14 }}><Text style={{ color: COLORS.primary, fontWeight: '600' }}>Сүзгілерді тазалау</Text></TouchableOpacity></View>}
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 28, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, minWidth: 220 }}><Info size={25} color={COLORS.muted} /><Text style={{ flex: 1, color: COLORS.muted, fontSize: 14, lineHeight: 22 }}>Тестті бастамас бұрын уақыт пен сұрақтар санын тексеріңіз.</Text></View>
          <TouchableOpacity accessibilityRole="button" onPress={results} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}><Text style={{ color: COLORS.primary, fontWeight: '500', fontSize: 15 }}>Барлық нәтижелер</Text><ArrowUpRight size={19} color={COLORS.primary} /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
