import { displayFont } from '../../theme';
import { confirmAction } from '../../lib/confirmAction';
import { notify } from '../../lib/notify';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, RefreshControl, TextInput, useWindowDimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, CheckCircle, Archive, Clock, Layers, Filter, Search, MoreVertical, BarChart3, Coins, Target, MessageSquare, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { API } from '../constants/api';

interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  question_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const narrow = width < 1180;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionError, setActionError] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const fetchTests = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests?all=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('load');
      setTests(await res.json());setActionError('');
    } catch (e) {
      setActionError('Тесттерді жүктеу мүмкін болмады. Қайта жүктеңіз.');
    }
  };

  const fetchCoins = async () => {
    try {
      if (user?.id) {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/users/coins?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setCoins(data.coins);
        }
      }
    } catch (e) {
      console.error('Coins err:', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTests(), fetchCoins()]);
    setLoading(false);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTests(), fetchCoins()]);
    setRefreshing(false);
  }, [user]);

  const togglePublish = async (test: Test) => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/${test.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: !test.is_published }),
      });
      if (!res.ok) throw new Error('publish');
      if (res.ok) {
        setTests(prev => prev.map(t => t.id === test.id ? { ...t, is_published: !t.is_published } : t));
        notify.success(test.is_published ? 'Тест жабылды' : 'Тест жарияланды!');
      }
    } catch {
      setActionError('Өзгеріс сақталмады. Қайта көріңіз.');
      notify.error('Өзгеріс сақталмады. Қайта көріңіз.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  const published = tests.filter(t => t.is_published);
  const unpublished = tests.filter(t => !t.is_published);

  const deleteTest = async (test: Test) => {
    const handleConfirm = async () => {
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/tests/${test.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('delete');
        if (res.ok) {
          notify.success('Тест өшірілді');
          setTests(prev => prev.filter(t => t.id !== test.id));
        }
      } catch {
        setActionError('Өзгеріс сақталмады. Қайта көріңіз.');
      notify.error('Өзгеріс сақталмады. Қайта көріңіз.');
      }
    };

    if (Platform.OS === 'web') {
      if (await confirmAction(`«${test.title}» тестті толықтай өшіргіңіз келе ме?`)) handleConfirm();
    } else {
      Alert.alert(
        'Тестті өшіру',
        `«${test.title}» тестті толықтай өшіргіңіз келе ме?`,
        [
          { text: 'Бас тарту', style: 'cancel' },
          { text: 'Өшіру', style: 'destructive', onPress: handleConfirm }
        ]
      );
    }
  };

  // -------------------------------------------------------------------------------- //
  //  RENDER
  // -------------------------------------------------------------------------------- //
  const shown = tests.filter(test => (filter === 'all' || test.is_published === (filter === 'published')) && `${test.title} ${test.subject}`.toLowerCase().includes(search.toLowerCase()));
  const stats = [
    {label:'Барлық тест',value:tests.length,icon:FileText,color:'#A00D30',background:'#FAEAF0'},
    {label:'Жарияланған',value:published.length,icon:CheckCircle,color:'#00A56C',background:'#E5F9F0'},
    {label:'Жобалар',value:unpublished.length,icon:FileText,color:'#68758B',background:'#EEF1F6'},
  ];
  return (
    <View style={{flex:1,backgroundColor:'#FCFAF7'}}>
      {!compact&&<View pointerEvents="none" style={{position:'absolute',top:0,right:0,left:0,height:290,overflow:'hidden'}}>
        <Image source={require('../../assets/campus-header.png')} resizeMode="cover" style={{position:'absolute',right:0,top:0,width:'86%',height:290,opacity:.67}}/>
        <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,...Platform.select({web:{backgroundImage:'linear-gradient(90deg, #FCFAF7 0%, rgba(252,250,247,.96) 25%, rgba(252,250,247,.1) 84%), linear-gradient(180deg, rgba(252,250,247,0) 10%, #FCFAF7 100%)'} as any,default:{backgroundColor:'rgba(252,250,247,.6)'}})}}/>
      </View>}
      <ScrollView contentContainerStyle={{width:'100%',maxWidth:1460,alignSelf:'center',padding:compact?16:32,paddingTop:compact?22:36,paddingBottom:40}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{flexDirection:compact?'column':'row',alignItems:compact?'flex-start':'center',justifyContent:'space-between',gap:20,marginBottom:24}}>
          <View style={{flexShrink:1}}>
            <Text style={{fontSize:compact?13:15,color:'#707D93',marginBottom:10}}>Мұғалім кабинеті  /  Басты бет</Text>
            <Text style={{fontFamily:displayFont,fontSize:compact?30:46,lineHeight:compact?38:56,fontWeight:'800',letterSpacing:-1,color:'#101827'}}>Тесттерді басқару</Text>
            <Text style={{fontFamily:displayFont,fontSize:compact?17:22,color:'#7D7777',marginTop:4}}>Тесттеріңізді құрыңыз және басқарыңыз.</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(admin)/create')} style={{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:'#940B27',borderRadius:12,paddingHorizontal:24,paddingVertical:16}}><Plus size={23} color="white"/><Text style={{color:'white',fontWeight:'700',fontSize:16}}>Тест жасау</Text></TouchableOpacity>
        </View>

        <View style={{flexDirection:'row',gap:compact?8:14,marginBottom:18}}>
          {stats.map(({icon:Icon,...item})=><View key={item.label} style={{flex:1,flexDirection:compact?'column':'row',alignItems:compact?'flex-start':'center',gap:compact?10:20,backgroundColor:'white',borderWidth:1,borderColor:'#E7E1DC',borderRadius:13,padding:compact?12:24,minWidth:0}}>
            <View style={{width:compact?36:64,height:compact?36:64,borderRadius:12,backgroundColor:item.background,alignItems:'center',justifyContent:'center'}}><Icon size={compact?21:29} color={item.color} strokeWidth={1.8}/></View>
            <View><Text style={{fontFamily:displayFont,fontSize:compact?28:38,fontWeight:'700',color:'#101827'}}>{item.value}</Text><Text style={{fontSize:compact?11:15,color:'#69768D',marginTop:5}}>{item.label}</Text></View>
          </View>)}
        </View>

        <View style={{backgroundColor:'white',borderWidth:1,borderColor:'#E7E1DC',borderRadius:14,padding:compact?14:20}}>
          <Text style={{fontFamily:displayFont,fontSize:compact?26:32,fontWeight:'700',letterSpacing:-.5,color:'#101827'}}>Менің тесттерім</Text>
          <Text style={{fontSize:14,color:'#707D93',marginTop:5,marginBottom:10}}>{shown.length} тест</Text>
          <View style={{flexDirection:narrow?'column':'row',justifyContent:'space-between',gap:16,marginBottom:14}}>
            <View style={{flexDirection:'row',gap:compact?6:10}}>{[{key:'all',label:'Барлығы'},{key:'published',label:'Жарияланған'},{key:'draft',label:'Жобалар'}].map(item=><TouchableOpacity key={item.key} accessibilityRole="button" accessibilityState={{selected:filter===item.key}} onPress={()=>setFilter(item.key)} style={{paddingHorizontal:compact?10:14,paddingTop:12,paddingBottom:16,borderBottomWidth:3,borderBottomColor:filter===item.key?'#940B27':'transparent'}}><Text style={{fontSize:compact?12:15,fontWeight:filter===item.key?'700':'500',color:filter===item.key?'#940B27':'#69768D'}}>{item.label}</Text></TouchableOpacity>)}</View>
            <View style={{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#DAD8DD',borderRadius:11,paddingHorizontal:15,width:narrow?'100%':'40%'}}><Search size={22} color="#707D93"/><TextInput accessibilityLabel="Тесттерді іздеу" placeholder="Тест немесе пән атауын іздеу" placeholderTextColor="#707D93" value={search} onChangeText={setSearch} style={{flex:1,minWidth:0,paddingVertical:14,fontSize:compact?13:15,color:'#101827'}}/></View>
          </View>
          {!!actionError && <View style={{marginBottom:16}}><Text accessibilityRole="alert" style={{color:'#A00D30'}}>{actionError}</Text><TouchableOpacity accessibilityRole="button" onPress={loadData} style={{paddingVertical:12}}><Text style={{color:'#A00D30'}}>Қайта жүктеу</Text></TouchableOpacity></View>}
          {!shown.length && <View style={{padding:32,alignItems:'center'}}><FileText size={32} color="#707D93"/><Text style={{fontSize:18,fontWeight:'600',marginTop:12}}>Тесттер табылмады</Text><Text style={{color:'#707D93',marginTop:8,textAlign:'center'}}>Іздеуді өзгертіңіз немесе жаңа тест жасаңыз.</Text></View>}
          {shown.map((test,index)=><View key={test.id} style={{borderWidth:1,borderColor:'#E7E1DC',borderRadius:12,padding:compact?14:20,marginTop:index?16:0}}>
            <View style={{flexDirection:'row',gap:compact?12:22,alignItems:'flex-start'}}>
              {!compact && <View style={{width:74,height:74,borderRadius:13,backgroundColor:'#FAEAF0',alignItems:'center',justifyContent:'center'}}><FileText size={32} color="#A00D30" strokeWidth={1.8}/></View>}
              <View style={{flex:1,minWidth:0}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6}}>
                  <Text style={{color:'#A00D30',backgroundColor:'#FAEAF0',paddingHorizontal:13,paddingVertical:6,borderRadius:9,fontSize:12}}>{test.subject}</Text>
                  <View style={{flexDirection:'row',gap:7,alignItems:'center',paddingHorizontal:11,paddingVertical:8,borderRadius:10,backgroundColor:test.is_published?'#E3F8EF':'#F0F2F6'}}><View style={{width:7,height:7,borderRadius:4,backgroundColor:test.is_published?'#00A56C':'#707D93'}}/><Text style={{fontSize:11,color:test.is_published?'#00895A':'#69768D'}}>{test.is_published?'Жарияланған':'Жоба'}</Text></View>
                </View>
                <Text style={{fontFamily:displayFont,fontSize:compact?26:30,fontWeight:'700',color:'#101827'}}>{test.title}</Text>
                {!!(test.description && !test.description.startsWith('Imported from')) && <Text style={{fontSize:15,lineHeight:22,color:'#707D93',marginTop:4}}>{test.description}</Text>}
                {test.title==='АКТ' && (!test.description || test.description.startsWith('Imported from')) && <Text style={{fontSize:compact?13:15,lineHeight:22,color:'#707D93',marginTop:4}}>Ақпараттық-коммуникациялық технологиялар</Text>}
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:compact?12:22,marginTop:14}}>
                  {[{icon:MessageSquare,text:`${test.question_count} сұрақ`},{icon:Clock,text:`${test.duration_minutes} мин`},{icon:Target,text:`Өту шегі ${test.passing_score}%`}].map(({icon:Icon,text},i)=><View key={text} style={{flexDirection:'row',alignItems:'center',gap:8,...(!compact&&i>0?{borderLeftWidth:1,borderLeftColor:'#D8E0ED',paddingLeft:22}:{})}}><Icon size={compact?17:20} color="#707D93"/><Text style={{fontSize:compact?12:14,color:'#69768D'}}>{text}</Text></View>)}
                </View>
              </View>
            </View>
            <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:10,borderTopWidth:1,borderTopColor:'#E8E1DD',marginTop:20,paddingTop:14}}>
              <TouchableOpacity accessibilityRole="button" onPress={()=>router.push(`/test/${test.id}/edit` as any)} style={{flexDirection:'row',gap:10,alignItems:'center',paddingHorizontal:compact?12:20,paddingVertical:13,borderRadius:10,backgroundColor:'#FAE5EC'}}><Edit2 size={20} color="#A00D30"/><Text style={{fontSize:14,color:'#A00D30',fontWeight:'600'}}>Өңдеу</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={()=>router.push(`/test/${test.id}/results` as any)} style={{flexDirection:'row',gap:10,alignItems:'center',paddingHorizontal:compact?12:20,paddingVertical:12,borderWidth:1,borderColor:'#DAD8DD',borderRadius:10}}><BarChart3 size={20} color="#69768D"/><Text style={{fontSize:14,color:'#536078',fontWeight:'600'}}>Нәтижелер</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={async()=>{if(!test.is_published&&!test.question_count){setActionError('Жариялау үшін кемінде бір сұрақ қосыңыз.');return;}const message=test.is_published?'Тестті жабу керек пе?':'Тестті оқушыларға жариялау керек пе?';if(Platform.OS==='web'){if(await confirmAction(message))togglePublish(test);}else Alert.alert('Растау',message,[{text:'Бас тарту',style:'cancel'},{text:'Растау',onPress:()=>togglePublish(test)}]);}} style={{flexDirection:'row',gap:10,alignItems:'center',paddingHorizontal:12,paddingVertical:12,borderWidth:1,borderColor:'#DAD8DD',borderRadius:10}}>{test.is_published?<EyeOff size={21} color="#69768D"/>:<Eye size={21} color="#69768D"/>}<Text style={{color:'#69768D',fontSize:14,fontWeight:'500'}}>{test.is_published?'Жабу':'Жариялау'}</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${test.title} тестін жою`} onPress={()=>deleteTest(test)} style={{flexDirection:'row',gap:10,alignItems:'center',paddingHorizontal:14,paddingVertical:13,marginLeft:'auto',borderLeftWidth:compact?0:1,borderLeftColor:'#E7E1DC'}}><Trash2 size={21} color="#A00D30"/><Text style={{color:'#A00D30',fontSize:14,fontWeight:'600'}}>Жою</Text></TouchableOpacity>
            </View>
          </View>)}
        </View>
        <View style={{flexDirection:'row',alignItems:'flex-start',gap:12,marginTop:20}}><Info size={22} color="#707D93"/><Text style={{flex:1,color:'#707D93',fontSize:compact?12:14,lineHeight:21}}>Тест сұрақтарын «Өңдеу» арқылы өзгерте аласыз.</Text></View>
      </ScrollView>
    </View>
  );
}
