import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FileText, CheckCircle, Archive, Sparkles, Trash2, X, Circle, CheckSquare, AlignLeft, Eye, EyeOff, User, LogOut, ArrowRight, ShieldCheck, Settings, Users } from 'lucide-react-native';
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
    <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 24, gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Plus size={20} color="#4848e5" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Қолмен жасау</Text>
      </View>
      <View>
        <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 13 }}>Тест атауы *</Text>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Мысалы: Жоғары математика"
          placeholderTextColor="#94a3b8"
          style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 14, backgroundColor: '#f8fafc' }}
        />
      </View>
      <View>
        <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 13 }}>Пән *</Text>
        <TextInput
          value={newSubject}
          onChangeText={setNewSubject}
          placeholder="Мысалы: Математика"
          placeholderTextColor="#94a3b8"
          style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 14, backgroundColor: '#f8fafc' }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 13 }}>Уақыт (мин)</Text>
          <TextInput
            value={newDuration}
            onChangeText={setNewDuration}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#94a3b8"
            style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 14, backgroundColor: '#f8fafc' }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 13 }}>Өту баллы (%)</Text>
          <TextInput
            value={newPassing}
            onChangeText={setNewPassing}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor="#94a3b8"
            style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 14, backgroundColor: '#f8fafc' }}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={createTest}
        disabled={creating}
        style={{ backgroundColor: creating ? '#a5a5f0' : '#4848e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 }}
      >
        <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
          {creating ? 'Жасалуда...' : '+ Тест жасау'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const AiGeneratorForm = () => (
    <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Sparkles size={20} color="#8b5cf6" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>ЖИ Генераторы</Text>
      </View>
      <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
        Жасанды интеллект сізге бірнеше секундта сұрақтар дайындап береді.
      </Text>
      <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 13 }}>Тақырып</Text>
      <TextInput
        value={aiTopic}
        onChangeText={setAiTopic}
        placeholder="Мысалы: Кванттық физика..."
        placeholderTextColor="#94a3b8"
        style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 14, backgroundColor: '#f8fafc', marginBottom: 16 }}
      />
      <TouchableOpacity
        onPress={handleAiGenerate}
        disabled={aiLoading || !aiTopic.trim()}
        style={{ backgroundColor: !aiTopic.trim() ? '#e2e8f0' : '#8b5cf6', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
      >
        <Sparkles size={16} color={!aiTopic.trim() ? '#94a3b8' : 'white'} />
        <Text style={{ color: !aiTopic.trim() ? '#94a3b8' : 'white', fontWeight: '800', fontSize: 14 }}>
          {aiLoading ? 'Жасалуда...' : 'Сұрақтар жасау'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ProfileSection = () => (
    <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>{user?.email?.charAt(0).toUpperCase() || 'A'}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>Администратор</Text>
          <Text style={{ color: '#64748b', fontSize: 13 }}>{user?.email}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => router.push('/(student)/dashboard')} className="flex-row items-center justify-between p-4 border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <User size={18} color="#4848e5" />
          <Text className="font-bold text-slate-700 text-sm">Студент режиміне өту</Text>
        </View>
        <ArrowRight size={16} color="#cbd5e1" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center gap-3">
          <LogOut size={18} color="#ef4444" />
          <Text className="font-bold text-red-500 text-sm">Аккаунттан шығу</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* Mobile Tab Bar Header */}
      <View className="flex lg:hidden flex-row bg-white border-b border-slate-200">
        {[
          { key: 'tests', label: 'Тесттер' },
          { key: 'create', label: 'Жасау' },
          { key: 'ai', label: '✨ ЖИ' },
          { key: 'profile', label: 'Профиль' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3.5 items-center border-b-2 transition-all ${activeTab === tab.key ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Text className={`font-bold text-[13px] ${activeTab === tab.key ? 'text-indigo-600' : 'text-slate-500'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pt-6 lg:pt-10 px-4 lg:px-10 pb-16">
        
        {/* Header Section (Desktop) */}
        <View className="hidden lg:flex flex-row justify-between items-end mb-8">
           <View>
            <Text className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Мұғалім кабинеті</Text>
            <Text className="text-[32px] font-black text-slate-900 mt-1">Басқару тақтасы ⚙️</Text>
          </View>
        </View>

        <View className="flex-col lg:flex-row gap-8">
          
          {/* LEFT/MAIN COLUMN - Tests Management */}
          <View className={`flex-1 lg:flex-[2.5] ${activeTab === 'tests' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Stat Cards */}
            <View className="flex-col md:flex-row flex-wrap lg:flex-nowrap gap-4 mb-6">
              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
                 <View className="bg-indigo-50 p-3 rounded-xl"><FileText size={24} color="#4848e5" /></View>
                 <View>
                  <Text className="text-2xl font-black text-slate-900">{tests.length}</Text>
                  <Text className="text-[13px] text-slate-500 font-semibold">Барлық тест</Text>
                 </View>
              </View>

              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
                 <View className="bg-green-50 p-3 rounded-xl"><CheckCircle size={24} color="#15803d" /></View>
                 <View>
                  <Text className="text-2xl font-black text-slate-900">{published.length}</Text>
                  <Text className="text-[13px] text-slate-500 font-semibold">Жарияланған</Text>
                 </View>
              </View>
              
              <View className="flex-1 w-full md:w-[48%] lg:w-auto bg-white p-5 rounded-2xl border border-slate-200 flex-row items-center gap-4">
                 <View className="bg-slate-100 p-3 rounded-xl"><Archive size={24} color="#64748b" /></View>
                 <View>
                  <Text className="text-2xl font-black text-slate-900">{unpublished.length}</Text>
                  <Text className="text-[13px] text-slate-500 font-semibold">Жабық/Черновик</Text>
                 </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-slate-900">Тесттер тізімі</Text>
            </View>

            {/* TESTS GRID */}
            <View className="flex-row flex-wrap justify-between">
              {tests.length === 0 ? (
                <View className="w-full bg-white p-16 rounded-2xl items-center border border-slate-200">
                  <FileText size={48} color="#cbd5e1" />
                  <Text className="text-slate-400 mt-3 font-bold text-base">Тест жоқ</Text>
                  <Text className="text-slate-300 mt-1.5 text-[13px]">Дерекқорда әзірге тесттер жоқ</Text>
                </View>
              ) : (
                tests.map(test => (
                  <View key={test.id} className="w-full md:w-[48%] mb-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <TouchableOpacity
                      onPress={() => router.push(`/test/${test.id}/edit` as any)}
                      className="p-5"
                    >
                      <View className="flex-row items-center gap-2 mb-3">
                        <View className={`px-2 py-1 rounded-md ${test.is_published ? 'bg-green-100' : 'bg-slate-100'}`}>
                          <Text className={`text-[11px] font-extrabold uppercase tracking-wide ${test.is_published ? 'text-green-700' : 'text-slate-500'}`}>
                            {test.is_published ? '● Жарияланған' : '○ Жабық'}
                          </Text>
                        </View>
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">{test.subject}</Text>
                      </View>
                      
                      <Text className="text-lg font-extrabold text-slate-900 leading-normal mb-4" numberOfLines={2}>{test.title}</Text>
                      
                      <View className="flex-row gap-4 pt-4 border-t border-slate-100">
                        <Text className="text-slate-500 text-[13px] font-semibold">📝 {test.question_count} сұрақ</Text>
                        <Text className="text-slate-500 text-[13px] font-semibold">⏱ {test.duration_minutes} мин</Text>
                      </View>
                    </TouchableOpacity>

                    <View className="flex-row border-t border-slate-100 bg-slate-50">
                      <TouchableOpacity
                        onPress={() => Alert.alert(
                          test.is_published ? 'Тестті жабу' : 'Тестті ашу',
                          `«${test.title}» ${test.is_published ? 'жабылсын ба?' : 'қайта ашылсын ба?'}`,
                          [
                            { text: 'Бас тарту', style: 'cancel' },
                            { text: test.is_published ? 'Жабу' : 'Ашу', onPress: () => togglePublish(test) }
                          ]
                        )}
                        className="flex-1 py-3.5 flex-row items-center justify-center gap-1.5 border-r border-slate-100"
                      >
                        {test.is_published
                          ? <><EyeOff size={16} color="#64748b" /><Text className="text-slate-500 font-bold text-[13px]">Жабу</Text></>
                          : <><Eye size={16} color="#4848e5" /><Text className="text-indigo-600 font-bold text-[13px]">Жариялау</Text></>
                        }
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deleteTest(test)}
                        className="flex-1 py-3.5 flex-row items-center justify-center gap-1.5"
                      >
                        <Trash2 size={16} color="#ef4444" />
                        <Text className="text-red-500 font-bold text-[13px]">Өшіру</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* RIGHT/SIDE COLUMN - Actions (Forms, AI, Profile) */}
          <View className="flex-none lg:flex-1 lg:min-w-[340px] flex-col gap-6">
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
    </SafeAreaView>
  );
}
