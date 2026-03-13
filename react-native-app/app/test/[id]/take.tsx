import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, AppState, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2, Code2, Terminal, Play, Copy } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

import { API } from '../../constants/api';

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  type: 'MULTIPLE_CHOICE' | 'CODE';
  text: string;
  initial_code?: string;
  image_url?: string;
  test_cases?: any[];
  options: Option[];
}

interface TestDetail {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  passing_score: number;
  questions: Question[];
}

export default function TestTake() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<number, string>>({});
  const [codeStatuses, setCodeStatuses] = useState<Record<number, { status: string, output: string, passed: number, total: number }>>({});
  const [runningCode, setRunningCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [mentorHint, setMentorHint] = useState<string | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const [testAttempts, setTestAttempts] = useState(1);
  const [antiCheatWarnings, setAntiCheatWarnings] = useState(0);

  const appState = useRef(AppState.currentState);
  const hasFinished = useRef(false);
  const lastAlertedWarning = useRef(0);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'web') {
      window.alert('Көшірілді!');
    } else {
      Alert.alert('Дайын', 'Мәтін алмасу буферіне көшірілді!');
    }
  };

  useEffect(() => {
    fetchTest();
    if (user?.id) {
        fetch(`${API}/api/users/coins?userId=${user.id}`)
            .then(res => res.json())
            .then(data => { if (data.coins !== undefined) setCoins(data.coins); })
            .catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    const handleBlur = () => {
       if (!hasFinished.current && !loading && !submitting) {
          setAntiCheatWarnings(w => w + 1);
       }
    };

    if (Platform.OS === 'web') {
        window.addEventListener('blur', handleBlur);
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (!hasFinished.current && !loading && !submitting) {
        if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
          setAntiCheatWarnings(w => w + 1);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (Platform.OS === 'web') {
          window.removeEventListener('blur', handleBlur);
      }
    };
  }, [loading, submitting]);

  useEffect(() => {
      if (antiCheatWarnings > lastAlertedWarning.current) {
          lastAlertedWarning.current = antiCheatWarnings;
          
          if (antiCheatWarnings === 1) {
              if (Platform.OS === 'web') {
                  window.alert(`Ескерту! Басқа терезеге өтуге болмайды.\n\nСізде тағы 2 мүмкіндік қалды.`);
              } else {
                  Alert.alert('Ескерту!', 'Тест кезінде қолданбадан шығуға немесе жабуға болмайды.\n\nСізде тағы 2 мүмкіндік қалды.');
              }
          } else if (antiCheatWarnings === 2) {
              if (Platform.OS === 'web') {
                  window.alert(`Ескерту! Басқа терезеге өтуге болмайды.\n\nСізде тағы 1 мүмкіндік қалды. Егер қайталанса, тест аяқталады.`);
              } else {
                  Alert.alert('Ескерту!', 'Қолданбадан шығуға болмайды.\n\nСізде тағы 1 мүмкіндік қалды. Егер қайталанса, тест аяқталады.');
              }
          } else if (antiCheatWarnings >= 3 && !hasFinished.current && test && !loading && !submitting) {
              if (Platform.OS === 'web') {
                  window.alert('Ереже 3 рет бұзылды! Тест автоматты түрде аяқталады.');
              } else {
                  Alert.alert('Ереже бұзылды!', 'Сіз қолданбадан 3 рет шықтыңыз. Тест автоматты түрде аяқталады.');
              }
              handleFinish(true);
          }
      }
  }, [antiCheatWarnings, test, loading, submitting]);

  useEffect(() => {
    if (!test || timeLeft <= 0 || hasFinished.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            if (Platform.OS === 'web') {
              window.alert('Уақыт бітті! Тестке бөлінген уақыт аяқталды. Нәтижелер сақталуда...');
            } else {
              Alert.alert('Уақыт бітті!', 'Тестке бөлінген уақыт аяқталды. Нәтижелер сақталуда...');
            }
            handleFinish();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  const fetchTest = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setTimeLeft(data.duration_minutes * 60);
        
        // Initialize code answers
        const initialCodes: Record<number, string> = {};
        data.questions.forEach((q: Question, idx: number) => {
            if (q.type === 'CODE' && q.initial_code) {
                initialCodes[idx] = q.initial_code;
            }
        });
        setCodeAnswers(initialCodes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
      if (!test) return;
      const q = test.questions[currentQuestionIndex];
      const code = codeAnswers[currentQuestionIndex] || q.initial_code;

      setRunningCode(true);
      try {
          const token = await AsyncStorage.getItem('lumina_token');
          const res = await fetch(`${API}/api/execute`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  code: code,
                  language: 'python', // Switched from JS to Python
                  test_id: test.id,
                  question_index: currentQuestionIndex
              })
          });

          const data = await res.json();
          setCodeStatuses(prev => ({
              ...prev,
              [currentQuestionIndex]: data
          }));
      } catch (err) {
          Alert.alert('Қате', 'Кодты тексеру мүмкін болмады. Интернетті тексеріңіз.');
      } finally {
          setRunningCode(false);
      }
  };

  const handleAskMentor = async () => {
      if (!test) return;
      const q = test.questions[currentQuestionIndex];
      const code = codeAnswers[currentQuestionIndex] || q.initial_code || '';

      setMentorLoading(true);
      setMentorHint(null);
      try {
          const res = await fetch(`${API}/api/mentor/hint`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ questionText: q.text, userCode: code, userId: user?.id })
          });
          const data = await res.json();
          if (data.hint) {
              setMentorHint(data.hint);
              if (data.coinsRemaining !== undefined) setCoins(data.coinsRemaining);
          } else if (data.error) {
              Alert.alert('Қате', data.error);
          }
      } catch (err) {
          Alert.alert('Қате', 'ИИ-менторға қосылу мүмкін болмады. Интернетті тексеріңіз.');
      } finally {
          setMentorLoading(false);
      }
  };

  const handleFinish = async (forced = false) => {
    if (!test || !user || submitting || hasFinished.current) return;
    
    hasFinished.current = true;
    setSubmitting(true);

    try {
      let score = 0;
      test.questions.forEach((q, index) => {
        if (q.type === 'CODE') {
             // For code questions, user gets a point if passed status is PASSED
             if (codeStatuses[index]?.status === 'PASSED') {
                 score += 1;
             }
        } else {
            const selectedId = answers[index];
            const option = q.options?.find(o => o.id === selectedId);
            if (option && option.is_correct) {
            score += 1;
            }
        }
      });

      const total = test.questions.length;
      const percentage = Math.round((score / total) * 100);
      const isPass = percentage >= test.passing_score;

      if (!isPass && !forced && testAttempts < 3) {
          const newAttempts = testAttempts + 1;
          const remaining = 3 - testAttempts;
          
          if (Platform.OS === 'web') {
              window.alert(`Сынақтан өтпедіңіз. Сіз ${percentage}% жинадыңыз (Шектік балл: ${test.passing_score}%).\n\nСізде тағы ${remaining} мүмкіндік бар. Әр қайта тапсыру -10% айыппұл әкеледі. Қателеріңізді түзеп, қайта жіберіңіз!`);
          } else {
              Alert.alert('Сынақтан өтпедіңіз', `Сіз ${percentage}% жинадыңыз (Шектік балл: ${test.passing_score}%).\n\nСізде тағы ${remaining} мүмкіндік бар. Әр қайта тапсыру -10% айыппұл әкеледі. Қателеріңізді түзеп, қайта жіберіңіз!`);
          }

          setTestAttempts(newAttempts);
          setSubmitting(false);
          hasFinished.current = false;
          return;
      }
      
      // Apply attempt penalty to score natively
      let finalScore = score - ((testAttempts - 1) * 0.1 * total);
      if (finalScore < 0) finalScore = 0;
      
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          test_id: test.id,
          user_id: user.id,
          score: finalScore,
          total
        })
      });

      if (res.ok) {
        router.replace({
          pathname: '/test/[id]/result',
          params: { id: test.id, title: test.title, score: String(finalScore), total: String(total), passScore: String(test.passing_score) }
        });
      } else {
         Alert.alert('Қате', 'Нәтижені сақтау мүмкін болмады');
         setSubmitting(false);
         hasFinished.current = false;
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Қате', 'Серверге қосылу мүмкін болмады');
      setSubmitting(false);
      hasFinished.current = false;
    }
  };

  const confirmFinish = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Тестті ерте аяқтағыңыз келе ме?")) {
        handleFinish(false);
      }
    } else {
      Alert.alert(
        "Аяқтау", 
        "Тестті ерте аяқтағыңыз келе ме?",
        [
          { text: "Жоқ", style: "cancel" },
          { text: "Иә, аяқтау", onPress: () => handleFinish(false), style: "destructive" }
        ]
      );
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading || submitting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4848e5" />
        <Text style={{ marginTop: 12, color: '#64748b', fontWeight: '600' }}>
          {submitting ? 'Тексерілуде...' : 'Сұрақтар жүктелуде...'}
        </Text>
      </SafeAreaView>
    );
  }

  if (!test || !test.questions?.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>Сұрақтар жоқ</Text>
        <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#4848e5', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Тақтаға оралу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isCodeQuestion = currentQuestion.type === 'CODE';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', zIndex: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={{ backgroundColor: '#e0e7ff', padding: 8, borderRadius: 10 }}>
              <BookOpen size={20} color="#4848e5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }} numberOfLines={1}>{test.title}</Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>{test.subject}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ 
            flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, 
            borderRadius: 10, borderWidth: 1, 
            backgroundColor: timeLeft < 300 ? '#fef2f2' : '#f8fafc',
            borderColor: timeLeft < 300 ? '#fca5a5' : '#e2e8f0'
          }}>
            <Clock size={16} color={timeLeft < 300 ? '#dc2626' : '#475569'} />
            <Text style={{ fontWeight: '800', color: timeLeft < 300 ? '#dc2626' : '#475569' }}>{formatTime(timeLeft)}</Text>
          </View>
          <TouchableOpacity onPress={confirmFinish} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ef4444', borderRadius: 10 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Ерте аяқтау</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        {/* Question Card */}
        <View style={{ backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', padding: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <View style={{ backgroundColor: isCodeQuestion ? '#fef3c7' : '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: isCodeQuestion ? '#d97706' : '#4848e5', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{currentQuestionIndex + 1}-СҰРАҚ</Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>
              {isCodeQuestion ? 'Код жазу (Олимпиада)' : 'Бірнеше таңдау'}
            </Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: currentQuestion.image_url ? 16 : (isCodeQuestion ? 16 : 24), lineHeight: 28 }}>
            {currentQuestion.text}
          </Text>

          {currentQuestion.image_url && (
              <Image 
                source={{ uri: currentQuestion.image_url }} 
                style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: isCodeQuestion ? 16 : 24 }} 
                resizeMode="contain" 
              />
          )}

          {isCodeQuestion ? (
              // CODE IDE UI
              <View style={{ gap: 16 }}>
                 {/* ACMP STYLE INPUT/OUTPUT TABLE */}
                 {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 && (
                     <View style={{ borderWidth: 1, borderColor: '#16a34a', overflow: 'hidden', backgroundColor: 'white', marginBottom: 8 }}>
                         <View style={{ flexDirection: 'row', backgroundColor: '#dcfce7', borderBottomWidth: 1, borderBottomColor: '#16a34a' }}>
                             <Text style={{ width: 40, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12, borderRightWidth: 1, borderRightColor: '#16a34a', textAlign: 'center' }}>№</Text>
                             <Text style={{ flex: 1, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12, borderRightWidth: 1, borderRightColor: '#16a34a' }}>INPUT.TXT</Text>
                             <Text style={{ flex: 1, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12 }}>OUTPUT.TXT</Text>
                         </View>
                         {currentQuestion.test_cases.slice(0, 3).map((tc, idx, arr) => (
                             <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: '#16a34a' }}>
                                 <View style={{ width: 40, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#16a34a' }}>
                                     <Text style={{ color: '#166534', fontSize: 13, fontWeight: '600' }}>{idx + 1}</Text>
                                 </View>
                                 <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: '#16a34a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#0f172a' }}>{tc.input}</Text>
                                     <TouchableOpacity onPress={() => copyToClipboard(tc.input)} style={{ padding: 4 }}>
                                         <Copy size={14} color="#166534" />
                                     </TouchableOpacity>
                                 </View>
                                 <View style={{ flex: 1, padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#0f172a' }}>{tc.expected_output}</Text>
                                     <TouchableOpacity onPress={() => copyToClipboard(tc.expected_output)} style={{ padding: 4 }}>
                                         <Copy size={14} color="#166534" />
                                     </TouchableOpacity>
                                 </View>
                             </View>
                         ))}
                     </View>
                 )}

                 <View style={{ backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                    <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <Code2 size={16} color="#94a3b8" />
                       <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '800', flex: 1 }}>Python 3.10</Text>
                    </View>
                    <TextInput
                        multiline
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        style={{
                            color: '#e2e8f0',
                            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                            fontSize: 14,
                            minHeight: 180,
                            maxHeight: 500,
                            padding: 16,
                            textAlignVertical: 'top',
                            lineHeight: 22
                        }}
                        value={codeAnswers[currentQuestionIndex]}
                        onChangeText={(text) => {
                            const prevCode = codeAnswers[currentQuestionIndex] || '';
                            if (text.length > prevCode.length && text.endsWith('\n')) {
                                const lines = text.split('\n');
                                const prevLine = lines[lines.length - 2];
                                if (prevLine && prevLine.trim().endsWith(':')) {
                                    const match = prevLine.match(/^\s*/);
                                    const indent = match ? match[0] : '';
                                    setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text + indent + '    ' }));
                                    return;
                                } else if (prevLine) {
                                    const match = prevLine.match(/^\s*/);
                                    const indent = match ? match[0] : '';
                                    if (indent) {
                                        setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text + indent }));
                                        return;
                                    }
                                }
                            }
                            setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text }));
                        }}
                        placeholder="# Кодты осы жерге жазыңыз"
                        placeholderTextColor="#475569"
                    />
                 </View>

                 <View style={{ gap: 12, flexDirection: 'row' }}>
                     <TouchableOpacity 
                        onPress={handleRunCode}
                        disabled={runningCode}
                        style={{ flex: 1, backgroundColor: runningCode ? '#94a3b8' : '#0ea5e9', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                     >
                        {runningCode ? <ActivityIndicator size="small" color="white" /> : <Play size={18} color="white" />}
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{runningCode ? 'Орындалуда...' : 'Кодты тексеру'}</Text>
                     </TouchableOpacity>

                     <TouchableOpacity 
                        onPress={handleAskMentor}
                        disabled={mentorLoading}
                        style={{ flex: 1, backgroundColor: mentorLoading ? '#c4b5fd' : '#8b5cf6', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                     >
                        {mentorLoading ? <ActivityIndicator size="small" color="white" /> : <BookOpen size={18} color="white" />}
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
                          {mentorLoading ? 'Ойлануда...' : `Кеңес сұрау ${coins !== null ? `(10 ₿)` : ''}`}
                        </Text>
                     </TouchableOpacity>
                 </View>
                 
                 {coins !== null && (
                     <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                         Сіздің балансыңыз: <Text style={{ fontWeight: '800', color: '#d97706' }}>{coins} ₿</Text>
                     </Text>
                 )}

                 {/* Mentor Hint Output */}
                 {mentorHint && (
                     <View style={{ backgroundColor: '#f5f3ff', borderRadius: 16, borderWidth: 1, borderColor: '#ddd6fe', overflow: 'hidden', marginTop: 8 }}>
                         <View style={{ backgroundColor: '#ede9fe', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ddd6fe', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Code2 size={14} color="#8b5cf6" />
                            <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '800' }}>AI МЕНТОР</Text>
                         </View>
                         <View style={{ padding: 16 }}>
                             <Text style={{ fontSize: 14, color: '#4c1d95', lineHeight: 22 }}>
                                 {mentorHint}
                             </Text>
                         </View>
                     </View>
                 )}

                 {/* Console Output */}
                 {codeStatuses[currentQuestionIndex] && (
                     <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', marginTop: 8 }}>
                         <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Terminal size={14} color="#64748b" />
                            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '800' }}>ТЕСТ НӘТИЖЕСІ</Text>
                         </View>
                         <View style={{ padding: 16 }}>
                             <Text style={{
                                 color: codeStatuses[currentQuestionIndex]?.status === 'PASSED' ? '#059669' : '#dc2626',
                                 fontWeight: '800', fontSize: 16, marginBottom: 8
                             }}>
                                 {codeStatuses[currentQuestionIndex]?.status === 'PASSED' ? '✅ Барлық тесттерден өтті!' : '❌ Қателік табылды'}
                             </Text>
                             {!codeStatuses[currentQuestionIndex]?.status?.includes('PASSED') && (
                                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#475569', backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    {codeStatuses[currentQuestionIndex]?.output}
                                </Text>
                             )}
                         </View>
                     </View>
                 )}
              </View>
          ) : (
            // MULTIPLE CHOICE UI
            <View style={{ gap: 12 }}>
                {currentQuestion.options?.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === option.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                    <TouchableOpacity
                    key={option.id}
                    onPress={() => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option.id }))}
                    style={{
                        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2,
                        borderColor: isSelected ? '#4848e5' : '#e2e8f0',
                        backgroundColor: isSelected ? '#e0e7ff' : 'white'
                    }}
                    >
                    <View style={{ 
                        alignItems: 'center', justifyContent: 'center', height: 24, width: 24, borderRadius: 12, borderWidth: 2, marginRight: 14,
                        borderColor: isSelected ? '#4848e5' : '#cbd5e1', backgroundColor: isSelected ? '#4848e5' : 'transparent'
                    }}>
                        {isSelected && <View style={{ height: 8, width: 8, backgroundColor: 'white', borderRadius: 4 }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 15 }}>{option.text}</Text>
                        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{letter} нұсқасы</Text>
                    </View>
                    </TouchableOpacity>
                );
                })}
            </View>
          )}

        </View>

        {/* Navigation Buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => { 
                if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setMentorHint(null);
                }
            }}
            disabled={currentQuestionIndex === 0}
            style={{
              flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              backgroundColor: '#f1f5f9', opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}
          >
            <ArrowLeft size={18} color="#475569" />
            <Text style={{ fontWeight: '800', color: '#475569' }}>Артқа</Text>
          </TouchableOpacity>

          {isLastQuestion ? (
            <TouchableOpacity 
              onPress={confirmFinish} 
              style={{ flex: 1, paddingVertical: 16, backgroundColor: '#059669', borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontWeight: '800', color: 'white' }}>Аяқтау</Text>
              <CheckCircle2 size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => { 
                  if (currentQuestionIndex < test.questions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                      setMentorHint(null);
                  }
              }} 
              style={{ flex: 1, paddingVertical: 16, backgroundColor: '#4848e5', borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontWeight: '800', color: 'white' }}>Келесі</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' }}>
              Барлығы {test.questions.length} сұрақтың {currentQuestionIndex + 1}-шісі
            </Text>
            <View style={{ height: 6, width: '100%', backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', backgroundColor: '#4848e5', borderRadius: 3, width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }} />
            </View>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
