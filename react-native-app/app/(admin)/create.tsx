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
            <Text className="font-display text-3xl font-bold text-parchment-900 tracking-tight">Жаңа Тест</Text>
            <Text className="text-parchment-500 mt-2">Базадан нөлден бастап жаңа сұрақтар мен материалдар дайындаңыз.</Text>
          </View>

          <View className="bg-white border border-parchment-200 p-7 md:p-10 rounded-xl   gap-6">
            <View>
              <Text className="font-bold text-parchment-700 mb-2 ml-1 text-[13px]">Тест атауы *</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Мысалы: Жоғары математика"
                placeholderTextColor="#A29792"
                className="w-full px-5 py-4 border border-parchment-200/60 rounded-xl bg-white focus:bg-white focus:border-academic-400  text-parchment-900 text-base outline-none transition-all"
              />
            </View>
            <View>
              <Text className="font-bold text-parchment-700 mb-2 ml-1 text-[13px]">Пән *</Text>
              <TextInput
                value={newSubject}
                onChangeText={setNewSubject}
                placeholder="Мысалы: Математика"
                placeholderTextColor="#A29792"
                className="w-full px-5 py-4 border border-parchment-200/60 rounded-xl bg-white focus:bg-white focus:border-academic-400  text-parchment-900 text-base outline-none transition-all"
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="font-bold text-parchment-700 mb-2 ml-1 text-[13px]">Уақыт (мин)</Text>
                <TextInput
                  value={newDuration}
                  onChangeText={setNewDuration}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#A29792"
                  className="w-full px-5 py-4 border border-parchment-200/60 rounded-xl bg-white focus:bg-white focus:border-academic-400  text-parchment-900 text-base outline-none transition-all"
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-parchment-700 mb-2 ml-1 text-[13px]">Өту баллы (%)</Text>
                <TextInput
                  value={newPassing}
                  onChangeText={setNewPassing}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor="#A29792"
                  className="w-full px-5 py-4 border border-parchment-200/60 rounded-xl bg-white focus:bg-white focus:border-academic-400  text-parchment-900 text-base outline-none transition-all"
                />
              </View>
            </View>

            {Platform.OS === 'web' && (
              <View className="mt-2 gap-3">
                <Text className="font-bold text-parchment-700 ml-1 text-[13px]">Word файлынан импорттау</Text>
                <TouchableOpacity
                  onPress={() => wordInputRef.current?.click()}
                  className="w-full py-4 rounded-xl flex-row justify-center items-center border border-academic-200 bg-academic-50"
                >
                  <Upload size={20} color="#800F1D" />
                  <Text className="text-academic-700 font-bold text-base ml-2">
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
                <Text className="text-parchment-500 text-xs leading-5">
                  Формат: 1. Сұрақ; A) жауап ... D) жауап. Дұрыс жауапты *, +, ✓ белгісімен не «Жауап: A» жолымен белгілеңіз.
                </Text>
                <TouchableOpacity
                  onPress={importWordTest}
                  disabled={importing || !wordFile}
                  className={`w-full py-4 rounded-xl flex-row justify-center items-center ${importing || !wordFile ? 'bg-emerald-300' : 'bg-emerald-600'}  `}
                >
                  <Text className="text-white font-bold text-lg">{importing ? 'Импортталуда...' : 'Word файлынан тест жасау'}</Text>
                  {!importing && <Upload size={20} color="white" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={createTest}
              disabled={creating || importing}
              className={`w-full py-4 rounded-xl flex-row justify-center items-center mt-4 ${creating || importing ? 'bg-academic-400' : 'bg-academic-600'}  `}
            >
              <Text className="text-white font-bold text-lg">{creating ? 'Жасалуда...' : 'Тестті қолмен жасау'}</Text>
              {!creating && <Plus size={20} color="white" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
