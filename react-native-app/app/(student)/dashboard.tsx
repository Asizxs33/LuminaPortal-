import { displayFont } from '../../theme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Coins, HelpCircle, Search, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API } from '../constants/api';
import LearningRoute from '../../components/LearningRoute';

const COLORS = { ink: '#10131B', muted: '#756D70', border: '#DFD2C3', primary: '#800F1D', canvas: '#FCFAF6' };

const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'Математика': { bg: '#F4E6E6', text: '#800F1D', accent: '#800F1D' },
  'Физика': { bg: '#DDF6EA', text: '#16845B', accent: '#16845B' },
  'Химия': { bg: '#FFF2D9', text: '#A65B09', accent: '#E29A35' },
  'Биология': { bg: '#EAF7D0', text: '#4E7411', accent: '#85B52C' },
  'Тарих': { bg: '#FFE8EE', text: '#A92E4C', accent: '#D65A78' },
  default: { bg: '#F5EDDF', text: '#96602E', accent: '#B67B43' },
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
        setCompletedIds(new Set(results.map((result: { test_id: string }) => result.test_id)));
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
    return matches && (activeFilter === 'all' || completedIds.has(test.id));
  }), [activeFilter, completedIds, search, tests]);

  const firstName = user?.name?.trim().split(' ')[0] || 'оқушы';
  const remaining = Math.max(tests.length - completedIds.size, 0);

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ color: COLORS.muted, fontWeight: '700', marginTop: 12 }}>Оқу бағыты жүктелуде…</Text>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 26, paddingBottom: 72 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.muted, fontSize: 14, fontWeight: '700' }}>Қайырлы күн, {firstName}</Text>
            <Text style={{ color: COLORS.ink, fontFamily: displayFont, fontSize: 30, lineHeight: 37, fontWeight: '700', letterSpacing: -0.8, marginTop: 3 }}>Бүгінгі оқу бағыты</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFF2D9', borderWidth: 1, borderColor: '#F4D69C', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}><Coins size={17} color="#A65B09" /><Text style={{ color: '#8B4C08', fontWeight: '700' }}>{coins ?? '—'}</Text></View>
            <TouchableOpacity accessibilityLabel="Профильді ашу" onPress={() => router.push('/(student)/profile')} style={{ width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border }}><UserRound size={20} color={COLORS.ink} /></TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 22, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
            <View style={{ flex: 1, minWidth: 220 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '700' }}>Сіздің ілгерілеуіңіз</Text><Text style={{ color: COLORS.muted, lineHeight: 21, marginTop: 5 }}>Тестті таңдаңыз, орындаңыз және нәтижеден келесі қадамды көріңіз.</Text></View>
            <TouchableOpacity onPress={() => router.push('/(student)/results')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}><Text style={{ color: COLORS.primary, fontWeight: '800' }}>Барлық нәтижелер</Text><ArrowRight size={16} color={COLORS.primary} /></TouchableOpacity>
          </View>
          <LearningRoute steps={[
            { label: 'Тестті таңдау', state: completedIds.size ? 'done' : 'current' },
            { label: 'Сұрақтарға жауап', state: completedIds.size ? 'done' : 'next' },
            { label: 'Нәтиже', detail: `${completedIds.size} аяқталды`, state: completedIds.size ? 'current' : 'next' },
            { label: 'Келесі мақсат', state: 'next' },
          ]} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
          {[{ value: tests.length, label: 'Қолжетімді тест', icon: BookOpen, color: COLORS.primary, bg: '#F4E6E6' }, { value: completedIds.size, label: 'Аяқталған', icon: CheckCircle2, color: '#16845B', bg: '#DDF6EA' }, { value: remaining, label: 'Кезекте', icon: Clock3, color: '#A65B09', bg: '#FFF2D9' }].map((item) => {
            const Icon = item.icon;
            return <View key={item.label} style={{ flexGrow: 1, flexBasis: 210, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 17 }}><View style={{ width: 43, height: 43, borderRadius: 13, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}><Icon size={21} color={item.color} /></View><View><Text style={{ color: COLORS.ink, fontFamily: displayFont, fontSize: 22, fontWeight: '700' }}>{item.value}</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '700' }}>{item.label}</Text></View></View>;
          })}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
          <Text style={{ color: COLORS.ink, fontFamily: displayFont, fontSize: 22, fontWeight: '700' }}>Барлық тесттер</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#F3EDE4', borderRadius: 12, padding: 3 }}>{[{ key: 'all', label: 'Барлығы' }, { key: 'completed', label: 'Аяқталған' }].map((filter) => <TouchableOpacity key={filter.key} onPress={() => setActiveFilter(filter.key as 'all' | 'completed')} style={{ borderRadius: 9, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: activeFilter === filter.key ? 'white' : 'transparent' }}><Text style={{ color: activeFilter === filter.key ? COLORS.ink : COLORS.muted, fontWeight: '800', fontSize: 13 }}>{filter.label}</Text></TouchableOpacity>)}</View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 }}><Search size={19} color="#A29792" /><TextInput value={search} onChangeText={setSearch} placeholder="Тест немесе пән атауын іздеу" placeholderTextColor="#A29792" accessibilityLabel="Тесттерді іздеу" style={{ flex: 1, color: COLORS.ink, fontSize: 15, paddingVertical: 14, outlineStyle: 'none' } as any} /></View>

        {!!error && <View style={{ alignItems: 'flex-start', backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#F3B7C1', borderRadius: 16, padding: 18, marginBottom: 16 }}><Text style={{ color: '#9D2D43', lineHeight: 21, fontWeight: '700' }}>{error}</Text><TouchableOpacity onPress={onRefresh} style={{ marginTop: 12, backgroundColor: '#C73D4D', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 }}><Text style={{ color: 'white', fontWeight: '800' }}>Қайта жүктеу</Text></TouchableOpacity></View>}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {filtered.map((test) => {
            const palette = SUBJECT_COLORS[test.subject] || SUBJECT_COLORS.default;
            const done = completedIds.has(test.id);
            return <View key={test.id} style={{ flexGrow: 1, flexBasis: 320, maxWidth: 580, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}><View style={{ height: 5, backgroundColor: palette.accent }} /><View style={{ padding: 19 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><View style={{ backgroundColor: palette.bg, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 }}><Text style={{ color: palette.text, fontSize: 12, fontWeight: '700' }}>{test.subject}</Text></View>{done && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><CheckCircle2 size={15} color="#16845B" /><Text style={{ color: '#16845B', fontSize: 12, fontWeight: '800' }}>Аяқталды</Text></View>}</View><Text style={{ color: COLORS.ink, fontSize: 18, lineHeight: 24, fontWeight: '700', marginTop: 15 }}>{test.title}</Text>{!!test.description && <Text numberOfLines={2} style={{ color: COLORS.muted, lineHeight: 20, marginTop: 7 }}>{test.description}</Text>}<View style={{ flexDirection: 'row', gap: 14, marginTop: 16, marginBottom: 17 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Clock3 size={16} color={COLORS.muted} /><Text style={{ color: COLORS.muted, fontWeight: '700', fontSize: 13 }}>{test.duration_minutes} мин</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><HelpCircle size={16} color={COLORS.muted} /><Text style={{ color: COLORS.muted, fontWeight: '700', fontSize: 13 }}>{test.question_count} сұрақ</Text></View></View><TouchableOpacity onPress={() => done ? router.push('/(student)/results') : router.push(`/test/${test.id}/start` as any)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: done ? '#F3EDE4' : palette.accent }}><Text style={{ color: done ? COLORS.ink : 'white', fontWeight: '700' }}>{done ? 'Нәтижені көру' : 'Тестті бастау'}</Text><ArrowRight size={17} color={done ? COLORS.ink : 'white'} /></TouchableOpacity></View></View>;
          })}
          {!filtered.length && !error && <View style={{ width: '100%', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 34 }}><BookOpen size={34} color="#AAB4C5" /><Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 17, marginTop: 12 }}>Тесттер табылмады</Text><Text style={{ color: COLORS.muted, marginTop: 5 }}>Іздеу сөзін немесе сүзгіні өзгертіп көріңіз.</Text></View>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
