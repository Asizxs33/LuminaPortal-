import { displayFont } from '../../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, HelpCircle, Timer, AlertTriangle, CheckCircle2, Info, ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../../constants/api';

interface TestDetail {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  passing_score: number;
  questions: any[];
}

export default function TestStart() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const fetchTest = async () => {
      if (!id) {
        setError('Тест идентификаторы табылмады.');
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('lumina_token');
        // This also creates/reuses the student's persistent random set of 50 questions.
        const res = await fetch(`${API}/api/tests/${id}?forAttempt=true`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Тестті жүктеу мүмкін болмады (${res.status}).`);
        }

        const data = await res.json();
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('Тестте сұрақтар табылмады.');
        }
        setTest(data);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Failed to load test start screen:', e);
        }
        setError(
          (e as Error).name === 'AbortError'
            ? 'Жүктеу уақыты аяқталды. Интернетті тексеріп, қайта көріңіз.'
            : (e as Error).message || 'Тестті жүктеу мүмкін болмады.'
        );
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchTest();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
      </SafeAreaView>
    );
  }

  if (!test) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#10131B', marginBottom: 8 }}>Тест жүктелмеді</Text>
        <Text style={{ color: '#756D70', textAlign: 'center', marginBottom: 16 }}>{error || 'Тест табылмады'}</Text>
        <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#800F1D', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Тақтаға оралу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#DFD2C3', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
            <ArrowLeft size={24} color="#10131B" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={24} color="#800F1D" />
            <Text style={{ color: '#10131B', fontSize: 17, fontWeight: '800' }}>Бағалау порталы</Text>
          </View>
        </View>
        <TouchableOpacity style={{ padding: 6, backgroundColor: '#F3EDE4', borderRadius: 10 }}>
          <HelpCircle size={20} color="#46393D" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ marginBottom: 24, marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: '#10131B', fontFamily: displayFont, fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>{test.title}</Text>
          <Text style={{ color: '#756D70', textAlign: 'center', fontSize: 14 }}>Бастамас бұрын ережелермен танысып алыңыз.</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#DFD2C3', overflow: 'hidden', marginBottom: 24 }}>
          {/* Rules */}
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
              <View style={{ backgroundColor: '#F4E6E6', padding: 10, borderRadius: 14 }}>
                <Timer size={24} color="#800F1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#10131B', marginBottom: 4 }}>Уақыт шектеуі</Text>
                <Text style={{ color: '#756D70', fontSize: 14, lineHeight: 20 }}>
                  Барлығы <Text style={{ fontWeight: '800', color: '#10131B' }}>{test.duration_minutes} минут.</Text> Төмендегі түймені басқан бойда таймер іске қосылады.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
              <View style={{ backgroundColor: '#fef3c7', padding: 10, borderRadius: 14 }}>
                <AlertTriangle size={24} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#10131B', marginBottom: 4 }}>Анти-читерлік саясат</Text>
                <Text style={{ color: '#756D70', fontSize: 14, lineHeight: 20 }}>
                  <Text style={{ fontWeight: '800', color: '#b45309' }}>Қолданбадан шықпаңыз!</Text> Егер тест кезінде басқа қосымшаға немесе фонға өтсеңіз, тест <Text style={{ fontWeight: '800' }}>автоматты түрде</Text> аяқталып нәтиже жіберіледі.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ backgroundColor: '#dcfce7', padding: 10, borderRadius: 14 }}>
                <CheckCircle2 size={24} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#10131B', marginBottom: 4 }}>Интернет байланысы</Text>
                <Text style={{ color: '#756D70', fontSize: 14, lineHeight: 20 }}>
                  Интернет қосылып тұрғанына көз жеткізіңіз. Үзіліс болса, нәтиже сақталмауы мүмкін.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push(`/test/${test.id}/take`)} 
          style={{ backgroundColor: '#800F1D', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 1 }}>Тестті бастау</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <Info size={16} color="#A29792" />
          <Text style={{ color: '#756D70', fontSize: 12, flex: 1 }}>Бастау түймесін басу арқылы бағалау шарттарымен келісесіз.</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#DFD2C3', paddingTop: 24 }}>
          <View style={{ width: '47%', marginBottom: 16, backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', alignItems: 'center' }}>
            <Text style={{ color: '#A29792', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Сұрақтар</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#10131B' }}>{test.questions.length}</Text>
          </View>
          <View style={{ width: '47%', marginBottom: 16, backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', alignItems: 'center' }}>
            <Text style={{ color: '#A29792', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Өту ұпайы</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#10131B' }}>{test.passing_score}%</Text>
          </View>
          <View style={{ width: '47%', backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', alignItems: 'center' }}>
            <Text style={{ color: '#A29792', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Мүмкіндік</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#10131B' }}>1 / 1</Text>
          </View>
          <View style={{ width: '47%', backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', alignItems: 'center' }}>
            <Text style={{ color: '#A29792', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Формат</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#10131B', textAlign: 'center', marginTop: 4 }}>Бірнеше таңдау</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
