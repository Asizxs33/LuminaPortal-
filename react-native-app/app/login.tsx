import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { BookOpen, AlertCircle, ShieldCheck, Users, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Барлық өрістерді толтырыңыз');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Кіру сәтсіз болды');
      return;
    }
    // Navigate to correct dashboard based on role
    if (result.role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(student)/dashboard');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white md:bg-slate-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 flex-col md:flex-row"
        >
          {/* Left Side: Form */}
          <View className="flex-1 justify-center px-6 md:px-20 lg:px-32 xl:px-40 py-10">
            <View className="items-start mb-10 w-full max-w-[450px] self-center md:self-start">
              <View className="flex-row items-center gap-3">
                <View className="bg-indigo-600/10 p-3 rounded-2xl">
                  <BookOpen size={32} color="#4848e5" />
                </View>
                <Text className="text-2xl font-black text-slate-900 tracking-tight">LuminaPortal</Text>
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 mt-8 mb-2">
                Қайта қош келдіңіз
              </Text>
              <Text className="text-slate-500 text-base">
                Деректеріңізді енгізіп, платформаға кіріңіз
              </Text>
            </View>

            <View className="w-full max-w-[450px] self-center md:self-start bg-white md:bg-transparent rounded-3xl">
            {/* Tabs */}
            <View className="flex-row bg-slate-100 p-1.5 rounded-2xl mb-8">
              <TouchableOpacity
                onPress={() => { setActiveTab('student'); setError(''); }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl transition-all ${activeTab === 'student' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              >
                <Users size={18} color={activeTab === 'student' ? '#0f172a' : '#64748b'} />
                <Text style={{ fontWeight: '700', color: activeTab === 'student' ? '#0f172a' : '#64748b' }}>
                  Студент
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              >
                <ShieldCheck size={18} color={activeTab === 'admin' ? '#4848e5' : '#64748b'} />
                <Text style={{ fontWeight: '700', color: activeTab === 'admin' ? '#4848e5' : '#64748b' }}>
                  Әкімші
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error ? (
              <View style={{ backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <AlertCircle size={20} color="#dc2626" />
                <Text style={{ color: '#b91c1c', flex: 1, fontWeight: '500' }}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View className="gap-5">
              <View>
                <Text className="font-bold text-slate-700 mb-2">Электрондық пошта</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 text-slate-900 text-base"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="font-bold text-slate-700 mb-2">Құпиясөз</Text>
                <View className="flex-row items-center border border-slate-200 rounded-2xl bg-slate-50 focus-within:bg-white focus-within:border-indigo-500">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 px-4 py-4 text-slate-900 text-base outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
                    {showPassword
                      ? <EyeOff size={22} color="#94a3b8" />
                      : <Eye size={22} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/30`}
              >
                <Text className="text-white font-black text-lg">
                  {loading ? 'Кіру...' : 'Кіру'}
                </Text>
              </TouchableOpacity>

              {activeTab === 'student' && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                  <Text style={{ color: '#64748b' }}>Аккаунтыңыз жоқ па? </Text>
                  <Link href="/register">
                    <Text style={{ color: '#4848e5', fontWeight: '700' }}>Тіркелу</Text>
                  </Link>
                </View>
              )}
            </View>
          </View>
          </View>

          {/* Right Side: Decorative Desktop Graphic (Hidden on Mobile) */}
          <View className="hidden md:flex flex-1 relative overflow-hidden bg-indigo-900 rounded-l-[40px] shadow-2xl m-4 p-12 justify-center">
            {/* Background elements */}
            <View className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-3xl opacity-50" />
            <View className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl opacity-50" />
            
            <View className="z-10 bg-white/10 p-10 rounded-[32px] border border-white/20 backdrop-blur-xl shrink-0">
              <View className="flex-row gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Text key={i} className="text-yellow-400 text-2xl">★</Text>
                ))}
              </View>
              <Text className="text-white text-3xl font-bold leading-tight mb-8">
                "Дәстүрлі емтихандарды тексеруге кететін уақытымызды 80%-ға қысқарттық. LuminaPortal — бұл жай ғана құрал емес, оқу процесінің болашағы."
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="w-14 h-14 rounded-full bg-indigo-400 flex items-center justify-center">
                  <Text className="text-indigo-900 font-bold text-xl">АН</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">Азамат Нұрғалиев</Text>
                  <Text className="text-indigo-200">Оқу ісі жөніндегі проректор</Text>
                </View>
              </View>
            </View>
          </View>
          
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
