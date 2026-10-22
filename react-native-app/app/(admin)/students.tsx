import { confirmAction } from '../../lib/confirmAction';
import { notify } from '../../lib/notify';
import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, ShieldCheck, GraduationCap, BarChart3, FileText, CheckCircle2, Mail, Trash2, Coins } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext';
import { API } from '../constants/api';

interface Student {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  group_name: string | null;
  tests_completed: number;
  avg_score: number;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const {user}=useAuth();
  const [loadError,setLoadError]=useState('');
  const [coinStudent,setCoinStudent]=useState<Student|null>(null);
  const [roleStudent,setRoleStudent]=useState<Student|null>(null);
  const [roleBusy,setRoleBusy]=useState(false);
  const roleNames={student:'Студент',teacher:'Мұғалім',admin:'Әкімші'};
  const [amount,setAmount]=useState('100');
  const [coinBusy,setCoinBusy]=useState(false);
  const [amountError,setAmountError]=useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);setLoadError('');
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw Error("Load failed");
      setStudents(await res.json());
    } catch (e) {
      setLoadError('Пайдаланушыларды жүктеу мүмкін болмады. Қайта көріңіз.');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: number, role: 'student' | 'teacher' | 'admin') => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, role } : s));
        notify.success(`Рөл өзгерті: ${roleNames[role]}`);setRoleStudent(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        notify.error(errData.error || 'Рөл өзгерту сәтсіз болды (Сервер қатесі)');
      }
    } catch {
      notify.error('Сервермен байланыс үзілді немесе желіде ақау бар');
    }
  };

  const grantCoins = async (student: Student, amount: number) => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/admin/users/grant-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: student.id, amount }),
      });
      if (res.ok) {
        notify.success(`${student.name} қолданушысына ${amount} ₿ қосылды!`);
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        notify.error(errData.error || 'Биткоин жіберу сәтсіз болды');
      }
    } catch {
      notify.error('Сервермен байланыс үзілді немесе желіде ақау бар');
    }
  };

  const deleteStudent = async (student: Student) => {
    const handleConfirm = async () => {
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/students/${student.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStudents(prev => prev.filter(s => s.id !== student.id));
        } else {
          notify.error('Аккаунт бұғатталмады');
        }
      } catch {
        notify.error('Серверге қосылу сәтсіз болды');
      }
    };

    if (Platform.OS === 'web') {
      if (await confirmAction(`«${student.name}» аккаунтын бұғаттайсыз ба? Нәтижелер мен жауаптар сақталады.`)) handleConfirm();
    } else {
      Alert.alert(
        'Аккаунтты бұғаттау',
        `«${student.name}» аккаунтын бұғаттайсыз ба? Нәтижелер мен жауаптар сақталады.`,
        [
          { text: 'Бас тарту', style: 'cancel' },
          { text: 'Бұғаттау', style: 'destructive', onPress: handleConfirm }
        ]
      );
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.group_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalTests = students.reduce((a, s) => a + (s.tests_completed || 0), 0);
  const avgAll = totalTests ? Math.round(students.reduce((sum,s)=>sum+(s.avg_score||0)*(s.tests_completed||0),0)/totalTests) : 0;
  const avatarColors = ['#840B25','#D58400','#638B80','#CF1236','#956F54'];
  const avatarById=new Map(students.map((student,index)=>[student.id,avatarColors[index%avatarColors.length]]));

  const getInitials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  const submitCoins=async()=>{
    if(coinBusy||!coinStudent)return;
    if(!/^\d+$/.test(amount)||!Number.isSafeInteger(Number(amount))||Number(amount)<1||Number(amount)>10000){setAmountError('1–10000 аралығындағы бүтін санды енгізіңіз.');return;}
    setCoinBusy(true);const success=await grantCoins(coinStudent,Number(amount));setCoinBusy(false);if(success)setCoinStudent(null);
  };
  const stats=[{label:'Барлық қолданушы',value:String(students.length),Icon:Users},{label:'Аяқталған тесттер',value:String(totalTests),Icon:FileText},{label:'Орташа балл',value:`${avgAll}%`,Icon:BarChart3}];
  return <SafeAreaView className="students-page" style={{flex:1,backgroundColor:'#FCFAF7'}}>
    <View className="students-campus" pointerEvents="none" style={{position:'absolute',top:0,left:0,right:0,height:280,overflow:'hidden',display:'none'}}>
      <Image source={require('../../assets/campus-header.png')} resizeMode="cover" style={{position:'absolute',right:0,top:0,width:'86%',height:280,opacity:.7}}/>
      <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,...Platform.select({web:{backgroundImage:'linear-gradient(90deg, #FCFAF7 0%, rgba(252,250,247,.93) 26%, rgba(252,250,247,0) 100%), linear-gradient(180deg, rgba(252,250,247,0) 20%, #FCFAF7 100%)'} as any,default:{backgroundColor:'rgba(252,250,247,.6)'}})}}/>
    </View>
    <ScrollView contentContainerClassName="students-content" contentContainerStyle={{padding:18,paddingTop:24,paddingBottom:32}} keyboardShouldPersistTaps="handled">
      <View style={{width:'100%',maxWidth:1400,alignSelf:'center'}}>
        <Text style={{fontSize:11,letterSpacing:2,color:'#69758B',marginBottom:10}}>МҰҒАЛІМ КАБИНЕТІ</Text>
        <Text className="students-title" style={{fontFamily:displayFont,fontSize:36,lineHeight:44,fontWeight:'700',letterSpacing:-1,color:'#101521'}}>Студенттер</Text>
        <Text className="students-subtitle" style={{fontFamily:displayFont,fontSize:18,lineHeight:26,color:'#778094',marginTop:6,marginBottom:22}}>Жүйеге тіркелген пайдаланушылар</Text>
        <View style={{flexDirection:'row',gap:12,marginBottom:20}}>{stats.map(({label,value,Icon})=><View className="students-stat" key={label} style={{flex:1,minWidth:0,padding:12,borderRadius:14,borderWidth:1,borderColor:'#E8E1DA',backgroundColor:'#FFF',gap:10}}><View className="students-stat-icon" style={{width:36,height:36,borderRadius:11,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF0F3'}}><Icon size={25} color="#990E2C" strokeWidth={1.8}/></View><View style={{minWidth:0,flexShrink:1}}><Text className="students-stat-value" style={{fontFamily:displayFont,fontSize:28,lineHeight:34,fontWeight:'700',color:'#101521'}}>{value}</Text><Text className="students-stat-label" style={{fontSize:11,lineHeight:17,color:'#6F7B91',marginTop:3}}>{label}</Text></View></View>)}</View>
        <View className="students-panel" style={{borderWidth:1,borderColor:'#E8E1DA',borderRadius:15,backgroundColor:'#FFF',padding:14}}>
          <View className="students-toolbar" style={{gap:16,marginBottom:18}}><View><Text style={{fontFamily:displayFont,fontSize:28,lineHeight:34,fontWeight:'700',color:'#101521'}}>Пайдаланушылар</Text><Text style={{fontSize:14,color:'#6F7B91',marginTop:3}}>{students.length} қолданушы</Text></View><View className="students-search" style={{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#DADCE3',borderRadius:11,paddingHorizontal:16,minHeight:48}}><Search size={22} color="#6B7487"/><TextInput accessibilityLabel="Пайдаланушыларды іздеу" value={search} onChangeText={setSearch} placeholder="Аты, email немесе топ бойынша іздеу" placeholderTextColor="#788398" style={{flex:1,minWidth:0,fontSize:15,color:'#222A3B',paddingVertical:12,...Platform.select({web:{outlineColor:'#940B27'} as any})}}/></View></View>
          {!!loadError&&<View style={{padding:16,backgroundColor:'#FFF1F3',borderRadius:10,marginBottom:12}}><Text accessibilityRole="alert" style={{color:'#940B27'}}>{loadError}</Text><TouchableOpacity accessibilityRole="button" onPress={fetchStudents} style={{paddingTop:12}}><Text style={{color:'#940B27',fontWeight:'700'}}>Қайта жүктеу</Text></TouchableOpacity></View>}
          <View style={{borderWidth:1,borderColor:'#EFEBE7',borderRadius:12,overflow:'hidden'}}>
            <View className="students-table-heading" style={{display:'none',flexDirection:'row',alignItems:'center',backgroundColor:'#FAF8F5',paddingHorizontal:18,minHeight:40}}><Text style={{flex:1,fontSize:13,color:'#6E6E77'}}>Пайдаланушы</Text><Text style={{width:190,fontSize:13,color:'#6E6E77'}}>Рөл</Text><Text style={{width:150,fontSize:13,color:'#6E6E77',textAlign:'center'}}>Әрекеттер</Text></View>
            {!filtered.length&&!loadError&&<View style={{padding:36,alignItems:'center',gap:12}}><Users size={32} color="#C8B6AE"/><Text style={{color:'#7C7F8A'}}>Пайдаланушы табылмады</Text></View>}
            {filtered.map((s,i)=>{
              const RoleIcon=s.role==='admin'?ShieldCheck:GraduationCap;
              const own=s.id===Number(user?.id);
              return <View className="students-row" key={s.id} style={{padding:14,gap:12,borderTopWidth:i?1:0,borderTopColor:'#EFEBE7'}}>
                <View className="students-identity" style={{flexDirection:'row',alignItems:'center',gap:16,flex:1,minWidth:0}}><View style={{width:46,height:46,borderRadius:24,backgroundColor:avatarById.get(s.id),alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:16,fontWeight:'700',color:'#FFF'}}>{getInitials(s.name)}</Text></View><View style={{flex:1,minWidth:0}}><Text style={{fontSize:16,lineHeight:22,fontWeight:'600',color:'#151B28'}}>{s.name}</Text><Text selectable style={{fontSize:13,lineHeight:19,color:'#748097',marginTop:2}}>{s.email}</Text>{s.group_name&&<Text style={{fontSize:12,color:'#8992A3',marginTop:2}}>{s.group_name}</Text>}</View></View>
                <View className="students-row-bottom" style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:12}}>
                  <View className="students-role-column" style={{width:130}}><View style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12,paddingVertical:7,borderRadius:8,backgroundColor:s.role==='admin'?'#F9E8EC':'#F7F2EA'}}><RoleIcon size={18} color={s.role==='admin'?'#990E2C':'#756D70'}/><Text style={{fontSize:12,color:s.role==='admin'?'#990E2C':'#756D70'}}>{roleNames[s.role]}</Text></View></View>
                  <View style={{flexDirection:'row',gap:9}}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${s.name}: рөлін өзгерту`} disabled={own} onPress={()=>setRoleStudent(s)} style={{width:40,height:40,borderRadius:10,backgroundColor:'#F7F4EF',alignItems:'center',justifyContent:'center',opacity:own?0.4:1}}><RoleIcon size={21} color={s.role==='admin'?'#990E2C':'#6C6D78'}/></TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${s.name}: ұпай қосу`} onPress={()=>{setAmount('100');setAmountError('');setCoinStudent(s);}} style={{width:40,height:40,borderRadius:10,backgroundColor:'#FFF3D3',alignItems:'center',justifyContent:'center'}}><Coins size={21} color="#C38000"/></TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${s.name}: аккаунтын бұғаттау`} disabled={s.role!=='student'} onPress={()=>deleteStudent(s)} style={{width:40,height:40,borderRadius:10,backgroundColor:'#FFEDF1',alignItems:'center',justifyContent:'center',opacity:s.role!=='student'?0.4:1}}><Trash2 size={21} color="#D91440"/></TouchableOpacity>
                  </View>
                </View>
              </View>;
            })}
          </View>
          <Text accessibilityLiveRegion="polite" style={{fontSize:13,color:'#92939B',textAlign:'center',marginTop:18,marginBottom:2}}>{filtered.length} / {students.length} қолданушы</Text>
        </View>
      </View>
    </ScrollView>
    <Modal visible={!!coinStudent} transparent animationType="fade" onRequestClose={()=>{if(!coinBusy)setCoinStudent(null);}}>
      <View style={{flex:1,backgroundColor:'rgba(30,13,19,.38)',alignItems:'center',justifyContent:'center',padding:24}}><View accessibilityViewIsModal style={{width:'100%',maxWidth:420,backgroundColor:'#FFFDF9',borderRadius:18,padding:24,borderWidth:1,borderColor:'#E5DAD2'}}><View style={{width:46,height:46,borderRadius:12,backgroundColor:'#FFF3D3',alignItems:'center',justifyContent:'center',marginBottom:16}}><Coins size={26} color="#BC7C12"/></View><Text style={{fontFamily:displayFont,fontSize:28,fontWeight:'700',color:'#340B13'}}>Ұпай қосу</Text><Text style={{fontSize:14,lineHeight:21,color:'#768093',marginTop:8,marginBottom:18}}>{coinStudent?.name} · Оқу тапсырмаларына арналған ішкі ұпайлар.</Text><Text style={{fontSize:13,color:'#555D6D',marginBottom:8}}>Ұпай саны</Text><TextInput accessibilityLabel="Ұпай саны" keyboardType="numeric" value={amount} onChangeText={v=>{setAmount(v);setAmountError('');}} editable={!coinBusy} onSubmitEditing={submitCoins} style={{borderWidth:1,borderColor:'#D6D8E0',borderRadius:9,padding:12,fontSize:18,color:'#1B2434'}}/>{!!amountError&&<Text accessibilityRole="alert" style={{fontSize:13,color:'#940B27',marginTop:10}}>{amountError}</Text>}<View style={{flexDirection:'row',gap:12,marginTop:24}}><TouchableOpacity accessibilityRole="button" disabled={coinBusy} onPress={()=>setCoinStudent(null)} style={{flex:1,minHeight:44,borderWidth:1,borderColor:'#D6D8E0',borderRadius:9,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#657086'}}>Бас тарту</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" disabled={coinBusy} onPress={submitCoins} style={{flex:1,minHeight:44,backgroundColor:'#940B27',borderRadius:9,alignItems:'center',justifyContent:'center'}}>{coinBusy?<ActivityIndicator color="white"/>:<Text style={{color:'white',fontWeight:'600'}}>Қосу</Text>}</TouchableOpacity></View></View></View>
    </Modal>
    <Modal visible={!!roleStudent} transparent animationType="fade" onRequestClose={()=>{if(!roleBusy)setRoleStudent(null);}}><View style={{flex:1,backgroundColor:'rgba(30,13,19,.38)',alignItems:'center',justifyContent:'center',padding:24}}><View accessibilityViewIsModal style={{width:'100%',maxWidth:440,backgroundColor:'#FFFDF9',borderRadius:16,padding:24,gap:12}}><Text style={{fontFamily:displayFont,fontSize:27,fontWeight:'700',color:'#340B13'}}>Рөлді өзгерту</Text><Text style={{color:'#768093',lineHeight:21}}>{roleStudent?.name} · Жаңа рөлмен кіру үшін аккаунтқа қайта кіру керек.</Text>{(['student','teacher','admin'] as const).map(role=><TouchableOpacity key={role} accessibilityRole="button" disabled={roleBusy||roleStudent?.role===role} onPress={async()=>{if(!roleStudent)return;if(!await confirmAction(`${roleStudent.name} — ${roleNames[role]} рөлін тағайындауды растайсыз ба?`))return;setRoleBusy(true);try{await changeRole(roleStudent.id,role);}finally{setRoleBusy(false);}}} style={{padding:14,borderRadius:9,borderWidth:1,borderColor:'#E4D9D1',backgroundColor:roleStudent?.role===role?'#FAEBEF':'#FFF',opacity:roleBusy ? .5 : 1}}><Text style={{fontWeight:'600',color:'#990F2E'}}>{roleNames[role]}{roleStudent?.role===role?' · Қазіргі рөл':''}</Text><Text style={{fontSize:12,lineHeight:19,color:'#7C879D',marginTop:4}}>{role==='teacher'?'Өз тесттерін құру, өңдеу, нәтижелерін қарау және жою.':role==='admin'?'Пайдаланушылар, рөлдер және барлық деректерді басқару.':'Тест тапсыру және өз нәтижелерін қарау.'}</Text></TouchableOpacity>)}<TouchableOpacity accessibilityRole="button" disabled={roleBusy} onPress={()=>setRoleStudent(null)} style={{padding:12,alignItems:'center'}}><Text style={{color:'#768093'}}>Бас тарту</Text></TouchableOpacity></View></View></Modal>
  </SafeAreaView>;
}
