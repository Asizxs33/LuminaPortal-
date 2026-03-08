import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { API as LOCAL_API } from './constants/api';

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
    <View className="flex-1 bg-slate-50 relative overflow-hidden">
      {/* Soft decorative background orbs */}
      <View className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl opacity-60" />
      <View className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-3xl opacity-60" />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }} className="flex-1 items-center py-10">
            
            {/* Glassmorphism Centered Card */}
            <View className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-indigo-900/5 border border-white">
              
              <View className="items-center mb-10 w-full">
                <View className="bg-white p-4 rounded-2xl shadow-sm mb-6 shadow-indigo-100/50">
                  <BookOpen size={40} color="#4848e5" />
                </View>
                <Text className="text-3xl font-black text-slate-900 tracking-tight text-center">
                  Тіркелу
                </Text>
                <Text className="text-slate-500 text-base mt-2 text-center">
                  LuminaPortal студент порталына қош келдіңіз
                </Text>
              </View>

              {success ? (
                <View className="items-center py-8 gap-4">
                  <View className="h-20 w-20 rounded-full bg-emerald-100 items-center justify-center">
                    <CheckCircle size={40} color="#10b981" />
                  </View>
                  <Text className="text-xl font-bold text-slate-900 mt-4">Тіркелу сәтті!</Text>
                  <Text className="text-slate-500">Жүйеге кіру...</Text>
                </View>
              ) : (
                <View className="gap-5">
                  {error ? (
                    <View className="bg-red-50 p-4 rounded-2xl flex-row items-center gap-3">
                      <AlertCircle size={20} color="#dc2626" />
                      <Text className="text-red-700 flex-1 font-medium">{error}</Text>
                    </View>
                  ) : null}

                  <View>
                    <Text className="font-bold text-slate-700 mb-2 ml-1">Аты-жөні</Text>
                    <TextInput
                      value={form.name}
                      onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                      className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                      placeholder="Айгерім Бекова"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2 ml-1">Электрондық пошта</Text>
                    <TextInput
                      value={form.email}
                      onChangeText={(text) => setForm(f => ({ ...f, email: text }))}
                      className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                      placeholder="name@lumina.edu"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2 ml-1">Құпиясөз</Text>
                    <TextInput
                      value={form.password}
                      onChangeText={(text) => setForm(f => ({ ...f, password: text }))}
                      className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                      placeholder="Кемінде 6 таңба"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2 ml-1">Құпиясөзді растаңыз</Text>
                    <TextInput
                      value={form.confirm}
                      onChangeText={(text) => setForm(f => ({ ...f, confirm: text }))}
                      className={`w-full px-5 py-4 border rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all ${
                        form.confirm && form.confirm !== form.password ? 'border-red-400' : 'border-slate-200/60'
                      }`}
                      placeholder="Қайта енгізіңіз"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/20`}
                  >
                    <Text className="text-white font-black text-lg">{loading ? 'Тіркелуде...' : 'Тіркелу'}</Text>
                  </TouchableOpacity>

                  <View className="flex-row justify-center mt-2">
                    <Text style={{ color: '#64748b', fontSize: 15 }}>Аккаунтыңыз бар ма? </Text>
                    <Link href="/login" asChild>
                      <TouchableOpacity>
                        <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 15 }}>Жүйеге кіру</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
