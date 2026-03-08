import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle2, Clock, Search, BarChart3, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

interface Result {
  id: number;
  user_id: number;
  test_id: string;
  score: number;
  total: number;
  passed: boolean;
  completed_at: string;
  student_name: string;
  test_title: string;
}

export default function ResultsDashboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error('Results fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter(r =>
    (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.test_title || '').toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length)
    : 0;
  const passCount = results.filter(r => r.passed).length;
  const passRate = results.length ? Math.round((passCount / results.length) * 100) : 0;

  const getScoreColor = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 75) return { bg: '#dcfce7', text: '#15803d' };
    if (pct >= 50) return { bg: '#fef9c3', text: '#a16207' };
    return { bg: '#fee2e2', text: '#dc2626' };
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['#4848e5', '#7c3aed', '#059669', '#d97706', '#dc2626'];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4848e5" />
        <Text style={{ marginTop: 12, color: '#64748b', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Аналитика</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>Нақты нәтижелер мен статистика</Text>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flex: 1, minWidth: '45%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ padding: 8, backgroundColor: '#ede9fe', borderRadius: 10 }}>
                <BarChart3 size={20} color="#7c3aed" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <ArrowUpRight size={10} color="#15803d" />
                <Text style={{ color: '#15803d', fontSize: 10, fontWeight: '700', marginLeft: 2 }}>+4.2%</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 }}>ОРТАША ҰПАЙ</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a' }}>{avgScore}%</Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flex: 1, minWidth: '45%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 10 }}>
                <CheckCircle2 size={20} color="#15803d" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <ArrowUpRight size={10} color="#15803d" />
                <Text style={{ color: '#15803d', fontSize: 10, fontWeight: '700', marginLeft: 2 }}>өту %</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 }}>ӨТТІ/ӨТПЕДІ</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a' }}>{passRate}%</Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flex: 1, minWidth: '45%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 10 }}>
                <Users size={20} color="#2563eb" />
              </View>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 }}>ТАПСЫРУЛАР</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a' }}>{results.length}</Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flex: 1, minWidth: '45%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ padding: 8, backgroundColor: '#fef9c3', borderRadius: 10 }}>
                <FileText size={20} color="#a16207" />
              </View>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 }}>ӨТТІ</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a' }}>{passCount}</Text>
          </View>
        </View>

        {/* Results List */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 }}>Соңғы тапсырулар</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12 }}>
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Студент немесе тест бойынша іздеу..."
                placeholderTextColor="#94a3b8"
                style={{ flex: 1, marginLeft: 8, paddingVertical: 10, color: '#0f172a', fontSize: 14 }}
              />
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <BarChart3 size={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '600' }}>Нәтиже табылмады</Text>
            </View>
          ) : (
            filtered.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100);
              const colors = getScoreColor(r.score, r.total);
              const avatarColor = avatarColors[r.user_id % avatarColors.length];
              return (
                <View
                  key={r.id}
                  style={{
                    padding: 14, flexDirection: 'row', alignItems: 'center',
                    borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#f1f5f9'
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: avatarColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
                      {getInitials(r.student_name || '?')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14 }} numberOfLines={1}>{r.student_name || 'Белгісіз'}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{r.test_title || r.test_id}</Text>
                  </View>
                  <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>{pct}%</Text>
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
