import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    {/* Dynamic Gradient Background replacing solid colors */}
    <View className="flex-1 bg-slate-50 relative overflow-hidden">
      {/* Soft decorative background orbs */}
      <View className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl opacity-60" />
      <View className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-3xl opacity-60" />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center items-center px-4 py-10"
        >
          {/* Glassmorphism Centered Card */}
          <View className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-indigo-900/5 border border-white">
            
            <View className="items-center mb-10 w-full">
              <View className="bg-white p-4 rounded-2xl shadow-sm mb-6 shadow-indigo-100/50">
                <BookOpen size={40} color="#4848e5" />
              </View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight text-center">
                Қайта қош келдіңіз
              </Text>
              <Text className="text-slate-500 text-base mt-2 text-center">
                Деректеріңізді енгізіп, LuminaPortal-ға кіріңіз
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-slate-100/80 p-1.5 rounded-2xl mb-8">
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
              <View style={{ backgroundColor: '#fef2f2', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <AlertCircle size={20} color="#dc2626" />
                <Text style={{ color: '#b91c1c', flex: 1, fontWeight: '500' }}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View className="gap-5">
              <View>
                <Text className="font-bold text-slate-700 mb-2 ml-1">Электрондық пошта</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  className="w-full px-5 py-4 border border-slate-200/60 rounded-2xl bg-white/50 focus:bg-white focus:border-indigo-400 focus:shadow-sm text-slate-900 text-base outline-none transition-all"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="font-bold text-slate-700 mb-2 ml-1">Құпиясөз</Text>
                <View className="flex-row items-center border border-slate-200/60 rounded-2xl bg-white/50 focus-within:bg-white focus-within:border-indigo-400 focus-within:shadow-sm transition-all overflow-hidden">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 px-5 py-4 text-slate-900 text-base outline-none bg-transparent"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-5 h-full justify-center">
                    {showPassword
                      ? <EyeOff size={22} color="#94a3b8" />
                      : <Eye size={22} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`w-full py-4 rounded-2xl flex-row justify-center items-center mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-600/20`}
              >
                <Text className="text-white font-black text-lg">
                  {loading ? 'Кіру...' : 'Кіру'}
                </Text>
              </TouchableOpacity>

              {activeTab === 'student' && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                  <Text style={{ color: '#64748b', fontSize: 15 }}>Аккаунтыңыз жоқ па? </Text>
                  <Link href="/register">
                    <Text style={{ color: '#4848e5', fontWeight: '800', fontSize: 15 }}>Тіркелу</Text>
                  </Link>
                </View>
              )}
            </View>
          </View>
          
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
