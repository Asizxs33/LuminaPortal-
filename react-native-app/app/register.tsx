import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
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
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white md:bg-slate-50">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 flex-col md:flex-row">
          
          {/* Left Side: Form */}
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="flex-1 px-6 md:px-16 lg:px-24 xl:px-40 py-10">
            
            <View className="items-start mb-8 w-full max-w-[450px] self-center md:self-start">
              <View className="flex-row items-center gap-3 mb-6">
                <View className="bg-indigo-600/10 p-3 rounded-2xl">
                  <BookOpen size={32} color="#4848e5" />
                </View>
                <Text className="text-2xl font-black text-slate-900 tracking-tight">LuminaPortal</Text>
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 mt-2">Тіркелу</Text>
              <Text className="text-slate-500 mt-2">LuminaPortal студент порталына қош келдіңіз</Text>
            </View>

            <View className="w-full max-w-[450px] self-center md:self-start bg-white md:bg-transparent rounded-3xl">
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
                    <Text className="font-bold text-slate-700 mb-2">Аты-жөні</Text>
                    <TextInput
                      value={form.name}
                      onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                      className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 text-slate-900 text-base outline-none"
                      placeholder="Айгерім Бекова"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2">Электрондық пошта</Text>
                    <TextInput
                      value={form.email}
                      onChangeText={(text) => setForm(f => ({ ...f, email: text }))}
                      className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 text-slate-900 text-base outline-none"
                      placeholder="name@lumina.edu"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2">Құпиясөз</Text>
                    <TextInput
                      value={form.password}
                      onChangeText={(text) => setForm(f => ({ ...f, password: text }))}
                      className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 text-slate-900 text-base outline-none"
                      placeholder="Кемінде 6 таңба"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <View>
                    <Text className="font-bold text-slate-700 mb-2">Құпиясөзді растаңыз</Text>
                    <TextInput
                      value={form.confirm}
                      onChangeText={(text) => setForm(f => ({ ...f, confirm: text }))}
                      className={`w-full px-4 py-4 border rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 text-slate-900 text-base outline-none ${
                        form.confirm && form.confirm !== form.password ? 'border-red-400' : 'border-slate-200'
                      }`}
                      placeholder="Қайта енгізіңіз"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/30`}
                  >
                    <Text className="text-white font-black text-lg">{loading ? 'Тіркелуде...' : 'Тіркелу'}</Text>
                  </TouchableOpacity>

                  <View className="flex-row justify-center mt-2">
                    <Text className="text-slate-600 font-medium">Аккаунтыңыз бар ма? </Text>
                    <Link href="/login" asChild>
                      <TouchableOpacity>
                        <Text className="text-[#4848e5] font-bold">Жүйеге кіру</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Right Side: Decorative Desktop Graphic (Hidden on Mobile) */}
          <View className="hidden md:flex flex-1 relative overflow-hidden bg-indigo-900 rounded-l-[40px] shadow-2xl m-4 p-12 justify-center">
            {/* Background elements */}
            <View className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl opacity-50" />
            <View className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-500/30 blur-3xl opacity-50" />
            
            <View className="z-10 bg-white/10 p-10 rounded-[32px] border border-white/20 backdrop-blur-xl shrink-0">
              <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-8">
                <ShieldCheck size={32} color="white" />
              </View>
              <Text className="text-white text-4xl font-black leading-tight mb-6">
                Бүгін қосылыңыз, қадам басыңыз.
              </Text>
              <Text className="text-indigo-100 text-lg leading-relaxed mb-8 pr-10">
                LuminaPortal сіздің барлық емтихан және бағалау қажеттіліктеріңізге арналған заманауи кеңістік. Нақты уақыттағы аналитика мен ЖИ арқылы генерацияланатын тесттер біздің платформаның негізі болып табылады.
              </Text>
              
              <View className="flex-row items-center gap-4 border-t border-white/10 pt-8 mt-4">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Text key={i} className="text-yellow-400 text-lg">★</Text>
                  ))}
                </View>
                <Text className="text-white font-medium text-sm">10,000+ оқушы таңдаған</Text>
              </View>
            </View>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
