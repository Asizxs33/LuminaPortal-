import { useRouter } from 'expo-router';
import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, CheckCircle2, Target, FileClock, BarChart3, ArrowRight, Clock3, FileText } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../constants/api';

interface Result {
 id:number; test_id:string; score:number; total:number; completed_at:string; test_title:string; subject:string; percentage?:number; passing_score:number;
}
type Tab='latest'|'subjects'|'history';
const burgundy='#990F2E', muted='#7C879D';
export default function StudentResults(){
 const {user}=useAuth();const router=useRouter();
 const [error,setError]=useState('');const [results,setResults]=useState<Result[]>([]);const [loading,setLoading]=useState(true);const [tab,setTab]=useState<Tab>('latest');
 const fetchResults=async()=>{
  if(!user?.id){setLoading(false);return;}
  setLoading(true);setError('');
  try{const token=await AsyncStorage.getItem('lumina_token');const res=await fetch(`${API}/api/results/user/${user.id}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000)});if(!res.ok)throw Error();const data=await res.json();if(!Array.isArray(data))throw Error();setResults(data);}
  catch{setError('Нәтижелерді жүктеу мүмкін болмады. Байланысты тексеріп, қайта көріңіз.');}
  finally{setLoading(false);}
 };
 useEffect(()=>{void fetchResults();},[user?.id]);
 const pct=(r:Result)=>r.percentage??Math.round(r.score/Math.max(r.total,1)*100);
 const passed=(r:Result)=>pct(r)>=(r.passing_score??50);
 const sorted=[...results].sort((a,b)=>new Date(b.completed_at).getTime()-new Date(a.completed_at).getTime());
 const latest=sorted.filter((r,i,all)=>all.findIndex(other=>other.test_id===r.test_id)===i);
 const avg=results.length?Math.round(results.reduce((sum,r)=>sum+pct(r),0)/results.length):0;
 const subjects=Array.from(new Set(results.map(r=>r.subject||'Жалпы')));
 const stats=[{label:'Орташа ұпай',value:`${avg}%`,Icon:Trophy,color:burgundy,bg:'#FCECF0'},{label:'Аяқталған',value:String(results.length),Icon:CheckCircle2,color:'#008B68',bg:'#E5F9F0'},{label:'Өтті',value:String(results.filter(passed).length),Icon:Target,color:'#AF771A',bg:'#FFF4DD'}];
 const open=(r:Result)=>router.push({pathname:'/test/[id]/result',params:{id:r.test_id,resultId:String(r.id)}});
 if(loading)return <SafeAreaView style={{flex:1,backgroundColor:'#FCFAF7',alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={burgundy}/><Text style={{fontSize:13,color:muted,marginTop:12}}>Нәтижелер жүктелуде…</Text></SafeAreaView>;
 return <SafeAreaView className="student-results-page" style={{flex:1,backgroundColor:'#FCFAF7'}}>
  <ScrollView contentContainerStyle={{paddingBottom:28}}>
   <View className="student-results-campus" pointerEvents="none" style={{display:'none',position:'absolute',top:0,right:0,width:'78%',height:245,overflow:'hidden'}}><Image source={require('../../assets/campus-header.png')} resizeMode="cover" style={{width:'100%',height:'100%'}}/>{Platform.OS==='web'&&<View style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(90deg,#FCFAF7 0%,rgba(252,250,247,.6) 27%,rgba(252,250,247,.04) 73%),linear-gradient(0deg,#FCFAF7 0%,rgba(252,250,247,0) 70%)'} as any}/>}</View>
   <View className="student-results-content" style={{padding:20}}>
    <Text style={{fontSize:13,color:muted,marginBottom:13}}>Студент кабинеті  /  Нәтижелер</Text>
    <Text className="student-results-title" style={{fontFamily:displayFont,fontSize:37,lineHeight:45,fontWeight:'700',color:'#101521'}}>Нәтижелерім</Text>
    <Text className="student-results-subtitle" style={{fontSize:15,lineHeight:23,color:muted,marginTop:5,marginBottom:22}}>Оқу нәтижелеріңіз бен ілгерілеуіңіз</Text>
    <View style={{flexDirection:'row',gap:12,marginBottom:18}}>{stats.map(({label,value,Icon,color,bg})=><View className="student-result-kpi" key={label} style={{flex:1,minWidth:0,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E6E0D8',borderRadius:13,padding:12,gap:10}}><View className="student-result-kpi-icon" style={{width:43,height:43,borderRadius:30,backgroundColor:bg,alignItems:'center',justifyContent:'center'}}><Icon size={25} color={color} strokeWidth={1.7}/></View><View style={{minWidth:0}}><Text className="student-result-kpi-value" style={{fontFamily:displayFont,fontSize:27,lineHeight:33,fontWeight:'700',color:'#101521'}}>{error?'—':value}</Text><Text className="student-result-kpi-label" style={{fontSize:11,lineHeight:17,color:muted,marginTop:4}}>{label}</Text></View></View>)}</View>
    <View className="student-results-panel" style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E6E0D8',borderRadius:13,paddingHorizontal:18,paddingTop:6,paddingBottom:18}}>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{flexGrow:1}} style={{flexGrow:0}}><View accessibilityRole="tablist" style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#E8E2DA',minWidth:'100%'}}>{([{key:'latest',label:'Соңғы нәтижелер'},{key:'subjects',label:'Пәндер бойынша ілгерілеу'},{key:'history',label:'Әрекеттер тарихы'}] as const).map(item=><TouchableOpacity accessibilityRole="tab" accessibilityState={{selected:tab===item.key}} onPress={()=>setTab(item.key)} key={item.key} style={{paddingHorizontal:15,paddingVertical:18,borderBottomWidth:2,borderBottomColor:tab===item.key?burgundy:'transparent'}}><Text style={{fontSize:14,fontWeight:'600',color:tab===item.key?burgundy:muted}}>{item.label}</Text></TouchableOpacity>)}</View></ScrollView>
     {error?<View style={{paddingVertical:38,gap:16,alignItems:'center'}}><Text accessibilityRole="alert" style={{fontSize:14,lineHeight:23,color:burgundy,textAlign:'center'}}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={fetchResults} style={{padding:12}}><Text style={{color:burgundy,fontSize:14,fontWeight:'600'}}>Қайта жүктеу</Text></TouchableOpacity></View>:!results.length?<>
      <View className="student-results-empty" style={{alignItems:'center',paddingTop:30,paddingBottom:26,paddingHorizontal:12}}><View className="student-empty-icon" style={{width:96,height:96,borderRadius:50,backgroundColor:'#F8F3EA',alignItems:'center',justifyContent:'center',marginBottom:15}}><FileClock size={50} color={burgundy} strokeWidth={1.3}/></View><Text className="student-empty-title" style={{fontFamily:displayFont,fontSize:28,lineHeight:36,fontWeight:'700',color:'#101521',textAlign:'center'}}>Нәтижелер әлі жоқ</Text><Text style={{fontSize:14,lineHeight:22,color:muted,textAlign:'center',marginTop:7,marginBottom:18}}>Тестті тапсырғаннан кейін нәтижелеріңіз осы жерде көрсетіледі.</Text><TouchableOpacity accessibilityRole="button" onPress={()=>router.push('/(student)/dashboard')} style={{minHeight:46,minWidth:212,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:20,paddingHorizontal:25,borderRadius:9,backgroundColor:burgundy}}><Text style={{fontSize:15,fontWeight:'600',color:'#FFF'}}>Тесттерге өту</Text><ArrowRight size={22} color="#FFF"/></TouchableOpacity></View>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:15,borderTopWidth:1,borderTopColor:'#E8E2DA',paddingTop:19,paddingHorizontal:10}}><BarChart3 size={23} color={muted}/><Text style={{flexShrink:1,fontSize:13,lineHeight:21,color:muted}}>Алғашқы нәтиже пайда болғанда, ілгерілеуіңізді бақылай аласыз.</Text></View>
     </>:tab==='subjects'?<View style={{paddingVertical:18,gap:14}}>{subjects.map(subject=>{
       const history=sorted.filter(r=>(r.subject||'Жалпы')===subject);const current=history[0],first=history[history.length-1];const change=pct(current)-pct(first);
       return <View key={subject} style={{padding:18,borderWidth:1,borderColor:'#E7E0D6',borderRadius:10,gap:9}}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12}}><Text style={{fontFamily:displayFont,fontSize:23,fontWeight:'700',color:'#101521'}}>{subject}</Text><Text style={{color:burgundy,fontSize:20,fontWeight:'600'}}>{pct(current)}%</Text></View><Text style={{color:muted,fontSize:13,lineHeight:21}}>{history.length} әрекет · Соңғы нәтиже{history.length>1?` · Алғашқы әрекетпен салыстырғанда ${change>=0?'+':''}${change}%`:''}</Text><View style={{height:7,borderRadius:4,backgroundColor:'#EEECE9',overflow:'hidden'}}><View style={{height:'100%',width:`${Math.max(0,Math.min(100,pct(current)))}%`,backgroundColor:burgundy,borderRadius:4}}/></View></View>;
      })}</View>:<View style={{paddingTop:16}}>{(tab==='latest'?latest:sorted).map(r=><TouchableOpacity accessibilityRole="button" accessibilityLabel={`${r.test_title}: нәтиже #${r.id}`} key={r.id} onPress={()=>open(r)} style={{flexDirection:'row',alignItems:'center',gap:14,paddingVertical:17,borderBottomWidth:1,borderBottomColor:'#EEE8E0'}}><View style={{width:43,height:43,borderRadius:10,backgroundColor:'#FCECF0',alignItems:'center',justifyContent:'center'}}><FileText size={23} color={burgundy}/></View><View style={{flex:1,minWidth:0,gap:5}}><Text style={{fontFamily:displayFont,fontSize:23,fontWeight:'700',color:'#101521'}}>{r.test_title}</Text><Text style={{fontSize:12,color:muted}}>{r.subject}</Text><View style={{flexDirection:'row',alignItems:'center',gap:6}}><Clock3 size={13} color="#8D97A7"/><Text style={{fontSize:11,lineHeight:18,color:'#8D97A7'}}>{new Date(r.completed_at).toLocaleString('ru-RU')} · {r.score}/{r.total} ұпай</Text></View></View><View style={{gap:4,alignItems:'center',padding:9,borderRadius:8,backgroundColor:passed(r)?'#E8F8F0':'#FCECF0'}}><Text style={{fontSize:17,fontWeight:'600',color:passed(r)?'#008B68':burgundy}}>{pct(r)}%</Text><Text style={{fontSize:11,color:passed(r)?'#008B68':burgundy}}>{passed(r)?'Өтті':'Өтпеді'}</Text></View><ArrowRight size={18} color={burgundy}/></TouchableOpacity>)}</View>}
    </View>
   </View>
  </ScrollView>
 </SafeAreaView>;
}
