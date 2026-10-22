import { notify } from '../../lib/notify';
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
      notify.info('Бұл мүмкіндік кейінірек қосылады. Әзірге қолмен жасау (Редактор) бөлімін пайдаланыңыз.');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment-50">
      <ScrollView className="flex-1" contentContainerClassName="p-6 md:p-10">
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#756D70" />
          <Text className="text-parchment-500 font-bold">Артқа</Text>
        </TouchableOpacity>

        <View className="max-w-[800px] w-full mx-auto">
          <View className="mb-8">
            <Text className="font-display text-3xl font-bold text-parchment-900 tracking-tight">ЖИ Генераторы</Text>
            <Text className="text-parchment-500 mt-2">Жасанды интеллект сізге бірнеше секундта сұрақтар мен жауап нұсқаларын толық дайындап береді.</Text>
          </View>

          <View className="bg-white border border-parchment-200 p-7 md:p-10 rounded-xl  ">
            <Text className="font-bold text-parchment-700 mb-2 ml-1 text-[13px]">Тақырыпты енгізіңіз</Text>
            <TextInput
              value={aiTopic}
              onChangeText={setAiTopic}
              placeholder="Мысалы: Кванттық физиканың негіздері, Жасанды интеллект тарихы..."
              placeholderTextColor="#A29792"
              className="w-full px-5 py-4 border border-parchment-200/60 rounded-xl bg-white focus:bg-white focus:border-academic-400  text-parchment-900 text-base outline-none transition-all mb-6"
            />
            <TouchableOpacity
              onPress={handleAiGenerate}
              disabled={aiLoading || !aiTopic.trim()}
              className={`w-full py-4 rounded-xl flex-row justify-center items-center gap-2 ${!aiTopic.trim() ? 'bg-parchment-200' : 'bg-academic-600'}`}
            >
              <Sparkles size={18} color={!aiTopic.trim() ? '#A29792' : 'white'} />
              <Text className={`font-bold text-lg ${!aiTopic.trim() ? 'text-parchment-400' : 'text-white'}`}>
                {aiLoading ? 'Жасалуда...' : 'Сұрақтар жасау'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
