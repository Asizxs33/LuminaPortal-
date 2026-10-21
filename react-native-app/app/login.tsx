import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      setError('Email мен құпиясөзді енгізіңіз.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Жүйеге кіру мүмкін болмады.');
      return;
    }
    router.replace(result.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard');
  };

  return (
    <AuthScaffold title="Қайта қош келдіңіз" subtitle="Аккаунтыңызға кіріп, оқу бағытыңызды жалғастырыңыз.">
      {error ? (
        <View accessibilityRole="alert" style={{ backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#F3BEC5', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
          <AlertCircle size={19} color="#C73D4D" />
          <Text style={{ color: '#9E2F3C', flex: 1, fontWeight: '700', lineHeight: 20 }}>{error}</Text>
        </View>
      ) : null}
      <View style={{ gap: 18 }}>
        <View>
          <Text style={{ color: '#34415A', fontWeight: '800', marginBottom: 8 }}>Электрондық пошта</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D9E0EC', borderRadius: 12, paddingHorizontal: 15 }}>
            <Mail size={19} color="#7A869B" />
            <TextInput accessibilityLabel="Электрондық пошта" value={email} onChangeText={(value) => { setEmail(value); if (error) setError(''); }} placeholder="name@example.com" placeholderTextColor="#9AA5B5" autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" style={{ flex: 1, minHeight: 52, paddingHorizontal: 12, color: '#16213E', fontSize: 16, outlineStyle: 'none' } as any} />
          </View>
        </View>
        <View>
          <Text style={{ color: '#34415A', fontWeight: '800', marginBottom: 8 }}>Құпиясөз</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D9E0EC', borderRadius: 12, paddingHorizontal: 15 }}>
            <LockKeyhole size={19} color="#7A869B" />
            <TextInput accessibilityLabel="Құпиясөз" value={password} onChangeText={(value) => { setPassword(value); if (error) setError(''); }} placeholder="Құпиясөзді енгізіңіз" placeholderTextColor="#9AA5B5" secureTextEntry={!showPassword} autoComplete="current-password" returnKeyType="done" onSubmitEditing={handleLogin} style={{ flex: 1, minHeight: 52, paddingHorizontal: 12, color: '#16213E', fontSize: 16, outlineStyle: 'none' } as any} />
            <TouchableOpacity accessibilityLabel={showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'} onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              {showPassword ? <EyeOff size={20} color="#69758B" /> : <Eye size={20} color="#69758B" />}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ color: '#69758B', fontSize: 13, lineHeight: 19 }}>Студент немесе әкімші рөлі аккаунт бойынша автоматты анықталады.</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Жүйеге кіру" onPress={handleLogin} disabled={loading} style={{ minHeight: 54, borderRadius: 12, backgroundColor: loading ? '#8CA4FA' : '#315CF5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
          {loading ? <ActivityIndicator color="white" /> : <><Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Жүйеге кіру</Text><ArrowRight size={19} color="white" /></>}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <Text style={{ color: '#69758B', fontSize: 15 }}>Аккаунтыңыз жоқ па? </Text>
          <Link href="/register" style={{ color: '#315CF5', fontWeight: '900', fontSize: 15 }}>Тіркелу</Link>
        </View>
      </View>
    </AuthScaffold>
  );
}
