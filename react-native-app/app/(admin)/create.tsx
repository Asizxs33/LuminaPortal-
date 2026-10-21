import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ArrowLeft, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../../context/AuthContext';
import { API } from '../constants/api';

export default function CreateTest() {
  const router = useRouter();
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newPassing, setNewPassing] = useState('70');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [wordFile, setWordFile] = useState<any>(null);
  const wordInputRef = useRef<any>(null);

  const createTest = async () => {
    if (!newTitle.trim() || !newSubject.trim()) {
      Alert.alert('Қате', 'Атауы мен Пәнді толтырыңыз');
      return;
    }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          description: '',
          duration_minutes: parseInt(newDuration) || 30,
          passing_score: parseInt(newPassing) || 70,
          is_published: false
        })
      });
      
      if (!res.ok) throw new Error('Create failed');
      const data = await res.json();
      
      router.push(`/test/${data.id}/edit` as any);
      
    } catch {
      Alert.alert('Қате', 'Тест жүктелмеді');
    } finally {
      setCreating(false);
    }
  };

  const importWordTest = async () => {
    if (!newTitle.trim() || !newSubject.trim()) {
      Alert.alert('Қате', 'Атауы мен Пәнді толтырыңыз');
      return;
    }
    if (!wordFile) {
      Alert.alert('Қате', 'Word (.docx) файлын таңдаңыз');
      return;
    }
    if (!/\.docx$/i.test(wordFile.name || '')) {
      Alert.alert('Қате', 'Тек .docx Word файлын жүктеуге болады');
      return;
    }

    setImporting(true);
    try {
      const token = await getToken();
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('File read failed'));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(wordFile);
      });
      const res = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64,
          fileName: wordFile.name,
          title: newTitle,
          subject: newSubject,
          duration_minutes: parseInt(newDuration) || 30,
          passing_score: parseInt(newPassing) || 70,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      Alert.alert('Дайын', `${data.imported_questions} сұрақ Word файлынан қосылды.`);
      router.push(`/test/${data.id}/edit` as any);
    } catch (error: any) {
      Alert.alert('Импорт қатесі', error.message || 'Word файлын оқу мүмкін болмады');
    } finally {
      setImporting(false);
    }
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
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Жаңа Тест</Text>
            <Text className="text-slate-500 mt-2">Базадан нөлден бастап жаңа сұрақтар мен материалдар дайындаңыз.</Text>
          </View>

          <View className="bg-white/80 backdrop-blur-xl border border-white p-7 md:p-10 rounded-[32px] shadow-2xl shadow-indigo-900/5 gap-6">
            <View>
              <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Тест атауы *</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Мысалы: Жоғары математика"
                placeholderTextColor="#94a3b8"
                className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
              />
            </View>
            <View>
              <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Пән *</Text>
              <TextInput
                value={newSubject}
                onChangeText={setNewSubject}
                placeholder="Мысалы: Математика"
                placeholderTextColor="#94a3b8"
                className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Уақыт (мин)</Text>
                <TextInput
                  value={newDuration}
                  onChangeText={setNewDuration}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#94a3b8"
                  className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-700 mb-2 ml-1 text-[13px]">Өту баллы (%)</Text>
                <TextInput
                  value={newPassing}
                  onChangeText={setNewPassing}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor="#94a3b8"
                  className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                />
              </View>
            </View>

            {Platform.OS === 'web' && (
              <View className="mt-2 gap-3">
                <Text className="font-bold text-slate-700 ml-1 text-[13px]">Word файлынан импорттау</Text>
                <TouchableOpacity
                  onPress={() => wordInputRef.current?.click()}
                  className="w-full py-4 rounded-2xl flex-row justify-center items-center border border-indigo-200 bg-indigo-50"
                >
                  <Upload size={20} color="#4f46e5" />
                  <Text className="text-indigo-700 font-black text-base ml-2">
                    {wordFile ? wordFile.name : 'Word (.docx) файлын таңдау'}
                  </Text>
                </TouchableOpacity>
                {/* @ts-ignore Web-only input */}
                <input
                  ref={wordInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={(event: any) => setWordFile(event.target.files?.[0] || null)}
                />
                <Text className="text-slate-500 text-xs leading-5">
                  Формат: 1. Сұрақ; A) жауап ... D) жауап. Дұрыс жауапты *, +, ✓ белгісімен не «Жауап: A» жолымен белгілеңіз.
                </Text>
                <TouchableOpacity
                  onPress={importWordTest}
                  disabled={importing || !wordFile}
                  className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${importing || !wordFile ? 'bg-emerald-300' : 'bg-emerald-600'} shadow-lg shadow-emerald-600/20`}
                >
                  <Text className="text-white font-black text-lg">{importing ? 'Импортталуда...' : 'Word файлынан тест жасау'}</Text>
                  {!importing && <Upload size={20} color="white" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={createTest}
              disabled={creating || importing}
              className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-4 ${creating || importing ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/20`}
            >
              <Text className="text-white font-black text-lg">{creating ? 'Жасалуда...' : 'Тестті қолмен жасау'}</Text>
              {!creating && <Plus size={20} color="white" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
