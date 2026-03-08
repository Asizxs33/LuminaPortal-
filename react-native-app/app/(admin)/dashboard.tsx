import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FileText, CheckCircle, Archive, Sparkles, Trash2, X, Circle, CheckSquare, AlignLeft, Eye, EyeOff, User, LogOut, ArrowRight, ShieldCheck, Settings, Users, Layers, Clock } from 'lucide-react-native';
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
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'tests' | 'create' | 'ai' | 'profile'>('tests');

  // New test form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newPassing, setNewPassing] = useState('70');
  const [creating, setCreating] = useState(false);

  // AI generator
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

 
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

  const createTest = async () => {
    if (!newTitle.trim() || !newSubject.trim()) {
      Alert.alert('Қате', 'Атауы мен пәнін толтырыңыз');
      return;
    }
    setCreating(true);
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const id = newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const res = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id, title: newTitle, subject: newSubject, description: newDesc,
          duration_minutes: parseInt(newDuration) || 30,
          passing_score: parseInt(newPassing) || 70,
        }),
      });
      if (res.ok) {
        setNewTitle(''); setNewSubject(''); setNewDesc(''); setNewDuration('30'); setNewPassing('70');
        setActiveTab('tests'); // Switch back on mobile
        await fetchTests();
        Alert.alert('✅', 'Тест жасалды!');
      } else {
        Alert.alert('Қате', 'Тест жасалмады');
      }
    } catch {
      Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
    } finally {
      setCreating(false);
    }
  };

  const deleteTest = async (testInfo: Test) => {
    Alert.alert(
      'Тестті өшіру',
      `Сіз шынымен «${testInfo.title}» тестін өшіргіңіз келе ме? Бұл әрекетті қайтара алмайсыз.`,
      [
        { text: 'Бас тарту', style: 'cancel' },
        { 
          text: 'Өшіру', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('lumina_token');
              const res = await fetch(`${API}/api/tests/${testInfo.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                setTests(prev => prev.filter(t => t.id !== testInfo.id));
                Alert.alert('✅', 'Тест сәтті өшірілді');
              } else {
                Alert.alert('Қате', 'Серверден қате шықты');
              }
            } catch (e) {
              Alert.alert('Қате', 'Серверге қосылу мүмкін емес');
            }
          }
        }
      ]
    );
  };

  const handleAiGenerate = () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiTopic('');
      Alert.alert('ЖИ', 'Бұл мүмкіндік кейінірек қосылады. Тест редакторын пайдаланыңыз.');
    }, 1000);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Шығу",
      "Аккаунттан шыққыңыз келе ме?",
      [
        { text: "Бас тарту", style: "cancel" },
        { 
          text: "Шығу", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
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

  const getCardWidth = () => {
    if (isDesktop) return '48%';
    if (isTablet) return '48%';
    return '100%';
  };

  // -------------------------------------------------------------------------------- //
  //  REUSABLE COMPONENTS
  // -------------------------------------------------------------------------------- //

  const CreateTestForm = () => (
    <View className="bg-white/80 backdrop-blur-xl border border-white p-7 rounded-3xl shadow-2xl shadow-indigo-900/5 gap-5">
      <View className="flex-row items-center gap-3 mb-2">
        <View className="bg-indigo-50 w-12 h-12 rounded-xl items-center justify-center">
          <Plus size={24} color="#4848e5" />
        </View>
        <Text className="text-2xl font-black text-slate-900 tracking-tight">Қолмен жасау</Text>
      </View>
      <View>
        <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Тест атауы *</Text>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Мысалы: Жоғары математика"
          placeholderTextColor="#94a3b8"
          className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
        />
      </View>
      <View>
        <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Пән *</Text>
        <TextInput
          value={newSubject}
          onChangeText={setNewSubject}
          placeholder="Мысалы: Математика"
          placeholderTextColor="#94a3b8"
          className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
        />
      </View>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Уақыт (мин)</Text>
          <TextInput
            value={newDuration}
            onChangeText={setNewDuration}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#94a3b8"
            className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
          />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Өту баллы (%)</Text>
          <TextInput
            value={newPassing}
            onChangeText={setNewPassing}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor="#94a3b8"
            className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={createTest}
        disabled={creating}
        className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-3 ${creating ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/20`}
      >
        <Text className="text-white font-black text-lg">
          {creating ? 'Жасалуда...' : 'Тест жасау'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const AiGeneratorForm = () => (
    <View className="bg-white/80 backdrop-blur-xl border border-white p-7 rounded-3xl shadow-2xl shadow-indigo-900/5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="bg-purple-50 w-12 h-12 rounded-xl items-center justify-center">
          <Sparkles size={24} color="#8b5cf6" />
        </View>
        <Text className="text-2xl font-black text-slate-900 tracking-tight">ЖИ Генераторы</Text>
      </View>
      <Text className="text-slate-500 text-[14px] mb-6 leading-relaxed">
        Жасанды интеллект сізге бірнеше секундта сұрақтар дайындап береді.
      </Text>
      <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Тақырып</Text>
      <TextInput
        value={aiTopic}
        onChangeText={setAiTopic}
        placeholder="Мысалы: Кванттық физика..."
        placeholderTextColor="#94a3b8"
        className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-purple-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all mb-5"
      />
      <TouchableOpacity
        onPress={handleAiGenerate}
        disabled={aiLoading || !aiTopic.trim()}
        className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 ${!aiTopic.trim() ? 'bg-slate-200' : 'bg-purple-600'} shadow-lg ${!aiTopic.trim() ? 'shadow-transparent' : 'shadow-purple-600/20'}`}
      >
        <Sparkles size={18} color={!aiTopic.trim() ? '#94a3b8' : 'white'} />
        <Text className={`font-black text-lg ${!aiTopic.trim() ? 'text-slate-400' : 'text-white'}`}>
          {aiLoading ? 'Жасалуда...' : 'Сұрақтар жасау'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ProfileSection = () => (
    <View className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl shadow-indigo-900/5 overflow-hidden">
      <View className="p-6 border-b border-slate-100 flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-full bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-600/30">
          <Text className="text-white text-xl font-black">{user?.email?.charAt(0).toUpperCase() || 'A'}</Text>
        </View>
        <View>
          <Text className="text-lg font-black text-slate-900">Администратор</Text>
          <Text className="text-slate-500 text-[14px] font-medium">{user?.email}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => router.push('/(student)/dashboard')} className="flex-row items-center justify-between p-5 border-b border-slate-100 bg-white/40 active:bg-slate-50">
        <View className="flex-row items-center gap-3">
          <User size={20} color="#4848e5" />
          <Text className="font-bold text-slate-700 text-[15px]">Студент режиміне өту</Text>
        </View>
        <ArrowRight size={18} color="#cbd5e1" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-5 bg-white/40 active:bg-red-50/50">
        <View className="flex-row items-center gap-3">
          <LogOut size={20} color="#ef4444" />
          <Text className="font-bold text-red-500 text-[15px]">Аккаунттан шығу</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-[1] bg-slate-50 relative overflow-hidden w-full h-full">
      {/* Soft decorative background orbs for Premium Glassmorphism Look */}
      <View className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl opacity-60" />
      <View className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-3xl opacity-60" />

      {/* Mobile Tab Bar Header */}
      <View className="flex lg:hidden flex-row bg-white/80 backdrop-blur-xl border-b border-white z-10 shadow-sm shadow-slate-200/20">
        {[
          { key: 'tests', label: 'Тесттер' },
          { key: 'create', label: 'Жасау' },
          { key: 'ai', label: 'ЖИ' },
          { key: 'profile', label: 'Профиль' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-4 items-center border-b-[3px] transition-all ${activeTab === tab.key ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Text className={`font-black text-[13px] tracking-wide ${activeTab === tab.key ? 'text-indigo-600' : 'text-slate-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pt-6 lg:pt-10 px-4 lg:px-10 pb-16">
        
        {/* Header Section (Desktop) */}
        <View className="hidden lg:flex flex-row justify-between items-end mb-8 pl-1">
           <View>
            <Text className="text-sm text-indigo-500 font-bold uppercase tracking-widest mb-1">Мұғалім кабинеті</Text>
            <Text className="text-[36px] font-black text-slate-900 tracking-tight">Басқару тақтасы</Text>
          </View>
        </View>

        <View className="flex-col lg:flex-row gap-8">
          
          {/* LEFT/MAIN COLUMN - Tests Management */}
          <View className={`flex-[1] lg:flex-[2.5] ${activeTab === 'tests' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Stat Cards */}
            <View className="flex-col md:flex-row flex-wrap lg:flex-nowrap gap-5 mb-8">
              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-row items-center gap-5">
                 <View className="bg-indigo-50 w-14 h-14 items-center justify-center rounded-2xl"><FileText size={28} color="#4848e5" /></View>
                 <View>
                  <Text className="text-3xl font-black text-slate-900 tracking-tight">{tests.length}</Text>
                  <Text className="text-[14px] text-slate-500 font-bold mt-1">Барлық тест</Text>
                 </View>
              </View>

              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-row items-center gap-5">
                 <View className="bg-emerald-50 w-14 h-14 items-center justify-center rounded-2xl"><CheckCircle size={28} color="#10b981" /></View>
                 <View>
                  <Text className="text-3xl font-black text-slate-900 tracking-tight">{published.length}</Text>
                  <Text className="text-[14px] text-slate-500 font-bold mt-1">Жарияланған</Text>
                 </View>
              </View>
              
              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-indigo-900/5 flex-row items-center gap-5">
                 <View className="bg-slate-100 w-14 h-14 items-center justify-center rounded-2xl"><Archive size={28} color="#64748b" /></View>
                 <View>
                  <Text className="text-3xl font-black text-slate-900 tracking-tight">{unpublished.length}</Text>
                  <Text className="text-[14px] text-slate-500 font-bold mt-1">Жабық/Черновик</Text>
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
                        onPress={() => Alert.alert(
                          test.is_published ? 'Тестті жабу' : 'Тестті ашу',
                          `«${test.title}» ${test.is_published ? 'жабылсын ба?' : 'қайта ашылсын ба?'}`,
                          [
                            { text: 'Бас тарту', style: 'cancel' },
                            { text: test.is_published ? 'Жабу' : 'Ашу', style: test.is_published ? 'destructive' : 'default', onPress: () => togglePublish(test) }
                          ]
                        )}
                        className="flex-1 py-4 flex-row items-center justify-center gap-2 border-r border-slate-100 active:bg-slate-50 transition-colors"
                      >
                        {test.is_published
                          ? <><EyeOff size={18} color="#64748b" /><Text className="text-slate-600 font-black text-[14px]">Жабу</Text></>
                          : <><Eye size={18} color="#4848e5" /><Text className="text-indigo-600 font-black text-[14px]">Жариялау</Text></>
                        }
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deleteTest(test)}
                        className="flex-1 py-4 flex-row items-center justify-center gap-2 active:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} color="#ef4444" />
                        <Text className="text-red-500 font-black text-[14px]">Өшіру</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* RIGHT/SIDE COLUMN - Actions (Forms, AI, Profile) */}
          <View className="flex-none lg:flex-1 lg:min-w-[360px] flex-col gap-6">
            <View className={`w-full ${activeTab === 'create' ? 'flex' : 'hidden lg:flex'}`}>
              <CreateTestForm />
            </View>
            <View className={`w-full ${activeTab === 'ai' ? 'flex' : 'hidden lg:flex'}`}>
              <AiGeneratorForm />
            </View>
            <View className={`w-full ${activeTab === 'profile' ? 'flex' : 'hidden lg:flex'}`}>
              <ProfileSection />
            </View>
          </View>
          
        </View>

      </ScrollView>
    </View>
  );
}
