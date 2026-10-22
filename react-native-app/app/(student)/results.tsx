import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, CheckCircle2, Target, Award, BookOpen, Clock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

interface Result {
  id: number;
  test_id: string;
  score: number;
  total: number;
  completed_at: string;
  test_title: string;
  subject: string;
  percentage: number;
  passing_score: number;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchResults();
    else setLoading(false);
  }, [user]);

  const fetchResults = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/results/user/${user!.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setResults(await res.json());
    } catch (e) {
      console.error('Results fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Ensure results is an array in case the API returns an error object
  const validResults = Array.isArray(results) ? results : [];

  const avgScore = validResults.length
    ? Math.round(validResults.reduce((a, r) => a + (r.percentage ?? Math.round(r.score / r.total * 100)), 0) / validResults.length)
    : 0;
  const passCount = validResults.filter(r => {
    const pct = r.percentage ?? Math.round(r.score / r.total * 100);
    return pct >= (r.passing_score || 50);
  }).length;

  const getScoreStyle = (pct: number) => {
    if (pct >= 75) return { color: '#15803d', bg: '#dcfce7' };
    if (pct >= 50) return { color: '#a16207', bg: '#fef9c3' };
    return { color: '#dc2626', bg: '#fee2e2' };
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: displayFont, fontSize: 24, fontWeight: '800', color: '#10131B' }}>Нәтижелерім</Text>
          <Text style={{ color: '#756D70', marginTop: 4, fontSize: 13 }}>Академиялық жетістіктеріңіз</Text>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Trophy size={22} color="#15803d" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{avgScore}%</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2, textAlign: 'center' }}>Орташа ұпай</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <CheckCircle2 size={22} color="#800F1D" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{validResults.length}</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2, textAlign: 'center' }}>Аяқталған</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Target size={22} color="#800F1D" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#10131B' }}>{passCount}</Text>
            <Text style={{ fontSize: 11, color: '#756D70', marginTop: 2, textAlign: 'center' }}>Өтті</Text>
          </View>
        </View>

        {/* Results List */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3EDE4', overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#FCFAF6' }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#10131B' }}>Соңғы нәтижелер</Text>
          </View>

          {validResults.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Trophy size={40} color="#DFD2C3" />
              <Text style={{ color: '#A29792', marginTop: 12, fontWeight: '700', fontSize: 15 }}>Нәтиже жоқ</Text>
              <Text style={{ color: '#DFD2C3', marginTop: 6, fontSize: 13, textAlign: 'center' }}>
                Тестті тапсырғаннан кейін нәтижелеріңіз осы жерде шығады
              </Text>
            </View>
          ) : (
            validResults.map((r, i) => {
              const pct = r.percentage ?? Math.round(r.score / r.total * 100);
              const isPassed = pct >= (r.passing_score || 50);
              const s = getScoreStyle(pct);
              return (
                <View key={r.id} style={{
                  padding: 16, flexDirection: 'row', alignItems: 'center',
                  borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#FCFAF6'
                }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#F4E6E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Award size={20} color="#800F1D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: '#10131B', fontSize: 14 }} numberOfLines={1}>{r.test_title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <Clock size={11} color="#A29792" />
                      <Text style={{ color: '#A29792', fontSize: 11 }}>{formatDate(r.completed_at)}</Text>
                      <Text style={{ color: '#A29792', fontSize: 11 }}>· {r.score}/{r.total} ұпай</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: s.color, fontWeight: '700', fontSize: 15 }}>{pct}%</Text>
                    <Text style={{ color: s.color, fontSize: 10, fontWeight: '700' }}>{isPassed ? 'ӨТТІ' : 'ӨТПЕДІ'}</Text>
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
