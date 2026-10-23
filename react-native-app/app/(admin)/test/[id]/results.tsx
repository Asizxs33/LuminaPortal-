import ExamControls from '../../../../components/ExamControls';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle2, Search, BarChart3, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { displayFont } from '../../../../theme';
import { API } from '../../../constants/api';

interface Result {
  id:number; user_id:number; test_id:string; score:number; total:number; passed?:boolean; completed_at:string; student_name?:string; email?:string; passing_score?:number;
}
export default function TestGroupResults() {
  const {id}=useLocalSearchParams<{id:string}>();
  const router=useRouter();
  const [results,setResults]=useState<Result[]>([]);
  const [testInfo,setTestInfo]=useState<{title:string;subject:string;passing_score:number;round_number:number;language:string}|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const fetchTestAndResults=async()=>{
    setLoading(true);setError('');
    try {
      const token=await AsyncStorage.getItem('lumina_token');
      const headers={Authorization:`Bearer ${token}`};
      const [testRes,resultRes]=await Promise.all([fetch(`${API}/api/tests/${id}?summary=true`,{headers,signal:AbortSignal.timeout(20000)}),fetch(`${API}/api/results`,{headers,signal:AbortSignal.timeout(20000)})]);
      if(!testRes.ok||!resultRes.ok)throw Error();
      setTestInfo(await testRes.json());
      const data=await resultRes.json();
      setResults(data.filter((r:Result)=>String(r.test_id)===String(id)));
    } catch {setError('Нәтижелерді жүктеу мүмкін болмады. Қайта көріңіз.');}
    finally {setLoading(false);}
  };
  useEffect(()=>{void fetchTestAndResults();},[id]);
  const pct=(r:Result)=>Math.round(r.score/Math.max(r.total,1)*100);
  const passed=(r:Result)=>typeof r.passed==='boolean'?r.passed:r.score/Math.max(r.total,1)*100>=(r.passing_score??testInfo?.passing_score??50);
  const avgScore=results.length?Math.round(results.reduce((sum,r)=>sum+r.score/Math.max(r.total,1)*100,0)/results.length):0;
  const passRate=results.length?Math.round(results.filter(passed).length/results.length*100):0;
  const filtered=results.filter(r=>`${r.student_name||''} ${r.email||''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const emails=Object.fromEntries(results.filter(r=>r.email).map(r=>[String(r.user_id),r.email!])) as Record<string,string>;
  const stats=[{label:'Тапсырулар',value:String(results.length),Icon:Users,color:'#990F2E',bg:'#FCEBF0'},{label:'Өту көрсеткіші',value:`${passRate}%`,Icon:CheckCircle2,color:'#008B6B',bg:'#E5F9F0'},{label:'Орташа балл',value:`${avgScore}%`,Icon:BarChart3,color:'#A56A16',bg:'#FFF5DC'}];
  if(loading)return <SafeAreaView style={{flex:1,backgroundColor:'#FCFAF7',justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color="#990F2E"/><Text style={{marginTop:12,fontSize:13,color:'#7D8AA3'}}>Нәтижелер жүктелуде…</Text></SafeAreaView>;
  return <SafeAreaView className="test-results-page" style={{flex:1,backgroundColor:'#FCFAF7'}} edges={['top','left','right']}>
    <ScrollView contentContainerStyle={{paddingBottom:35}}>
      <View className="test-results-campus" pointerEvents="none" style={{display:'none',position:'absolute',top:0,right:0,width:'75%',height:270,overflow:'hidden'}}><Image source={require('../../../../assets/campus-header.png')} resizeMode="cover" style={{width:'100%',height:'100%'}}/>{Platform.OS==='web'&&<View style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(90deg,#FCFAF7 0%,rgba(252,250,247,.75) 25%,rgba(252,250,247,.03) 72%),linear-gradient(0deg,#FCFAF7 0%,rgba(252,250,247,0) 60%)'} as any}/>}</View>
      <View className="test-results-content" style={{padding:20}}>
        <TouchableOpacity accessibilityRole="button" onPress={()=>router.push('/(admin)/dashboard')} style={{flexDirection:'row',alignItems:'center',gap:10,alignSelf:'flex-start',paddingVertical:3,marginBottom:13}}><ArrowLeft size={20} color="#7C889F"/><Text style={{fontSize:14,color:'#7C889F'}}>Артқа қайту</Text></TouchableOpacity>
        <Text style={{fontSize:13,color:'#7C889F',marginBottom:10}}>Нәтижелер  /  {testInfo?.title||'Тест'}</Text>
        <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:17}}><Text className="test-results-title" style={{fontFamily:displayFont,fontSize:38,lineHeight:45,color:'#101521',fontWeight:'700'}}>{testInfo?.title||'Тест нәтижелері'}</Text>{!!testInfo?.subject&&<Text style={{fontSize:13,fontWeight:'600',color:'#990F2E',backgroundColor:'#FBEAF0',borderRadius:9,paddingHorizontal:14,paddingVertical:8}}>{testInfo.subject}</Text>}</View>
        <Text className="test-results-subtitle" style={{fontFamily:displayFont,fontSize:19,lineHeight:27,color:'#7C889F',marginTop:3,marginBottom:21}}>Тест нәтижелері және емтихан журналы · {testInfo?.round_number||1}-тапсыру · {testInfo?.language?.toUpperCase()}</Text>
        {!!error&&<View style={{backgroundColor:'#FBEAF0',padding:15,borderRadius:10,marginBottom:15,gap:10}}><Text accessibilityRole="alert" style={{fontSize:13,color:'#990F2E',lineHeight:21}}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={fetchTestAndResults}><Text style={{color:'#990F2E',fontWeight:'600'}}>Қайта жүктеу</Text></TouchableOpacity></View>}
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:13,marginBottom:17}}>{stats.map(({label,value,Icon,color,bg})=><View key={label} className="test-results-stat" style={{flexGrow:1,flexBasis:'40%',borderWidth:1,borderColor:'#E6E3DF',borderRadius:12,backgroundColor:'#FFF',padding:16,gap:13}}><View className="test-results-stat-icon" style={{width:51,height:51,borderRadius:11,backgroundColor:bg,alignItems:'center',justifyContent:'center'}}><Icon size={27} color={color}/></View><View><Text className="test-results-stat-label" style={{fontSize:13,color:'#7C889F',marginBottom:5}}>{label}</Text><Text className="test-results-stat-value" style={{fontFamily:displayFont,fontSize:34,lineHeight:39,fontWeight:'700',color:'#101521'}}>{value}</Text></View></View>)}</View>
        <ExamControls testId={String(id)} variant="detailed" participantEmails={emails}/>
        <View style={{marginTop:20,padding:18,borderWidth:1,borderColor:'#E6E3DF',borderRadius:13,backgroundColor:'#FFF'}}>
          <View className="test-results-toolbar" style={{gap:13,marginBottom:16}}><View style={{flex:1}}><Text style={{fontFamily:displayFont,fontSize:26,lineHeight:32,fontWeight:'700',color:'#101521'}}>Барлық нәтижелер</Text><Text style={{fontSize:12,color:'#8B94A3',marginTop:3}}>{filtered.length} нәтиже</Text></View><View className="test-results-search" style={{flexDirection:'row',alignItems:'center',gap:9,borderWidth:1,borderColor:'#DDE0E5',borderRadius:9,paddingHorizontal:12}}><Search size={19} color="#8B94A3"/><TextInput accessibilityLabel="Студентті іздеу" value={search} onChangeText={setSearch} placeholder="Аты немесе email бойынша іздеу" placeholderTextColor="#8B94A3" style={{flex:1,minWidth:0,paddingVertical:12,fontSize:13,color:'#354158'}}/></View></View>
          {!filtered.length?<Text style={{paddingVertical:25,color:'#8B94A3',fontSize:13,textAlign:'center'}}>{search?'Іздеу бойынша нәтиже табылмады.':'Әзірге аяқталған тапсырулар жоқ.'}</Text>:filtered.map(r=><View key={r.id} style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:14,paddingVertical:14,borderTopWidth:1,borderTopColor:'#EDE8E2'}}><View style={{width:39,height:39,borderRadius:20,backgroundColor:'#008F83',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#FFF',fontWeight:'600'}}>{r.student_name?.charAt(0)||'?'}</Text></View><View style={{flex:1,minWidth:145}}><Text style={{fontWeight:'600',fontSize:14,color:'#263247'}}>{r.student_name||'Белгісіз'}</Text><Text style={{fontSize:11,lineHeight:18,color:'#8B94A3',marginTop:3}}>{new Date(r.completed_at).toLocaleString('ru-RU')}</Text></View><View style={{gap:4,alignItems:'flex-end'}}><Text style={{fontSize:12,color:'#7C889F'}}>{r.score} / {r.total}</Text><Text style={{fontSize:14,fontWeight:'600',color:passed(r)?'#008B6B':'#990F2E'}}>{pct(r)}%</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`${r.student_name||'Оқушы'}: нәтиже #${r.id}`} onPress={()=>router.push(`/test/${id}/result?resultId=${r.id}` as any)} style={{padding:11,flexDirection:'row',gap:8,alignItems:'center'}}><Text style={{fontSize:13,color:'#990F2E'}}>Толығырақ</Text><ArrowRight size={17} color="#990F2E"/></TouchableOpacity></View>)}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
