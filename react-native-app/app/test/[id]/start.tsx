import { displayFont } from '../../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, HelpCircle, Timer, AlertTriangle, CheckCircle2, Info, ArrowLeft, ArrowRight, FileText, Target, Monitor, Wifi } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../../constants/api';

interface TestDetail {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  passing_score: number;
  questions: any[];
  exam_mode?:boolean;
  question_count?:number;
  variants?:{id:string;language:string}[]; language?:string; round_number?:number;
}

export default function TestStart() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const fetchTest = async () => {
      if (!id) {
        setError('Тест идентификаторы табылмады.');
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('lumina_token');
        // This also creates/reuses the student's persistent random set of 50 questions.
        const res = await fetch(`${API}/api/tests/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Тестті жүктеу мүмкін болмады (${res.status}).`);
        }

        const data = await res.json();
        if (!Array.isArray(data.questions) || data.questions.length === 0 && !data.question_count) {
          throw new Error('Тестте сұрақтар табылмады.');
        }
        setTest(data);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Failed to load test start screen:', e);
        }
        setError(
          (e as Error).name === 'AbortError'
            ? 'Жүктеу уақыты аяқталды. Интернетті тексеріп, қайта көріңіз.'
            : (e as Error).message || 'Тестті жүктеу мүмкін болмады.'
        );
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchTest();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
      </SafeAreaView>
    );
  }

  if (!test) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#10131B', marginBottom: 8 }}>Тест жүктелмеді</Text>
        <Text style={{ color: '#756D70', textAlign: 'center', marginBottom: 16 }}>{error || 'Тест табылмады'}</Text>
        <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#800F1D', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Тақтаға оралу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const stats = [
    {label:'Уақыт',value:`${test.duration_minutes} минут`,Icon:Timer},
    {label:'Сұрақтар',value:String(test.question_count ?? test.questions.length),Icon:FileText},
    {label:'Өту ұпайы',value:`${test.passing_score}%`,Icon:Target},
  ];
  const rules = [
    {title:'Уақыт шектеуі',text:test.exam_mode?'Таймер тест басталғанда іске қосылады. Бетті жабу уақытты тоқтатпайды. Уақыт серверде есептеледі.':'Таймер тест басталғанда іске қосылады. Бетті жабу уақытты тоқтатпайды.',Icon:Timer,color:'#990F2E',bg:'#FCEEF1'},
    {title:test.exam_mode?'Емтихан тәртібі':'Тест тәртібі',text:test.exam_mode?'Толық экран қажет. Терезе ауыстыру және толық экраннан шығу тіркеледі. 3 бұзушылықтан кейін тест аяқталады.':'Басқа терезеге ауысу тіркеледі. 3 ескертуден кейін тест автоматты түрде аяқталады.',Icon:Monitor,color:'#BC7B13',bg:'#FFF5DC'},
    {title:'Интернет байланысы',text:'Бастамас бұрын интернет байланысын тексеріңіз. Жауаптарды жіберу үшін байланыс қажет.',Icon:Wifi,color:'#009866',bg:'#E5FAED'},
  ];
  return <SafeAreaView className="test-start-page" style={{flex:1,backgroundColor:'#FCFAF7'}}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,borderBottomWidth:1,borderBottomColor:'#E6E0D8',paddingHorizontal:20,paddingVertical:12,backgroundColor:'#FFF'}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:17}}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Артқа қайту" onPress={()=>router.back()} style={{padding:4}}><ArrowLeft size={24} color="#152033"/></TouchableOpacity><View style={{flexDirection:'row',alignItems:'center',gap:9}}><ShieldCheck size={25} color="#990F2E"/><Text style={{fontSize:17,fontWeight:'700',color:'#101521'}}>Бағалау порталы</Text></View></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Тест ережелері туралы көмек" accessibilityState={{expanded:helpOpen}} onPress={()=>setHelpOpen(!helpOpen)} style={{padding:7,backgroundColor:'#F3EEE6',borderRadius:10}}><HelpCircle size={21} color="#62574B"/></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={{paddingBottom:24}}>
      <View className="start-campus" pointerEvents="none" style={{display:'none',position:'absolute',top:0,right:0,width:'78%',height:235,overflow:'hidden'}}><Image source={require('../../../assets/campus-header.png')} resizeMode="cover" style={{width:'100%',height:'100%'}}/>{Platform.OS==='web'&&<View style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(90deg,#FCFAF7 0%,rgba(252,250,247,.68) 27%,rgba(252,250,247,.04) 75%),linear-gradient(0deg,#FCFAF7 0%,rgba(252,250,247,0) 70%)'} as any}/>}</View>
      <View className="start-content" style={{padding:20}}>
        <Text style={{fontSize:13,color:'#7A8191',marginBottom:9}}>Бағалау  /  <Text style={{color:'#5E5149'}}>{test.title}</Text></Text>
        <Text className="start-title" style={{fontFamily:displayFont,fontSize:39,lineHeight:47,fontWeight:'700',color:'#101521'}}>{test.title}</Text>
        <Text className="start-subtitle" style={{fontFamily:displayFont,fontSize:19,lineHeight:27,color:'#7A8191',marginTop:3,marginBottom:18}}>Бастамас бұрын ережелермен танысыңыз.</Text>
        {!!test.variants?.length&&<View style={{marginBottom:16,gap:8}}><Text style={{color:'#62574B',fontWeight:'600'}}>Тест тілі · {test.round_number||1}-тапсыру</Text><View style={{flexDirection:'row',gap:10,flexWrap:'wrap'}}>{test.variants.map(v=><TouchableOpacity key={v.id} accessibilityRole="button" accessibilityState={{selected:v.id===test.id}} onPress={()=>{if(v.id!==test.id){setLoading(true);setError(null);router.replace(`/test/${v.id}/start` as any);}}} style={{padding:12,borderWidth:1,borderColor:'#DAD8DD',borderRadius:9,backgroundColor:v.id===test.id?'#940B27':'white'}}><Text style={{color:v.id===test.id?'white':'#62574B'}}>{({kk:'Қазақша',ru:'Русский',en:'English'} as Record<string,string>)[v.language]||v.language}</Text></TouchableOpacity>)}</View></View>}
        <View className="start-stats" style={{flexDirection:'row',gap:0,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E4DCD0',borderRadius:12,marginBottom:15,paddingVertical:14}}>{stats.map(({label,value,Icon},i)=><View key={label} className="start-stat" style={{flex:1,minWidth:0,alignItems:'center',gap:9,paddingHorizontal:10,borderLeftWidth:i?1:0,borderLeftColor:'#E6DFD4'}}><View className="start-stat-icon" style={{width:45,height:45,borderRadius:12,backgroundColor:'#FCEEF1',alignItems:'center',justifyContent:'center'}}><Icon size={27} color="#990F2E"/></View><View style={{gap:4,minWidth:0}}><Text className="start-stat-label" style={{fontSize:12,color:'#7A8191',fontWeight:'600',textAlign:'center'}}>{label}</Text><Text className="start-stat-value" style={{fontFamily:displayFont,fontSize:22,lineHeight:28,fontWeight:'700',color:'#101521',textAlign:'center'}}>{value}</Text></View></View>)}</View>
        <View className="start-rules" style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E4DCD0',borderRadius:13,paddingHorizontal:20,paddingTop:15,paddingBottom:12,marginBottom:10}}>
          <Text className="start-rules-title" style={{fontFamily:displayFont,fontSize:29,lineHeight:36,fontWeight:'700',color:'#101521',marginBottom:12}}>Тест ережелері</Text>
          {rules.map(({title,text,Icon,color,bg})=><View key={title} className="start-rule" style={{flexDirection:'row',alignItems:'center',gap:20,paddingVertical:12,borderTopWidth:1,borderTopColor:'#EAE4DC'}}><View className="start-rule-icon" style={{width:54,height:52,borderRadius:12,backgroundColor:bg,alignItems:'center',justifyContent:'center'}}><Icon size={29} color={color}/></View><View style={{flex:1,minWidth:0}}><Text style={{fontSize:16,fontWeight:'700',color:'#172034',marginBottom:4}}>{title}</Text><Text style={{fontSize:13,lineHeight:20,color:'#7A8191'}}>{text}</Text></View></View>)}
          <View style={{flexDirection:'row',alignItems:'flex-start',gap:10,borderTopWidth:1,borderTopColor:'#EAE4DC',paddingTop:11}}><Info size={17} color="#9A8C79"/><Text style={{flex:1,fontSize:13,lineHeight:20,color:'#7A8191'}}>{test.exam_mode?'ЖИ кеңестері өшірулі. Жауаптар емтихан барлығына аяқталғаннан кейін ашылады.':'Жаттығу режимі: ЖИ кеңестері мен жауаптарды талдау қолжетімді.'}</Text></View>
          {helpOpen&&<View accessibilityLiveRegion="polite" style={{marginTop:13,padding:13,borderRadius:9,backgroundColor:'#F9F5ED',gap:6}}><Text style={{fontSize:14,fontWeight:'600',color:'#62574B'}}>Бастамас бұрын</Text><Text style={{fontSize:13,lineHeight:21,color:'#7A8191'}}>Қажет емес терезелерді жауып, құрылғыны қуат көзіне қосыңыз. Браузер оқиғалары өздігінен көшірудің дәлелі емес.{test.exam_mode?' Толық экран қолжетімсіз болса, бұл бұзушылық ретінде саналмайды.':''}</Text></View>}
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={()=>router.push(`/test/${test.id}/take`)} style={{backgroundColor:'#990F2E',minHeight:51,paddingVertical:13,borderRadius:11,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,marginBottom:9}}><Text style={{fontSize:19,fontWeight:'700',color:'#FFF'}}>Тестті бастау</Text><ArrowRight size={23} color="#FFF"/></TouchableOpacity>
        <View style={{flexDirection:'row',alignItems:'flex-start',gap:9}}><Info size={16} color="#9A8C79"/><Text style={{flex:1,fontSize:11,lineHeight:17,color:'#9A8C79'}}>Бастау түймесін басу арқылы бағалау шарттарымен келісесіз.</Text></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
