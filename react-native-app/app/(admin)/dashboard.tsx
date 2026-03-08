import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useWindowDimensions, Platform } from 'react-native';
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

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

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
      
      <TouchableOpacity onPress={() => router.push('/(student)/dashboard')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <User size={18} color="#4848e5" />
          <Text style={{ fontWeight: '700', color: '#334155', fontSize: 14 }}>Студент режиміне өту</Text>
        </View>
        <ArrowRight size={16} color="#cbd5e1" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <LogOut size={18} color="#ef4444" />
          <Text style={{ fontWeight: '700', color: '#ef4444', fontSize: 14 }}>Аккаунттан шығу</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      
      {/* Mobile Tab Bar Header */}
      {!isDesktop && (
        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
          {[
            { key: 'tests', label: 'Тесттер' },
            { key: 'create', label: 'Жасау' },
            { key: 'ai', label: '✨ ЖИ' },
            { key: 'profile', label: 'Профиль' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1, paddingVertical: 14, alignItems: 'center',
                borderBottomWidth: 2, borderBottomColor: activeTab === tab.key ? '#4848e5' : 'transparent'
              }}
            >
              <Text style={{ fontWeight: '700', color: activeTab === tab.key ? '#4848e5' : '#64748b', fontSize: 13 }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: isDesktop ? 40 : 24, paddingHorizontal: isDesktop ? 40 : 16, paddingBottom: 60 }}>
        
        {/* Header Section (Desktop) */}
        {isDesktop && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
             <View>
              <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Мұғалім кабинеті</Text>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f172a', marginTop: 4 }}>Басқару тақтасы ⚙️</Text>
            </View>
          </View>
        )}

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 32 }}>
          
          {/* LEFT/MAIN COLUMN - Tests Management */}
          {(!isDesktop ? activeTab === 'tests' : true) && (
            <View style={{ flex: isDesktop ? 2.5 : 1 }}>
              
              {/* Stat Cards */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: isTablet ? 'wrap' : 'nowrap' }}>
                <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                   <View style={{ backgroundColor: '#eef2ff', padding: 12, borderRadius: 12 }}><FileText size={24} color="#4848e5" /></View>
                   <View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{tests.length}</Text>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Барлық тест</Text>
                   </View>
                </View>

                <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                   <View style={{ backgroundColor: '#dcfce7', padding: 12, borderRadius: 12 }}><CheckCircle size={24} color="#15803d" /></View>
                   <View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{published.length}</Text>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Жарияланған</Text>
                   </View>
                </View>
                
                <View style={{ flex: 1, minWidth: isTablet ? '45%' : 'auto', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                   <View style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 }}><Archive size={24} color="#64748b" /></View>
                   <View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{unpublished.length}</Text>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Жабық/Черновик</Text>
                   </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>Тесттер тізімі</Text>
              </View>

              {/* TESTS GRID */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {tests.length === 0 ? (
                  <View style={{ width: '100%', backgroundColor: 'white', padding: 60, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <FileText size={48} color="#cbd5e1" />
                    <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '700', fontSize: 16 }}>Тест жоқ</Text>
                    <Text style={{ color: '#cbd5e1', marginTop: 6, fontSize: 13 }}>Дерекқорда әзірге тесттер жоқ</Text>
                  </View>
                ) : (
                  tests.map(test => (
                    <View key={test.id} style={{ 
                      width: getCardWidth(), marginBottom: 16, 
                      backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' 
                    }}>
                      <TouchableOpacity
                        onPress={() => router.push(`/test/${test.id}/edit` as any)}
                        style={{ padding: 20 }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: test.is_published ? '#dcfce7' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: test.is_published ? '#15803d' : '#64748b', textTransform: 'uppercase' }}>
                              {test.is_published ? '● Жарияланған' : '○ Жабық'}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{test.subject}</Text>
                        </View>
                        
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', lineHeight: 24, marginBottom: 16 }} numberOfLines={2}>{test.title}</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>📝 {test.question_count} сұрақ</Text>
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>⏱ {test.duration_minutes} мин</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#f8fafc' }}>
                        <TouchableOpacity
                          onPress={() => Alert.alert(
                            test.is_published ? 'Тестті жабу' : 'Тестті ашу',
                            `«${test.title}» ${test.is_published ? 'жабылсын ба?' : 'қайта ашылсын ба?'}`,
                            [
                              { text: 'Бас тарту', style: 'cancel' },
                              { text: test.is_published ? 'Жабу' : 'Ашу', onPress: () => togglePublish(test) }
                            ]
                          )}
                          style={{ flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRightWidth: 1, borderRightColor: '#f1f5f9' }}
                        >
                          {test.is_published
                            ? <><EyeOff size={16} color="#64748b" /><Text style={{ color: '#64748b', fontWeight: '700', fontSize: 13 }}>Жабу</Text></>
                            : <><Eye size={16} color="#4848e5" /><Text style={{ color: '#4848e5', fontWeight: '700', fontSize: 13 }}>Жариялау</Text></>
                          }
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => deleteTest(test)}
                          style={{ flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          <Trash2 size={16} color="#ef4444" />
                          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Өшіру</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* RIGHT/SIDE COLUMN - Actions (Forms, AI, Profile) */}
          <View style={{ flex: isDesktop ? 1 : undefined, minWidth: isDesktop ? 340 : 'auto', gap: 24 }}>
            {(!isDesktop ? activeTab === 'create' : true) && <CreateTestForm />}
            {(!isDesktop ? activeTab === 'ai' : true) && <AiGeneratorForm />}
            {(!isDesktop ? activeTab === 'profile' : isDesktop) && <ProfileSection />}
          </View>
          
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
