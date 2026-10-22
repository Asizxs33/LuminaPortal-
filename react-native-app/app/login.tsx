import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, ScrollView, Image, ImageBackground, Platform, useWindowDimensions } from 'react-native';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Globe2, ChevronDown } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { displayFont } from '../theme';

export default function Login() {
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 1000;
  const [language, setLanguage] = useState<'ҚАЗ' | 'РУС' | 'ENG'>('ҚАЗ');
  const [languageOpen, setLanguageOpen] = useState(false);
  const copy = {
    'ҚАЗ': {title:'Қайта қош келдіңіз',subtitle:'Оқу жолыңызды жалғастырыңыз.',email:'Электрондық пошта',password:'Құпиясөз',forgot:'Құпиясөзді ұмыттыңыз ба?',submit:'Жүйеге кіру',account:'Аккаунтыңыз жоқ па?',register:'Тіркелу',hero:'Білімге бастар\nжаңа қадам',tagline:'Оқыңыз. Дамыңыз. Нәтижеге жетіңіз.'},
    'РУС': {title:'С возвращением',subtitle:'Продолжайте свой путь к знаниям.',email:'Электронная почта',password:'Пароль',forgot:'Забыли пароль?',submit:'Войти',account:'Нет аккаунта?',register:'Регистрация',hero:'Новый шаг\nк знаниям',tagline:'Учитесь. Развивайтесь. Достигайте.'},
    'ENG': {title:'Welcome back',subtitle:'Continue your learning journey.',email:'Email address',password:'Password',forgot:'Forgot password?',submit:'Sign in',account:'Don’t have an account?',register:'Sign up',hero:'A new chapter\nin learning',tagline:'Learn. Grow. Achieve.'},
  }[language];
  const inputHeight = desktop ? Math.min(76, Math.max(58, height * .081)) : 58;
  const labelStyle = {color:'#30262A',fontSize:desktop ? 18 : 15,fontWeight:'500' as const,marginBottom:12};
  const fieldStyle = {flexDirection:'row' as const,alignItems:'center' as const,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#DDD2CF',borderRadius:12,paddingHorizontal:20};
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
    <ScrollView style={{flex:1,backgroundColor:'#FCFAF7'}} contentContainerStyle={{flexGrow:1}} keyboardShouldPersistTaps="handled">
      <View style={{flex:1,flexDirection:'row',minHeight:height}}>
        {desktop && <ImageBackground source={require('../assets/library-hero.png')} resizeMode="cover" imageStyle={{width:"100%",height:"100%"}} style={{width:'50%',minHeight:height,backgroundColor:'#380610'}}>
          <View style={{...Platform.select({web:{backgroundImage:'linear-gradient(180deg, rgba(42,0,8,.66) 0%, rgba(55,4,13,.25) 40%, rgba(49,0,10,.9) 100%)'} as any,default:{backgroundColor:'rgba(49,0,10,.55)'}}),flex:1,paddingHorizontal:width>=1450?70:44,paddingVertical:height>=850?60:42,justifyContent:'space-between'}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:16}}>
              <Image source={require('../assets/brand/lumina-symbol.png')} style={{width:68,height:68,tintColor:'#FFFDF5'}} resizeMode="contain" />
              <View><Text style={{fontFamily:displayFont,fontSize:width>=1450?38:32,fontWeight:'700',color:'#FFFDF5'}}>LuminaPortal</Text><Text style={{fontFamily:displayFont,fontSize:14,color:'#F6E8DC',marginTop:3}}>Білім. Бағалау. Даму.</Text></View>
            </View>
            <View><Text style={{fontFamily:displayFont,fontSize:Math.min(72,width*.044),lineHeight:Math.min(76,width*.047),fontWeight:'700',letterSpacing:-1.5,color:'#FFFDF5'}}>{copy.hero}</Text><View style={{height:3,width:58,backgroundColor:'#D5A755',marginTop:26,marginBottom:20}}/><Text style={{fontFamily:displayFont,fontSize:width>=1450?25:20,lineHeight:32,color:'#F6E8DC'}}>{copy.tagline}</Text></View>
          </View>
        </ImageBackground>}
        <View style={{flex:1,paddingHorizontal:desktop?Math.min(100,width*.06):24,paddingTop:desktop?(height>=850?130:100):110,paddingBottom:desktop?(height>=850?85:40):40,justifyContent:'center'}}>
          {!desktop && <View style={{position:'absolute',left:24,top:30,flexDirection:'row',alignItems:'center',gap:8}}><Image source={require('../assets/brand/lumina-symbol.png')} style={{width:34,height:34}}/><Text style={{fontFamily:displayFont,fontSize:22,fontWeight:'700',color:'#800F1D'}}>LuminaPortal</Text></View>}
          <View style={{position:'absolute',right:desktop?52:24,top:desktop?48:30,zIndex:10}}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Тілді таңдау" accessibilityState={{expanded:languageOpen}} onPress={()=>setLanguageOpen(!languageOpen)} style={{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,minHeight:44,borderWidth:1,borderColor:'#DFD3CE',borderRadius:12}}><Globe2 size={20} color="#71472F"/><Text style={{fontSize:15,color:'#71472F'}}>{language}</Text><ChevronDown size={17} color="#71472F"/></TouchableOpacity>
            {languageOpen && <View style={{position:'absolute',top:50,right:0,width:125,padding:5,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DFD3CE',borderRadius:12}}>{(['ҚАЗ','РУС','ENG'] as const).map(item=><TouchableOpacity key={item} accessibilityRole="button" onPress={()=>{setLanguage(item);setLanguageOpen(false);}} style={{padding:12,borderRadius:7,backgroundColor:language===item?'#F7ECEC':'transparent'}}><Text style={{color:'#800F1D'}}>{item}</Text></TouchableOpacity>)}</View>}
          </View>
          <View style={{width:'100%',maxWidth:670,alignSelf:'center'}}>
            <Text style={{fontFamily:displayFont,fontSize:desktop?Math.min(58,width*.035):36,lineHeight:desktop?Math.min(68,width*.042):44,fontWeight:'700',letterSpacing:-1.2,color:'#290D13'}}>{copy.title}</Text>
            <Text style={{fontFamily:displayFont,fontSize:desktop?25:19,lineHeight:32,color:'#786B6B',marginTop:9,marginBottom:desktop&&height>=850?48:32}}>{copy.subtitle}</Text>
      {error ? (
        <View accessibilityRole="alert" style={{ backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#F3BEC5', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
          <AlertCircle size={19} color="#C73D4D" />
          <Text style={{ color: '#9E2F3C', flex: 1, fontWeight: '700', lineHeight: 20 }}>{error}</Text>
        </View>
      ) : null}
      <View style={{ gap: desktop && height>=850 ? 28 : 22 }}>
        <View>
          <Text style={labelStyle}>{copy.email}</Text>
          <View style={fieldStyle}>
            <Mail size={24} color="#8A8B91" />
            <TextInput accessibilityLabel="Электрондық пошта" value={email} onChangeText={(value) => { setEmail(value); if (error) setError(''); }} placeholder="name@example.com" placeholderTextColor="#9AA5B5" autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" style={{ flex: 1, minHeight: inputHeight, paddingHorizontal: 12, color: '#271C20', fontSize: desktop ? 20 : 16, outlineStyle: 'none' } as any} />
          </View>
        </View>
        <View>
          <Text style={labelStyle}>{copy.password}</Text>
          <View style={fieldStyle}>
            <LockKeyhole size={24} color="#8A8B91" />
            <TextInput accessibilityLabel="Құпиясөз" value={password} onChangeText={(value) => { setPassword(value); if (error) setError(''); }} placeholder="••••••••••" placeholderTextColor="#9AA5B5" secureTextEntry={!showPassword} autoComplete="current-password" returnKeyType="done" onSubmitEditing={handleLogin} style={{ flex: 1, minHeight: inputHeight, paddingHorizontal: 12, color: '#271C20', fontSize: desktop ? 20 : 16, outlineStyle: 'none' } as any} />
            <TouchableOpacity accessibilityLabel={showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'} onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              {showPassword ? <EyeOff size={20} color="#756D70" /> : <Eye size={20} color="#756D70" />}
            </TouchableOpacity>
          </View>
        </View>
        <Link href={'/forgot-password' as any} style={{color:'#800F1D',textAlign:'right',fontSize:desktop?18:15,marginTop:-12,paddingVertical:4}}>{copy.forgot}</Link>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Жүйеге кіру" onPress={handleLogin} disabled={loading} style={{ minHeight: inputHeight, borderRadius: 12, backgroundColor: loading ? '#BE8B92' : '#800F1D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 4 }}>
          {loading ? <ActivityIndicator color="white" /> : <><Text style={{ color: 'white', fontFamily:displayFont,fontWeight: '700', fontSize: desktop?26:21 }}>{copy.submit}</Text><ArrowRight size={19} color="white" /></>}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems:'center',justifyContent: 'center', gap:12,marginTop: desktop?18:6 }}><View style={{height:1,backgroundColor:'#E5DCD5',flex:1}}/>
          <Text style={{ color: '#756D70', fontSize: desktop?18:14 }}>{copy.account} </Text>
          <Link href="/register" style={{ color: '#800F1D', fontWeight: '700', fontSize: desktop?18:14 }}>{copy.register}</Link>
          <View style={{height:1,backgroundColor:'#E5DCD5',flex:1}}/>
        </View>
      </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
