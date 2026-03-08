import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, ArrowLeft, XCircle, RotateCcw } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TestResult() {
  const { id, title, score: scoreStr, total: totalStr, passScore: passScoreStr } = useLocalSearchParams<{ id: string, title?: string, score: string, total: string, passScore: string }>();
  const router = useRouter();

  if (!scoreStr || !totalStr || !passScoreStr) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 16 }}>Нәтиже табылмады</Text>
        <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#4848e5', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Тақтаға оралу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const score = parseInt(scoreStr, 10) || 0;
  const total = parseInt(totalStr, 10) || 1;
  const passScorePercentage = parseInt(passScoreStr, 10) || 50;
  
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= passScorePercentage;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' }}>
          
          <View style={{ height: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: passed ? '#10b981' : '#ef4444' }}>
            {passed ? (
              <Award size={72} color="#ffffff" />
            ) : (
              <XCircle size={72} color="#ffffff" />
            )}
          </View>

          <View style={{ padding: 24, paddingTop: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>
              {passed ? 'Құттықтаймыз! 🎉' : 'Өкінішке орай...'}
            </Text>
            <Text style={{ fontSize: 15, color: '#475569', marginBottom: 32, textAlign: 'center', lineHeight: 22 }}>
              Сіз <Text style={{ fontWeight: '800', color: '#0f172a' }}>{title || 'тестті'}</Text> аяқтадыңыз. Нақты нәтижелер төменде көрсетілген:
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 32 }}>
              <View style={{ width: '31%', backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', uppercase: true, marginBottom: 4 }}>Ұпай</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: passed ? '#059669' : '#dc2626' }}>
                  {score} <Text style={{ fontSize: 12, color: '#94a3b8' }}>/ {total}</Text>
                </Text>
              </View>

              <View style={{ width: '31%', backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', uppercase: true, marginBottom: 4 }}>Пайыз</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: passed ? '#059669' : '#dc2626' }}>
                  {percentage}%
                </Text>
              </View>

              <View style={{ width: '31%', backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', uppercase: true, marginBottom: 4 }}>Өту шегі</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a' }}>
                  {passScorePercentage}%
                </Text>
              </View>
            </View>

            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: '#f1f5f9', borderRadius: 16 }}>
                <ArrowLeft size={20} color="#475569" />
                <Text style={{ fontWeight: '800', color: '#475569', fontSize: 15 }}>Тақтаға оралу</Text>
              </TouchableOpacity>
              
              {!passed && (
                <TouchableOpacity onPress={() => router.replace(`/test/${id}/start` as any)} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: '#4848e5', borderRadius: 16, shadowColor: '#4848e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}>
                  <RotateCcw size={20} color="#ffffff" />
                  <Text style={{ fontWeight: '800', color: 'white', fontSize: 15 }}>Қайта тапсыру</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={() => router.replace('/(student)/results')} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 16 }}>
                <Text style={{ fontWeight: '800', color: '#334155', fontSize: 15 }}>Барлық нәтижелер</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
