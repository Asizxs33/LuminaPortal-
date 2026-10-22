import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle2, Search, BarChart3, ArrowLeft, Crown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../../../constants/api';

interface Result {
  id: number;
  user_id: number;
  test_id: string;
  score: number;
  total: number;
  passed: boolean;
  completed_at: string;
  student_name?: string;
}

export default function TestGroupResults() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [results, setResults] = useState<Result[]>([]);
  const [testInfo, setTestInfo] = useState<{ title: string; subject: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTestAndResults();
  }, [id]);

  const fetchTestAndResults = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      
      // Fetch Test Info
      const testRes = await fetch(`${API}/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (testRes.ok) {
        const testData = await testRes.json();
        setTestInfo({ title: testData.title, subject: testData.subject });
      }

      // Fetch Results specific to this test
      const res = await fetch(`${API}/api/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const testResults = data.filter((r: any) => String(r.test_id) === String(id));
        setResults(testResults);
      }
    } catch (e) {
      console.error('Test results fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter(r =>
    (r.student_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score / Math.max(r.total, 1)) * 100, 0) / results.length)
    : 0;
  const passCount = results.filter(r => r.passed || ((r.score / Math.max(r.total, 1)) >= 0.5)).length; 
  const passRate = results.length ? Math.round((passCount / results.length) * 100) : 0;

  const getScoreColor = (score: number, total: number) => {
    const pct = (score / Math.max(total, 1)) * 100;
    if (pct >= 80) return { bg: '#dcfce7', text: '#15803d', icon: 'success' };
    if (pct >= 50) return { bg: '#fef9c3', text: '#a16207', icon: 'warning' };
    return { bg: '#fee2e2', text: '#dc2626', icon: 'danger' };
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['#800F1D', '#800F1D', '#059669', '#d97706', '#dc2626', '#800F1D'];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Нәтижелер жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }} edges={['top', 'left', 'right']}>
      
      {/* Header */}
      <View className="bg-white px-4 md:px-8 py-4 border-b border-parchment-200 z-10 hidden md:flex">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-2"
        >
          <ArrowLeft size={20} color="#756D70" />
          <Text className="text-parchment-500 font-bold hover:text-parchment-700">Артқа қайту</Text>
        </TouchableOpacity>
        <Text className="font-display text-2xl font-bold text-parchment-900">{testInfo?.title || 'Тест аналитикасы'}</Text>
        {testInfo?.subject && <Text className="text-academic-600 font-bold mt-1">{testInfo.subject}</Text>}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 60, maxWidth: 1000, marginHorizontal: 'auto', width: '100%' }}>
        
        {/* Mobile Header */}
        <View className="md:hidden mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-4 bg-white self-start py-2 px-3 rounded-xl border border-parchment-200 "
          >
            <ArrowLeft size={18} color="#756D70" />
            <Text className="text-parchment-700 font-bold text-sm">Артқа</Text>
          </TouchableOpacity>
          <Text className="font-display text-2xl font-bold text-parchment-900 leading-tight">{testInfo?.title || 'Тест аналитикасы'}</Text>
          {testInfo?.subject && <Text className="text-academic-600 font-bold mt-1">{testInfo.subject}</Text>}
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 md:gap-5 mb-8">
          <View className="flex-[1] min-w-[45%] md:min-w-[150px] bg-white p-4 md:p-6 rounded-xl md:rounded-xl   border border-parchment-100">
            <View className="w-10 h-10 md:w-12 md:h-12 bg-academic-50 rounded-xl md:rounded-xl items-center justify-center mb-3">
              <Users size={20} color="#800F1D" />
            </View>
            <Text className="font-display text-2xl md:text-3xl font-bold text-parchment-900">{results.length}</Text>
            <Text className="text-xs md:text-sm font-bold text-parchment-500 mt-1 uppercase tracking-wider">Тапсырулар</Text>
          </View>
          
          <View className="flex-[1] min-w-[45%] md:min-w-[150px] bg-white p-4 md:p-6 rounded-xl md:rounded-xl   border border-parchment-100">
            <View className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-xl items-center justify-center mb-3">
              <CheckCircle2 size={20} color="#10b981" />
            </View>
            <Text className="font-display text-2xl md:text-3xl font-bold text-parchment-900">{passRate}%</Text>
            <Text className="text-xs md:text-sm font-bold text-parchment-500 mt-1 uppercase tracking-wider">Өту көрсеткіші</Text>
          </View>

          <View className="flex-[1] min-w-[45%] md:min-w-[150px] bg-white p-4 md:p-6 rounded-xl md:rounded-xl   border border-parchment-100">
            <View className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-xl md:rounded-xl items-center justify-center mb-3">
              <BarChart3 size={20} color="#d97706" />
            </View>
            <Text className="font-display text-2xl md:text-3xl font-bold text-parchment-900">{avgScore}%</Text>
            <Text className="text-xs md:text-sm font-bold text-parchment-500 mt-1 uppercase tracking-wider">Орташа балл</Text>
          </View>
        </View>

        {/* Search */}
        <View className="bg-white flex-row items-center border border-parchment-200 rounded-xl px-4 mb-6  ">
          <Search size={18} color="#A29792" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Студенттің аты-жөні арқылы іздеу..."
            placeholderTextColor="#A29792"
            style={{ flex: 1, paddingVertical: Platform.OS === 'web' ? 16 : 14, paddingHorizontal: 12, fontSize: 15, color: '#10131B' }}
          />
        </View>

        {/* Results List */}
        <View className="bg-white rounded-xl border border-parchment-100   overflow-hidden">
          <View className="px-5 md:px-6 py-4 md:py-5 border-b border-parchment-100 bg-parchment-50/50">
             <Text className="text-lg font-bold text-parchment-900">Барлық нәтижелер ({filtered.length})</Text>
          </View>

          {filtered.length === 0 ? (
            <View className="py-16 items-center">
              <BarChart3 size={48} color="#DFD2C3" />
              <Text className="text-parchment-500 font-bold mt-4">Әзірге ешкім тапсырмаған немесе табылмады</Text>
            </View>
          ) : (
            filtered.map((r, i) => {
              const pct = Math.round((r.score / Math.max(r.total, 1)) * 100);
              const colors = getScoreColor(r.score, r.total);
              
              return (
                <View 
                  key={r.id} 
                  className={`p-4 md:p-5 flex-row items-center justify-between ${i !== 0 ? 'border-t border-parchment-100' : ''}`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-3 md:mr-4" style={{ backgroundColor: avatarColors[r.user_id % avatarColors.length] }}>
                       <Text className="text-white font-bold text-sm">{getInitials(r.student_name || '?')}</Text>
                    </View>
                    
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center gap-2">
                         <Text className="font-bold text-parchment-900 text-[14px] md:text-base leading-tight" numberOfLines={2}>{r.student_name || 'Белгісіз'}</Text>
                         {pct >= 90 && <Crown size={14} color="#eab308" />}
                      </View>
                      <Text className="text-parchment-500 text-[11px] md:text-[13px] font-bold mt-1">
                        {new Date(r.completed_at).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end min-w-[70px]">
                    <Text className="text-parchment-400 font-bold text-[11px] md:text-xs mb-1.5">{r.score} / {r.total} балл</Text>
                    <View style={{ backgroundColor: colors.bg }} className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-black/5">
                      <Text style={{ color: colors.text }} className="font-bold text-[12px] md:text-sm">{pct}%</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
