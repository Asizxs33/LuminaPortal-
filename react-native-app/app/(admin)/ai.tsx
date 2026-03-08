import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AiGenerator() {
  const router = useRouter();
  
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiGenerate = () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiTopic('');
      Alert.alert('ЖИ Генераторы', 'Бұл мүмкіндік кейінірек қосылады. Әзірге қолмен жасау (Редактор) бөлімін пайдаланыңыз.');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-6 md:p-10">
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#64748b" />
          <Text className="text-slate-500 font-bold">Артқа</Text>
        </TouchableOpacity>

        <View className="max-w-[800px] w-full mx-auto">
          <View className="mb-8">
            <Text className="text-3xl font-black text-slate-900 tracking-tight">ЖИ Генераторы</Text>
            <Text className="text-slate-500 mt-2">Жасанды интеллект сізге бірнеше секундта сұрақтар мен жауап нұсқаларын толық дайындап береді.</Text>
          </View>

          <View className="bg-white/80 backdrop-blur-xl border border-white p-7 md:p-10 rounded-[32px] shadow-2xl shadow-indigo-900/5">
            <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Тақырыпты енгізіңіз</Text>
            <TextInput
              value={aiTopic}
              onChangeText={setAiTopic}
              placeholder="Мысалы: Кванттық физиканың негіздері, Жасанды интеллект тарихы..."
              placeholderTextColor="#94a3b8"
              className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-purple-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all mb-6"
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
