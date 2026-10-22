import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import AuthScaffold from './AuthScaffold';
import { API } from '../app/constants/api';

export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [value, setValue] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setError('');setMessage('');
    if (reset && (value.length < 10 || value.length > 72 || value !== confirmation)) { setError('Құпиясөздер сәйкес келуі және 10–72 таңбадан тұруы керек.'); return; }
    if (!reset && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) { setError('Дұрыс email мекенжайын енгізіңіз.'); return; }
    setBusy(true);
    try {
      const response = await fetch(`${API}/api/auth/${reset?'reset-password':'forgot-password'}`, { method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reset?{token,password:value}:{email:value.trim()}) });
      const data=await response.json();
      if (!response.ok) throw new Error(data.error || 'Сұрау орындалмады.');
      setMessage(data.message);
      setValue('');setConfirmation('');
    } catch(error:any) { setError(error.message || 'Байланысты тексеріп, қайта көріңіз.'); } finally { setBusy(false); }
  };
  return <AuthScaffold title={reset?'Жаңа құпиясөз':'Құпиясөзді ұмыттыңыз ба?'} subtitle={reset?'Кемінде 10 таңбадан тұратын жаңа құпиясөз таңдаңыз.':'Аккаунтыңыздың email мекенжайына қалпына келтіру сілтемесін жібереміз.'}>
    {!!message && <Text accessibilityRole="alert" style={{color:'#087C49',lineHeight:24,marginBottom:20}}>{message}</Text>}
    {!!error && <Text accessibilityRole="alert" style={{color:'#990F2E',lineHeight:24,marginBottom:20}}>{error}</Text>}
    {!message && <View style={{gap:16}}>
      <Text style={{color:'#46393D'}}>{reset?'Жаңа құпиясөз':'Электрондық пошта'}</Text>
      <TextInput accessibilityLabel={reset?'Жаңа құпиясөз':'Электрондық пошта'} value={value} onChangeText={setValue} secureTextEntry={reset} autoCapitalize="none" autoComplete={reset?'new-password':'email'} keyboardType={reset?'default':'email-address'} style={{borderWidth:1,borderColor:'#DFD2C3',backgroundColor:'white',padding:15,borderRadius:10,fontSize:16}}/>
      {reset && <><Text>Құпиясөзді қайталаңыз</Text><TextInput accessibilityLabel="Құпиясөзді қайталаңыз" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoComplete="new-password" style={{borderWidth:1,borderColor:'#DFD2C3',backgroundColor:'white',padding:15,borderRadius:10,fontSize:16}}/></>}
      <TouchableOpacity accessibilityRole="button" onPress={submit} disabled={busy || (reset && !token)} style={{padding:16,borderRadius:10,backgroundColor:'#800F1D',alignItems:'center',opacity:busy?.6:1}}>{busy?<ActivityIndicator color="white"/>:<Text style={{color:'white',fontWeight:'600'}}>{reset?'Құпиясөзді жаңарту':'Сілтемені жіберу'}</Text>}</TouchableOpacity>
    </View>}
    <Link href="/login" style={{color:'#800F1D',marginTop:24,textAlign:'center'}}>Кіру бетіне оралу</Link>
  </AuthScaffold>;
}
