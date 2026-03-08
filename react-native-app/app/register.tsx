import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { API as LOCAL_API } from '../constants/api';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Барлық өрістерді толтырыңыз');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Құпиясөздер сәйкес келмейді');
      return;
    }
    if (form.password.length < 6) {
      setError('Құпиясөз кемінде 6 символдан тұруы керек');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${LOCAL_API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'student',
          group_name: null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error === 'Email already exists' ? 'Бұл email бұрыннан тіркелген' : data.error || 'Тіркелу сәтсіз болды');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(async () => {
        await login(form.email, form.password);
      }, 1200);
    } catch {
      setError('Желі қатесі. Сервер іске қосылған ба?');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <View className="items-center mb-8">
            <BookOpen size={56} color="#4848e5" className="mb-4" />
            <Text className="text-3xl font-extrabold text-slate-900 mt-2">Тіркелу</Text>
            <Text className="text-slate-600 mt-1">LuminaPortal студент порталына қош келдіңіз</Text>
          </View>

          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            {success ? (
              <View className="items-center py-8 gap-4">
                <View className="h-20 w-20 rounded-full bg-emerald-100 items-center justify-center">
                  <CheckCircle size={40} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-slate-900 mt-4">Тіркелу сәтті!</Text>
                <Text className="text-slate-500">Жүйеге кіру...</Text>
              </View>
            ) : (
              <View className="gap-4">
                {error ? (
                  <View className="bg-red-50 p-4 rounded-xl flex-row items-center gap-3">
                    <AlertCircle size={20} color="#dc2626" />
                    <Text className="text-red-700 flex-1 font-medium">{error}</Text>
                  </View>
                ) : null}

                <View>
                  <Text className="font-bold text-slate-700 mb-1">Аты-жөні</Text>
                  <TextInput
                    value={form.name}
                    onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                    className="w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-base"
                    placeholder="Айгерім Бекова"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View>
                  <Text className="font-bold text-slate-700 mb-1">Электрондық пошта</Text>
                  <TextInput
                    value={form.email}
                    onChangeText={(text) => setForm(f => ({ ...f, email: text }))}
                    className="w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-base"
                    placeholder="name@lumina.edu"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="font-bold text-slate-700 mb-1">Құпиясөз</Text>
                  <TextInput
                    value={form.password}
                    onChangeText={(text) => setForm(f => ({ ...f, password: text }))}
                    className="w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-base"
                    placeholder="Кемінде 6 таңба"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </View>

                <View>
                  <Text className="font-bold text-slate-700 mb-1">Құпиясөзді растаңыз</Text>
                  <TextInput
                    value={form.confirm}
                    onChangeText={(text) => setForm(f => ({ ...f, confirm: text }))}
                    className={`w-full px-4 py-4 border rounded-xl bg-slate-50 text-slate-900 text-base ${
                      form.confirm && form.confirm !== form.password ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Қайта енгізіңіз"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl flex-row justify-center items-center mt-4 ${loading ? 'bg-[#4848e5]/60' : 'bg-[#4848e5]'} shadow-sm shadow-[#4848e5]/30`}
                >
                  <Text className="text-white font-bold text-lg">{loading ? 'Тіркелуде...' : 'Тіркелу'}</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-2">
                  <Text className="text-slate-600 font-medium">Аккаунтыңыз бар ма? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text className="text-[#4848e5] font-bold">Жүйеге кіру</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
