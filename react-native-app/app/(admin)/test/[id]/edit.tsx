import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, ArrowLeft, Trash2, Edit2, Code2, List, Save, X, Terminal } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../../../constants/api';

interface Option {
  text: string;
  is_correct: boolean;
}

interface TestCase {
  input: string;
  expected_output: string;
}

interface Question {
  id?: number;
  type: 'MULTIPLE_CHOICE' | 'CODE';
  text: string;
  options?: Option[];
  initial_code?: string;
  test_cases?: TestCase[];
  order_index?: number;
}

interface TestDetail {
  id: string;
  title: string;
  questions: Question[];
}

export default function TestEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showMCModal, setShowMCModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // MC Form State
  const [mcText, setMcText] = useState('');
  const [mcOptions, setMcOptions] = useState<Option[]>([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  // Code Form State
  const [codeText, setCodeText] = useState('');
  const [codeInitial, setCodeInitial] = useState('');
  const [codeTestCases, setCodeTestCases] = useState<TestCase[]>([{ input: '', expected_output: '' }]);

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTest(await res.json());
      } else {
        Alert.alert('Қате', 'Тест табылмады');
        router.back();
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    Alert.alert(
      'Сұрақты өшіру',
      'Бұл сұрақты өшіргіңіз келетініне сенімдісіз бе?',
      [
        { text: 'Бас тарту', style: 'cancel' },
        { 
          text: 'Өшіру', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('lumina_token');
              const res = await fetch(`${API}/api/questions/${questionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                fetchTest();
              }
            } catch (e) {
              Alert.alert('Қате', 'Сұрақты өшіру мүмкін болмады');
            }
          }
        }
      ]
    );
  };

  const saveMultipleChoice = async () => {
    if (!mcText.trim() || mcOptions.some(o => !o.text.trim())) {
      Alert.alert('Қате', 'Орнатылған барлық өрістерді толтырыңыз');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const payload: Question = {
        type: 'MULTIPLE_CHOICE',
        text: mcText,
        options: mcOptions,
        test_id: id as unknown
      } as any;

      const res = await fetch(`${API}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowMCModal(false);
        resetMCForm();
        fetchTest();
      } else {
        Alert.alert('Қате', 'Сақтау мүмкін болмады');
      }
    } catch (e) {
      Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
    } finally {
      setSaving(false);
    }
  };

  const saveCodeQuestion = async () => {
    if (!codeText.trim() || codeTestCases.some(tc => !tc.input.trim() || !tc.expected_output.trim())) {
      Alert.alert('Қате', 'Барлық өрістерді толтырыңыз (Тест-кейстерді қоса)');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const payload: Question = {
        type: 'CODE',
        text: codeText,
        initial_code: codeInitial,
        test_cases: codeTestCases,
        test_id: id as unknown
      } as any;

      const res = await fetch(`${API}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCodeModal(false);
        resetCodeForm();
        fetchTest();
      } else {
        Alert.alert('Қате', 'Сақтау мүмкін болмады');
      }
    } catch (e) {
      Alert.alert('Қате', 'Серверге қосылу сәтсіз болды');
    } finally {
      setSaving(false);
    }
  };

  const resetMCForm = () => {
    setMcText('');
    setMcOptions([
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]);
  };

  const resetCodeForm = () => {
    setCodeText('');
    setCodeInitial('');
    setCodeTestCases([{ input: '', expected_output: '' }]);
  };

  if (loading || !test) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4848e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8, backgroundColor: '#f1f5f9', borderRadius: 10 }}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }} numberOfLines={1}>{test.title}</Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Сұрақтар редакторы</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* ADD BUTTONS */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity 
            onPress={() => setShowMCModal(true)}
            style={{ flex: 1, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', padding: 16, borderRadius: 16, alignItems: 'center' }}
          >
            <View style={{ backgroundColor: '#bfdbfe', padding: 8, borderRadius: 10, marginBottom: 8 }}>
              <List size={20} color="#1d4ed8" />
            </View>
            <Text style={{ color: '#1e3a8a', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>+ Тест сұрағы</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowCodeModal(true)}
            style={{ flex: 1, backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a', padding: 16, borderRadius: 16, alignItems: 'center' }}
          >
            <View style={{ backgroundColor: '#fde68a', padding: 8, borderRadius: 10, marginBottom: 8 }}>
              <Code2 size={20} color="#b45309" />
            </View>
            <Text style={{ color: '#78350f', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>+ Код сұрағы</Text>
          </TouchableOpacity>
        </View>

        {/* QUESTIONS LIST */}
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>
          Барлық сұрақтар ({test.questions?.length || 0})
        </Text>

        {(!test.questions || test.questions.length === 0) ? (
          <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
            <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 16 }}>Сұрақтар жоқ</Text>
            <Text style={{ color: '#cbd5e1', marginTop: 6, fontSize: 13 }}>Жоғарыдағы батырмаларды басып қосыңыз</Text>
          </View>
        ) : (
          test.questions.map((q, idx) => (
            <View key={q.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={{ backgroundColor: q.type === 'CODE' ? '#fef3c7' : '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ color: q.type === 'CODE' ? '#d97706' : '#64748b', fontSize: 11, fontWeight: '800' }}>
                      {idx + 1}. {q.type === 'CODE' ? 'КОД' : 'ТЕСТ'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 }} numberOfLines={2}>{q.text}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteQuestion(q.id!)} style={{ padding: 6, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                  <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>

              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <View style={{ paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#f1f5f9', gap: 6 }}>
                  {q.options.map((opt, oIdx) => (
                    <Text key={oIdx} style={{ color: opt.is_correct ? '#16a34a' : '#64748b', fontSize: 13, fontWeight: opt.is_correct ? '700' : '500' }}>
                      {opt.is_correct ? '✓ ' : '○ '}{opt.text}
                    </Text>
                  ))}
                </View>
              )}

              {q.type === 'CODE' && (
                <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                   <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Бастапқы код:</Text>
                   <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#0f172a' }}>
                     {q.initial_code || '// Жоқ'}
                   </Text>
                   <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 }} />
                   <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700' }}>Тест кейстер саны: {q.test_cases?.length || 0}</Text>
                </View>
              )}
            </View>
          ))
        )}

      </ScrollView>

      {/* MULTIPLE CHOICE MODAL */}
      <Modal visible={showMCModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMCModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Тест сұрағын қосу</Text>
            <TouchableOpacity onPress={() => setShowMCModal(false)} style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8 }}>Сұрақ мәтіні</Text>
              <TextInput
                multiline
                numberOfLines={3}
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, color: '#0f172a', fontSize: 15, textAlignVertical: 'top', minHeight: 100, marginBottom: 24 }}
                placeholder="Сұрақты осында жазыңыз..."
                value={mcText}
                onChangeText={setMcText}
              />

              <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 12 }}>Жауап нұсқалары (Дұрыс жауапты таңдаңыз)</Text>
              <View style={{ gap: 12 }}>
                {mcOptions.map((opt, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity 
                      onPress={() => setMcOptions(prev => prev.map((o, i) => ({ ...o, is_correct: i === idx })))}
                      style={{ padding: 4 }}
                    >
                      <View style={{ 
                        height: 24, width: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                        borderColor: opt.is_correct ? '#4848e5' : '#cbd5e1', backgroundColor: opt.is_correct ? '#4848e5' : 'transparent'
                      }}>
                        {opt.is_correct && <View style={{ height: 8, width: 8, backgroundColor: 'white', borderRadius: 4 }} />}
                      </View>
                    </TouchableOpacity>
                    <TextInput 
                      style={{ flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: opt.is_correct ? '#4848e5' : '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#0f172a' }}
                      placeholder={`${String.fromCharCode(65 + idx)} нұсқасы...`}
                      value={opt.text}
                      onChangeText={(t) => setMcOptions(prev => {
                        const next = [...prev];
                        next[idx].text = t;
                        return next;
                      })}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                disabled={saving}
                onPress={saveMultipleChoice}
                style={{ backgroundColor: '#4848e5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {saving ? 'Сақталуда...' : 'Сұрақты сақтау'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* CODE QUESTION MODAL */}
      <Modal visible={showCodeModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCodeModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Код сұрағын қосу</Text>
            <TouchableOpacity onPress={() => setShowCodeModal(false)} style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
              
              <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8 }}>Есептің шарты</Text>
              <TextInput
                multiline
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, color: '#0f172a', fontSize: 15, textAlignVertical: 'top', minHeight: 100, marginBottom: 20 }}
                placeholder="Есептің сипаттамасын жазыңыз..."
                value={codeText}
                onChangeText={setCodeText}
              />

              <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8 }}>Бастапқы код (шаблон)</Text>
              <View style={{ backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  <TextInput
                   multiline
                   autoCapitalize="none"
                   autoCorrect={false}
                   style={{ color: '#e2e8f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14, minHeight: 120, padding: 16, textAlignVertical: 'top' }}
                   placeholder="def solve():\n  # Код..."
                   placeholderTextColor="#475569"
                   value={codeInitial}
                   onChangeText={setCodeInitial}
                 />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', color: '#334155' }}>Тест-кейстер</Text>
                <TouchableOpacity 
                  onPress={() => setCodeTestCases(prev => [...prev, { input: '', expected_output: '' }])}
                  style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 12 }}>+ Қосу</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 16 }}>
                {codeTestCases.map((tc, idx) => (
                  <View key={idx} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12 }}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                       <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '800' }}>КЕЙС #{idx + 1}</Text>
                       {codeTestCases.length > 1 && (
                         <TouchableOpacity onPress={() => setCodeTestCases(prev => prev.filter((_, i) => i !== idx))}>
                           <Trash2 size={16} color="#ef4444" />
                         </TouchableOpacity>
                       )}
                     </View>
                     <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Кіріс (Аргументтер):</Text>
                     <TextInput 
                       style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, marginBottom: 12 }}
                       placeholder="print(add(2, 5))"
                       value={tc.input}
                       onChangeText={(t) => setCodeTestCases(prev => {
                         const next = [...prev];
                         next[idx].input = t;
                         return next;
                       })}
                     />
                     <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Күтілетін нәтиже (Шығыс):</Text>
                     <TextInput 
                       style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}
                       placeholder="7"
                       value={tc.expected_output}
                       onChangeText={(t) => setCodeTestCases(prev => {
                         const next = [...prev];
                         next[idx].expected_output = t;
                         return next;
                       })}
                     />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                disabled={saving}
                onPress={saveCodeQuestion}
                style={{ backgroundColor: '#4848e5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {saving ? 'Сақталуда...' : 'Код сұрағын сақтау'}
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
