import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FileText, CheckCircle, Archive, Sparkles, Trash2, X, Circle, CheckSquare, AlignLeft, Eye, EyeOff, User, LogOut, ArrowRight, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { API } from '../../constants/api';

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

export default function AdminConstructor() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'tests' | 'create' | 'ai' | 'profile'>('tests');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        setShowCreateModal(false);
        setActiveView('tests');
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        {[
          { key: 'tests', label: 'Тесттер' },
          { key: 'create', label: 'Жасау' },
          { key: 'ai', label: '✨ ЖИ' },
          { key: 'profile', label: 'Профиль' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveView(tab.key as any)}
            style={{
              flex: 1, paddingVertical: 14, alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeView === tab.key ? '#4848e5' : 'transparent'
            }}
          >
            <Text style={{ fontWeight: '700', color: activeView === tab.key ? '#4848e5' : '#94a3b8', fontSize: 13 }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* --- TESTS VIEW --- */}
        {activeView === 'tests' && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>Тесттер</Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{tests.length} тест · {published.length} жарияланған</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveView('create')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4848e5', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 }}
              >
                <Plus size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Жаңа</Text>
              </TouchableOpacity>
            </View>

            {tests.length === 0 ? (
              <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
                <FileText size={48} color="#cbd5e1" />
                <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '700', fontSize: 16 }}>Тест жоқ</Text>
                <Text style={{ color: '#cbd5e1', marginTop: 6, fontSize: 13 }}>«Жасау» табын басыңыз</Text>
              </View>
            ) : (
              tests.map(test => (
                <View key={test.id} style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12, overflow: 'hidden' }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/test/${test.id}/edit` as any)}
                    style={{ padding: 16 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <View style={{
                            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                            backgroundColor: test.is_published ? '#dcfce7' : '#f1f5f9'
                          }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: test.is_published ? '#15803d' : '#64748b' }}>
                              {test.is_published ? '● Жарияланған' : '○ Жабық'}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8' }}>{test.subject}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a', lineHeight: 22 }} numberOfLines={2}>{test.title}</Text>
                        {test.description ? (
                          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 6 }} numberOfLines={2}>{test.description}</Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>📝 {test.question_count} сұрақ</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>⏱ {test.duration_minutes} мин</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>🎯 {test.passing_score}% өту</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f8fafc' }}>
                    <TouchableOpacity
                      onPress={() => Alert.alert(
                        test.is_published ? 'Тестті жабу' : 'Тестті ашу',
                        `«${test.title}» ${test.is_published ? 'жабылсын ба?' : 'қайта ашылсын ба?'}`,
                        [
                          { text: 'Бас тарту', style: 'cancel' },
                          { text: test.is_published ? 'Жабу' : 'Ашу', onPress: () => togglePublish(test) }
                        ]
                      )}
                      style={{ flex: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRightWidth: 1, borderRightColor: '#f8fafc' }}
                    >
                      {test.is_published
                        ? <><EyeOff size={15} color="#64748b" /><Text style={{ color: '#64748b', fontWeight: '700', fontSize: 13 }}>Жабу</Text></>
                        : <><Eye size={15} color="#4848e5" /><Text style={{ color: '#4848e5', fontWeight: '700', fontSize: 13 }}>Қайта ашу</Text></>
                      }
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteTest(test)}
                      style={{ flex: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Trash2 size={15} color="#ef4444" />
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Өшіру</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* --- CREATE VIEW --- */}
        {activeView === 'create' && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>Жаңа тест жасау</Text>

            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', padding: 16, gap: 16 }}>
              <View>
                <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Тест атауы *</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Мысалы: Жоғары математика"
                  placeholderTextColor="#94a3b8"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc' }}
                />
              </View>
              <View>
                <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Пән *</Text>
                <TextInput
                  value={newSubject}
                  onChangeText={setNewSubject}
                  placeholder="Мысалы: Математика"
                  placeholderTextColor="#94a3b8"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc' }}
                />
              </View>
              <View>
                <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Сипаттама</Text>
                <TextInput
                  value={newDesc}
                  onChangeText={setNewDesc}
                  placeholder="Қысқаша сипаттама..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc', minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Уақыт (мин)</Text>
                  <TextInput
                    value={newDuration}
                    onChangeText={setNewDuration}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#94a3b8"
                    style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Өту баллы (%)</Text>
                  <TextInput
                    value={newPassing}
                    onChangeText={setNewPassing}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor="#94a3b8"
                    style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc' }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={createTest}
                disabled={creating}
                style={{ backgroundColor: creating ? '#a5a5f0' : '#4848e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {creating ? 'Жасалуда...' : '+ Тест жасау'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- AI VIEW --- */}
        {activeView === 'ai' && (
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={28} color="#4848e5" />
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>ЖИ сұрақ генераторы</Text>
            </View>
            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
              Тақырып беріңіз — ЖИ (AI) сіз үшін тест сұрақтарын автоматты жасайды.
            </Text>
            <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 14 }}>Тақырып</Text>
            <TextInput
              value={aiTopic}
              onChangeText={setAiTopic}
              placeholder="Мысалы: Кванттық физика негіздері..."
              placeholderTextColor="#94a3b8"
              style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 15, backgroundColor: '#f8fafc', marginBottom: 16 }}
            />
            <TouchableOpacity
              onPress={handleAiGenerate}
              disabled={aiLoading || !aiTopic.trim()}
              style={{ backgroundColor: !aiTopic.trim() ? '#a5a5f0' : '#4848e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Sparkles size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
                {aiLoading ? 'Жасалуда...' : 'Сұрақтар жасау'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- PROFILE VIEW --- */}
        {activeView === 'profile' && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>Менің профилім</Text>
            
            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', padding: 20, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Администратор</Text>
                  <Text style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>{user?.email}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <ShieldCheck size={20} color="#10b981" />
                <Text style={{ color: '#334155', fontWeight: '600', fontSize: 13 }}>Толық мұғалім құқығы берілген</Text>
              </View>
            </View>

            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', padding: 8 }}>
              
              <TouchableOpacity
                onPress={() => router.push('/(student)/dashboard')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ backgroundColor: '#e0e7ff', padding: 8, borderRadius: 10 }}>
                    <User size={20} color="#4848e5" />
                  </View>
                  <View>
                    <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>Студент режиміне өту</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Тесттер қалай көрінетінін тексеру</Text>
                  </View>
                </View>
                <ArrowRight size={20} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ backgroundColor: '#fef2f2', padding: 8, borderRadius: 10 }}>
                    <LogOut size={20} color="#ef4444" />
                  </View>
                  <Text style={{ fontWeight: '700', color: '#ef4444', fontSize: 15 }}>Аккаунттан шығу</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
