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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        >
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <BookOpen size={64} color="#4848e5" />
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#0f172a', marginTop: 16 }}>
              Жүйеге кіру
            </Text>
            <Text style={{ color: '#64748b', marginTop: 8 }}>
              LuminaPortal платформасына қош келдіңіз
            </Text>
          </View>

          <View style={{ width: '100%', maxWidth: 450, alignSelf: 'center', backgroundColor: 'white', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
            {/* Tabs */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => { setActiveTab('student'); setError(''); }}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, paddingVertical: 12, borderRadius: 10,
                  backgroundColor: activeTab === 'student' ? 'white' : 'transparent'
                }}
              >
                <Users size={18} color={activeTab === 'student' ? '#0f172a' : '#64748b'} />
                <Text style={{ fontWeight: '700', color: activeTab === 'student' ? '#0f172a' : '#64748b' }}>
                  Студент
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setActiveTab('admin'); setError(''); }}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, paddingVertical: 12, borderRadius: 10,
                  backgroundColor: activeTab === 'admin' ? 'white' : 'transparent'
                }}
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
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8 }}>Электрондық пошта</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={{ paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 16 }}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text style={{ fontWeight: '700', color: '#334155', marginBottom: 8 }}>Құпиясөз</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc' }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: '#0f172a', fontSize: 16 }}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 14 }}>
                    {showPassword
                      ? <EyeOff size={20} color="#94a3b8" />
                      : <Eye size={20} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                  backgroundColor: loading ? '#8080f0' : '#4848e5', marginTop: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
