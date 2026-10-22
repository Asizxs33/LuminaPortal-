import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';
import { API } from './constants/api';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (key: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [key]: value })); if (error) setError(''); };

  const handleSubmit = async () => {
    if (loading) return;
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) return setError('Барлық өрісті толтырыңыз.');
    if (form.password !== form.confirm) return setError('Құпиясөздер сәйкес келмейді.');
    if (form.password.length < 8) return setError('Құпиясөз кемінде 8 таңбадан тұруы керек.');
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const res = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), email, password: form.password, role: 'student', group_name: null }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error === 'Email already exists' ? 'Бұл email бұрын тіркелген.' : data.error || 'Тіркелу мүмкін болмады.'); return; }
      setSuccess(true);
      const result = await login(email, form.password);
      router.replace(result.success ? '/(student)/dashboard' : '/login');
    } catch {
      setError('Сервермен байланыс орнатылмады. Кейінірек қайталап көріңіз.');
    } finally { setLoading(false); }
  };

  if (success) return <AuthScaffold title="Аккаунт дайын" subtitle="Жеке кабинетіңіз ашылып жатыр."><View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#DFD2C3', borderRadius: 16, padding: 28, alignItems: 'center' }}><View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: '#DDF6EA', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={32} color="#16845B" /></View><Text style={{ color: '#271C20', fontSize: 20, fontWeight: '700', marginTop: 18 }}>Тіркелу сәтті аяқталды</Text><Text style={{ color: '#756D70', textAlign: 'center', marginTop: 8 }}>Сізді студент кабинетіне бағыттаймыз.</Text></View></AuthScaffold>;

  const fields = [
    { key: 'name' as const, label: 'Аты-жөні', placeholder: 'Аты-жөніңізді енгізіңіз', icon: UserRound, secure: false },
    { key: 'email' as const, label: 'Электрондық пошта', placeholder: 'name@example.com', icon: Mail, secure: false },
    { key: 'password' as const, label: 'Құпиясөз', placeholder: 'Кемінде 8 таңба', icon: LockKeyhole, secure: true },
    { key: 'confirm' as const, label: 'Құпиясөзді қайталаңыз', placeholder: 'Қайта енгізіңіз', icon: LockKeyhole, secure: true },
  ];

  return (
    <AuthScaffold title="Студент аккаунтын ашу" subtitle="Тіркелгеннен кейін тесттер мен нәтижелер бір кабинетте сақталады.">
      {error ? <View accessibilityRole="alert" style={{ backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#F3BEC5', padding: 14, borderRadius: 12, flexDirection: 'row', gap: 10, marginBottom: 20 }}><AlertCircle size={19} color="#C73D4D" /><Text style={{ color: '#9E2F3C', flex: 1, fontWeight: '700' }}>{error}</Text></View> : null}
      <View style={{ gap: 16 }}>
        {fields.map(({ key, label, placeholder, icon: Icon, secure }) => <View key={key}><Text style={{ color: '#46393D', fontWeight: '600', marginBottom: 8 }}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: key === 'confirm' && form.confirm && form.confirm !== form.password ? '#C73D4D' : '#DFD2C3', borderRadius: 12, paddingHorizontal: 15 }}><Icon size={19} color="#7A869B" /><TextInput accessibilityLabel={label} value={form[key]} onChangeText={(value) => update(key, value)} placeholder={placeholder} placeholderTextColor="#9AA5B5" secureTextEntry={secure} autoCapitalize={key === 'email' ? 'none' : 'sentences'} keyboardType={key === 'email' ? 'email-address' : 'default'} autoComplete={key === 'email' ? 'email' : key === 'name' ? 'name' : key === 'password' ? 'new-password' : 'off'} onSubmitEditing={key === 'confirm' ? handleSubmit : undefined} style={{ flex: 1, minHeight: 50, paddingHorizontal: 12, color: '#271C20', fontSize: 16, outlineStyle: 'none' } as any} /></View></View>)}
        <Text style={{ color: '#756D70', fontSize: 12, lineHeight: 18 }}>Тіркелу арқылы студент рөлі беріледі. Әкімші рөлін жүйе иесі тағайындайды.</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ minHeight: 54, borderRadius: 12, backgroundColor: loading ? '#BE8B92' : '#800F1D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 2 }}>{loading ? <ActivityIndicator color="white" /> : <><Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Аккаунт ашу</Text><ArrowRight size={19} color="white" /></>}</TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}><Text style={{ color: '#756D70', fontSize: 15 }}>Аккаунтыңыз бар ма? </Text><Link href="/login" style={{ color: '#800F1D', fontWeight: '700', fontSize: 15 }}>Жүйеге кіру</Link></View>
      </View>
    </AuthScaffold>
  );
}
