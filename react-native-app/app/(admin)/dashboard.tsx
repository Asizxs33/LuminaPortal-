import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, CheckCircle, Archive, Clock, Layers, Filter, Search, MoreVertical, BarChart3 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { API } from '../constants/api';

interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  question_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTests(await res.json());
    } catch (e) {
      console.error('Tests fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (test: Test) => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/${test.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: !test.is_published }),
      });
      if (res.ok) {
        setTests(prev => prev.map(t => t.id === test.id ? { ...t, is_published: !t.is_published } : t));
        Alert.alert('✅', test.is_published ? 'Тест жабылды' : 'Тест жарияланды!');
      }
    } catch {
      Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4848e5" />
        <Text style={{ marginTop: 12, color: '#64748b', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  const published = tests.filter(t => t.is_published);
  const unpublished = tests.filter(t => !t.is_published);

  const deleteTest = async (test: Test) => {
    const handleConfirm = async () => {
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/tests/${test.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setTests(prev => prev.filter(t => t.id !== test.id));
        }
      } catch {
        Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`«${test.title}» тестті толықтай өшіргіңіз келе ме?`)) handleConfirm();
    } else {
      Alert.alert(
        'Тестті өшіру',
        `«${test.title}» тестті толықтай өшіргіңіз келе ме?`,
        [
          { text: 'Бас тарту', style: 'cancel' },
          { text: 'Өшіру', style: 'destructive', onPress: handleConfirm }
        ]
      );
    }
  };

  // -------------------------------------------------------------------------------- //
  //  RENDER
  // -------------------------------------------------------------------------------- //
  return (
    <View className="flex-1 bg-slate-50 relative">
      {/* Soft decorative background orbs for Premium Glassmorphism Look */}
      <View className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl opacity-60" pointerEvents="none" />
      <View className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-3xl opacity-60" pointerEvents="none" />

      <ScrollView className="flex-1" contentContainerClassName="pt-6 lg:pt-8 px-4 lg:px-8 pb-8" showsVerticalScrollIndicator={false}>
        
        {/* Header Section (Desktop) */}
        <View className="hidden lg:flex flex-row justify-between items-end mb-8 pl-1">
           <View>
            <Text className="text-sm text-indigo-500 font-bold uppercase tracking-widest mb-1">Мұғалім кабинеті</Text>
            <Text className="text-[36px] font-black text-slate-900 tracking-tight">Басқару тақтасы</Text>
          </View>
        </View>

        <View className="flex-col lg:flex-row gap-8">
          
          {/* LEFT/MAIN COLUMN - Tests Management */}
          <View className="flex-[1] lg:flex-[2.5] flex">
            
            {/* Stat Cards */}
            <View className="flex-row gap-2 md:gap-4 mb-8">
              <View className="flex-[1] bg-white/80 backdrop-blur-xl p-3 md:p-6 rounded-[20px] md:rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 md:gap-5">
                 <View className="bg-indigo-50 w-10 h-10 md:w-14 md:h-14 items-center justify-center rounded-xl md:rounded-2xl"><FileText size={20} color="#4848e5" /></View>
                 <View className="items-center lg:items-start">
                  <Text className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">{tests.length}</Text>
                  <Text className="text-[10px] md:text-[14px] text-slate-500 font-bold mt-0.5 text-center lg:text-left" numberOfLines={1}>Барлық тест</Text>
                 </View>
              </View>

              <View className="flex-[1] bg-white/80 backdrop-blur-xl p-3 md:p-6 rounded-[20px] md:rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 md:gap-5">
                 <View className="bg-emerald-50 w-10 h-10 md:w-14 md:h-14 items-center justify-center rounded-xl md:rounded-2xl"><CheckCircle size={20} color="#10b981" /></View>
                 <View className="items-center lg:items-start">
                  <Text className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">{published.length}</Text>
                  <Text className="text-[10px] md:text-[14px] text-slate-500 font-bold mt-0.5 text-center lg:text-left" numberOfLines={1}>Жарияланған</Text>
                 </View>
              </View>
              
              <View className="flex-[1] bg-white/80 backdrop-blur-xl p-3 md:p-6 rounded-[20px] md:rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 md:gap-5">
                 <View className="bg-slate-100 w-10 h-10 md:w-14 md:h-14 items-center justify-center rounded-xl md:rounded-2xl"><Archive size={20} color="#64748b" /></View>
                 <View className="items-center lg:items-start">
                  <Text className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">{unpublished.length}</Text>
                  <Text className="text-[10px] md:text-[14px] text-slate-500 font-bold mt-0.5 text-center lg:text-left" numberOfLines={1}>Жабық</Text>
                 </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-6 pl-1">
              <Text className="text-xl font-black text-slate-900 tracking-tight">Тесттер тізімі</Text>
            </View>

            {/* TESTS GRID */}
            <View className="flex-row flex-wrap justify-between">
              {tests.length === 0 ? (
                <View className="w-full bg-white/60 backdrop-blur-xl p-16 rounded-[32px] items-center border border-white border-dashed shadow-sm">
                  <View className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <FileText size={40} color="#cbd5e1" />
                  </View>
                  <Text className="text-slate-500 mt-2 font-black text-lg">Тест жоқ</Text>
                  <Text className="text-slate-400 mt-1.5 text-[14px] font-medium text-center">Алдымен оң жақтағы панель арқылы жаңа тест жасаңыз</Text>
                </View>
              ) : (
                tests.map(test => (
                  <View key={test.id} className="w-full md:w-[48%] mb-5 bg-white/80 backdrop-blur-xl rounded-[28px] border border-white shadow-xl shadow-indigo-900/5 overflow-hidden flex-col">
                    <TouchableOpacity
                      onPress={() => router.push(`/test/${test.id}/edit` as any)}
                      className="p-6 flex-1 bg-gradient-to-br from-transparent to-slate-50/50"
                    >
                      <View className="flex-row items-center justify-between mb-4">
                        <View className={`px-3 py-1.5 rounded-[10px] border flex-row items-center gap-1.5 ${test.is_published ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-100 border-slate-200'}`}>
                          <View className={`w-1.5 h-1.5 rounded-full ${test.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <Text className={`text-[11px] font-black uppercase tracking-wider ${test.is_published ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {test.is_published ? 'Жарияланған' : 'Жабық'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-xl font-black text-slate-900 leading-tight mb-3" numberOfLines={2}>{test.title}</Text>
                      <Text className="text-[14px] font-bold text-indigo-500 mb-6">{test.subject}</Text>
                      
                      <View className="flex-row gap-6 mt-auto pt-5 border-t border-slate-200/60">
                        <View className="flex-row items-center gap-2">
                          <Layers size={18} color="#94a3b8" />
                          <Text className="text-slate-600 text-[14px] font-bold">{test.question_count} сұрақ</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Clock size={18} color="#94a3b8" />
                          <Text className="text-slate-600 text-[14px] font-bold">{test.duration_minutes} мин</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View className="flex-row border-t border-slate-100 bg-white/60">
                      
                      <TouchableOpacity
                        onPress={() => router.push(`/test/${test.id}/results` as any)}
                        className="flex-[0.8] py-4 flex-row items-center justify-center gap-2 border-r border-slate-100 active:bg-slate-50 transition-colors"
                      >
                        <BarChart3 size={18} color="#0284c7" />
                        <Text className="text-sky-600 font-black text-[12px] md:text-[14px]">Аналитика</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          const actionMsg = test.is_published ? 'жабылсын ба?' : 'қайта ашылсын ба?';
                          if (Platform.OS === 'web') {
                            if (window.confirm(`«${test.title}» ${actionMsg}`)) togglePublish(test);
                          } else {
                            Alert.alert(
                              test.is_published ? 'Тестті жабу' : 'Тестті ашу',
                              `«${test.title}» ${actionMsg}`,
                              [
                                { text: 'Бас тарту', style: 'cancel' },
                                { text: test.is_published ? 'Жабу' : 'Ашу', style: test.is_published ? 'destructive' : 'default', onPress: () => togglePublish(test) }
                              ]
                            );
                          }
                        }}
                        className="flex-1 py-4 flex-row items-center justify-center gap-2 border-r border-slate-100 active:bg-slate-50 transition-colors"
                      >
                        {test.is_published
                          ? <><EyeOff size={18} color="#64748b" /><Text className="text-slate-600 font-black text-[12px] md:text-[14px]">Жабу</Text></>
                          : <><Eye size={18} color="#4848e5" /><Text className="text-indigo-600 font-black text-[12px] md:text-[14px]">Жариялау</Text></>
                        }
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deleteTest(test)}
                        className="flex-[0.8] py-4 flex-row items-center justify-center gap-2 active:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} color="#ef4444" />
                        <Text className="text-red-500 font-black text-[12px] md:text-[14px]">Өшіру</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
