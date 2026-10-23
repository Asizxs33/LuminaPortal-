import { confirmAction } from '../../lib/confirmAction';
import { notify } from '../../lib/notify';
import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle2, Search, BarChart3, FileText, Trash2, ArrowRight, Info, XCircle, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '../constants/api';

interface Result {
  id: number;
  can_delete?:boolean; language?:string; round_number?:number;
  user_id: number;
  test_id: string;
  score: number;
  total: number;
  passed?: boolean;
  passing_score?: number;
  email?: string;
  completed_at: string;
  student_name: string;
  test_title: string;
}

export default function ResultsDashboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router=useRouter();
  const [filter,setFilter]=useState<'all'|'passed'|'failed'>('all');
  const [loadError,setLoadError]=useState('');
  const [deleting,setDeleting]=useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);setLoadError('');
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(!res.ok)throw Error("Load failed");
      setResults(await res.json());
    } catch (e) {
      setLoadError('Нәтижелерді жүктеу мүмкін болмады. Қайта көріңіз.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    if(results.find(r=>r.id===id)?.can_delete===false)return;
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const deleteSelected = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0 || deleting) return;

    const performDelete = async () => {
      setDeleting(true);
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/results`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ids: idsToDelete })
        });

        if (res.ok) {
          setResults(prev => prev.filter(r => !idsToDelete.includes(r.id)));
          setSelectedIds(new Set());
        } else {
          notify.error('Өшіру сәтсіз аяқталды');
        }
      } catch (e) {
        notify.error('Серверге қосылу мүмкін емес');
      } finally {setDeleting(false);}
    };

    if (Platform.OS === 'web') {
      if (await confirmAction(`Таңдалған ${idsToDelete.length} нәтижені өшіргіңіз келе ме?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Нәтижелерді өшіру',
        `Таңдалған ${idsToDelete.length} нәтижені өшіргіңіз келе ме?`,
        [
          { text: 'Бас тарту', style: 'cancel' },
          { text: 'Өшіру', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const percentage=(r:Result)=>r.total>0?Math.max(0,Math.min(100,r.score/r.total*100)):0;
  const isPassed=(r:Result)=>r.total>0&&percentage(r)>=Number(r.passing_score??70);
  const filtered=results.filter(r=>(filter==='all'||isPassed(r)===(filter==='passed'))&&`${r.student_name||''} ${r.email||''} ${r.test_title||''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const avgScore=results.length?Math.round(results.reduce((sum,r)=>sum+percentage(r),0)/results.length):0;
  const passCount=results.filter(isPassed).length;
  const passRate=results.length?Math.round(passCount/results.length*100):0;
  const allVisibleSelected=filtered.length>0&&filtered.filter(r=>r.can_delete!==false).every(r=>selectedIds.has(r.id));
  const toggleAll=()=>setSelectedIds(previous=>{const next=new Set(previous);filtered.filter(r=>r.can_delete!==false).forEach(r=>allVisibleSelected?next.delete(r.id):next.add(r.id));return next;});
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>Жүктелуде...</Text>
      </SafeAreaView>
    );
  }

  const kpis=[{label:'Орташа ұпай',value:`${avgScore}%`,Icon:BarChart3,bg:'#FDECEF',color:'#9B1230'},{label:'Өту көрсеткіші',value:`${passRate}%`,Icon:CheckCircle2,bg:'#E3FAED',color:'#009C64'},{label:'Тапсырулар',value:String(results.length),Icon:Users,bg:'#FDECEF',color:'#9B1230'},{label:'Өтті',value:String(passCount),Icon:FileText,bg:'#FFF5D8',color:'#9C6512'}];
  const checkbox=(checked:boolean,action:()=>void,label:string,mixed=false)=><TouchableOpacity accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{checked:mixed?'mixed':checked,disabled:deleting}} disabled={deleting} onPress={action} style={{width:30,minHeight:40,alignItems:'center',justifyContent:'center'}}><View style={{width:19,height:19,borderRadius:4,borderWidth:1.5,borderColor:checked?'#940B27':'#D8CDBF',backgroundColor:checked?'#940B27':'#FFF',alignItems:'center',justifyContent:'center'}}>{checked?<Check size={13} color="white"/>:mixed?<View style={{width:10,height:2,backgroundColor:'#940B27'}}/>:null}</View></TouchableOpacity>;
  return <SafeAreaView className="admin-results-page" style={{flex:1,backgroundColor:'#FCFAF7'}}>
    <View className="results-campus" pointerEvents="none" style={{position:'absolute',top:0,left:0,right:0,height:280,overflow:'hidden',display:'none'}}><Image source={require('../../assets/campus-header.png')} resizeMode="cover" style={{position:'absolute',top:0,right:0,width:'86%',height:280,opacity:.7}}/><View style={{position:'absolute',top:0,bottom:0,left:0,right:0,...Platform.select({web:{backgroundImage:'linear-gradient(90deg, #FCFAF7 0%, rgba(252,250,247,.93) 26%, rgba(252,250,247,0) 100%), linear-gradient(180deg, rgba(252,250,247,0) 20%, #FCFAF7 100%)'} as any,default:{backgroundColor:'rgba(252,250,247,.6)'}})}}/></View>
    <ScrollView contentContainerClassName="results-content" contentContainerStyle={{padding:18,paddingTop:24,paddingBottom:32}} keyboardShouldPersistTaps="handled"><View style={{width:'100%',maxWidth:1400,alignSelf:'center'}}>
      <Text style={{fontSize:13,color:'#748096',marginBottom:14}}>Мұғалім кабинеті  /  Нәтижелер</Text><Text className="results-title" style={{fontFamily:displayFont,fontSize:36,lineHeight:44,fontWeight:'700',letterSpacing:-1,color:'#101521'}}>Аналитика</Text><Text className="results-subtitle" style={{fontFamily:displayFont,fontSize:18,lineHeight:26,color:'#778094',marginTop:4,marginBottom:26}}>Нақты нәтижелер мен статистика</Text>
      <View className="results-kpis" style={{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:20}}>{kpis.map(({label,value,Icon,bg,color})=><View className="results-kpi" key={label} style={{flexGrow:1,flexBasis:'45%',minWidth:0,padding:16,borderRadius:14,borderWidth:1,borderColor:'#E8E1DA',backgroundColor:'#FFF'}}><View style={{width:44,height:44,borderRadius:11,backgroundColor:bg,alignItems:'center',justifyContent:'center',marginBottom:12}}><Icon size={27} color={color} strokeWidth={1.8}/></View><Text style={{fontSize:14,color:'#758096',marginBottom:4}}>{label}</Text><Text style={{fontFamily:displayFont,fontSize:34,lineHeight:40,fontWeight:'700',color:'#101521'}}>{value}</Text></View>)}</View>
      <View className="results-panel" style={{backgroundColor:'#FFF',borderRadius:14,borderWidth:1,borderColor:'#E8E1DA',padding:16}}>
        <View className="results-toolbar" style={{gap:16,marginBottom:16}}><View><Text style={{fontFamily:displayFont,fontSize:28,lineHeight:34,fontWeight:'700',color:'#101521'}}>Соңғы тапсырулар</Text><Text style={{color:'#758096',fontSize:14,marginTop:3}}>{results.length} нәтиже</Text></View><View className="results-search" style={{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:14,borderWidth:1,borderColor:'#DADCE3',borderRadius:10,minHeight:46}}><Search size={22} color="#727C8F"/><TextInput accessibilityLabel="Нәтижелерді іздеу" value={search} onChangeText={setSearch} placeholder="Студент немесе тест бойынша іздеу" placeholderTextColor="#8891A2" style={{flex:1,minWidth:0,fontSize:14,color:'#1D2635',paddingVertical:12,...Platform.select({web:{outlineColor:'#940B27'} as any})}}/></View></View>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',borderBottomWidth:1,borderBottomColor:'#EEE8E1',marginBottom:16}}><View style={{flexDirection:'row',gap:14}}>{[{key:'all',label:'Барлығы'},{key:'passed',label:'Өтті'},{key:'failed',label:'Өтпеді'}].map(item=><TouchableOpacity key={item.key} accessibilityRole="button" accessibilityState={{selected:filter===item.key}} onPress={()=>setFilter(item.key as any)} style={{paddingHorizontal:12,paddingVertical:12,borderBottomWidth:2,borderBottomColor:filter===item.key?'#940B27':'transparent'}}><Text style={{fontSize:14,fontWeight:filter===item.key?'700':'400',color:filter===item.key?'#940B27':'#768197'}}>{item.label}</Text></TouchableOpacity>)}</View>{selectedIds.size>0&&<TouchableOpacity accessibilityRole="button" disabled={deleting} onPress={deleteSelected} style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12,minHeight:36,borderRadius:8,backgroundColor:'#FFF0F3',marginBottom:6}}>{deleting?<ActivityIndicator size="small" color="#940B27"/>:<Trash2 size={16} color="#940B27"/>}<Text style={{fontSize:12,color:'#940B27'}}>{selectedIds.size} өшіру</Text></TouchableOpacity>}</View>
        {!!loadError&&<View style={{padding:14,backgroundColor:'#FFF1F3',borderRadius:8,marginBottom:12}}><Text accessibilityRole="alert" style={{color:'#940B27'}}>{loadError}</Text><TouchableOpacity accessibilityRole="button" onPress={fetchResults} style={{paddingTop:12}}><Text style={{color:'#940B27',fontWeight:'700'}}>Қайта жүктеу</Text></TouchableOpacity></View>}
        <View style={{borderWidth:1,borderColor:'#EEE9E3',borderRadius:10,overflow:'hidden'}}>
          <View className="results-table-heading" style={{display:'none',flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'#FAF8F5',paddingHorizontal:12,minHeight:40}}><View style={{flex:1,flexDirection:'row',gap:12,alignItems:'center'}}>{checkbox(allVisibleSelected,toggleAll,'Көрсетілген нәтижелерді таңдау',!allVisibleSelected&&filtered.some(r=>selectedIds.has(r.id)))}<Text style={{fontSize:13,color:'#7C8290'}}>Студент</Text></View><Text style={{width:100,fontSize:13,color:'#7C8290'}}>Тест</Text><Text style={{width:160,fontSize:13,color:'#7C8290'}}>Нәтиже</Text><Text style={{width:112,fontSize:13,color:'#7C8290'}}>Мәртебе</Text><View style={{width:110}}/></View>
          {!filtered.length&&!loadError&&<View style={{padding:36,alignItems:'center',gap:12}}><BarChart3 size={34} color="#C6B6AC"/><Text style={{color:'#858998'}}>Нәтиже табылмады</Text></View>}
          {filtered.map((r,i)=>{const passed=isPassed(r),pct=Math.round(percentage(r));const color=passed?'#008A5B':'#B91436',bg=passed?'#E7F8EF':'#FDECEF';return <View className="results-row" key={r.id} style={{padding:12,gap:14,borderTopWidth:i?1:0,borderTopColor:'#EEE9E3',backgroundColor:selectedIds.has(r.id)?'#FFF7F8':'#FFF'}}>
            <View className="results-person" style={{flexDirection:'row',alignItems:'center',gap:12,minWidth:0}}>{r.can_delete!==false&&checkbox(selectedIds.has(r.id),()=>toggleSelection(r.id),`${r.student_name||'Студент'}: нәтижені таңдау`)}<View style={{width:44,height:44,borderRadius:24,backgroundColor:'#008D7F',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:16,color:'white',fontWeight:'700'}}>{getInitials(r.student_name)}</Text></View><View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{fontSize:15,lineHeight:21,fontWeight:'600',color:'#151C29'}}>{r.student_name||'Белгісіз'}</Text><Text numberOfLines={1} style={{fontSize:12,lineHeight:18,color:'#74829A',marginTop:2}}>{r.email||'—'}</Text></View></View>
            <View className="results-test" style={{flexDirection:'row',alignItems:'center',gap:10}}><View style={{width:32,height:34,borderRadius:8,backgroundColor:'#FFF0F3',alignItems:'center',justifyContent:'center'}}><FileText size={20} color="#990E2C"/></View><Text numberOfLines={2} style={{flex:1,fontSize:13,color:'#66718A'}}>{r.test_title||r.test_id}</Text></View>
            <View className="results-score" style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:7,backgroundColor:bg}}><Text style={{fontSize:14,color,fontWeight:'700'}}>{pct}%</Text></View><View accessibilityRole="progressbar" accessibilityLabel="Нәтиже пайызы" accessibilityValue={{min:0,max:100,now:pct}} style={{flex:1,height:8,borderRadius:8,backgroundColor:'#ECECEF',overflow:'hidden'}}><View style={{width:`${pct}%`,height:8,borderRadius:8,backgroundColor:color}}/></View></View>
            <View className="results-status" style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12}}><View style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,backgroundColor:bg,paddingHorizontal:10,paddingVertical:7,borderRadius:8}}>{passed?<CheckCircle2 size={18} color={color}/>:<XCircle size={18} color={color}/>}<Text style={{fontSize:13,color}}>{passed?'Өтті':'Өтпеді'}</Text></View></View>
            <TouchableOpacity className="results-details" accessibilityRole="button" accessibilityLabel={`${r.student_name||'Студент'}: толық нәтиже`} onPress={()=>router.push(`/test/${r.test_id}/result?resultId=${r.id}` as any)} style={{minHeight:38,paddingHorizontal:12,borderWidth:1,borderColor:'#A5233F',borderRadius:8,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,alignSelf:'flex-end'}}><Text style={{fontSize:13,fontWeight:'600',color:'#940B27'}}>Толығырақ</Text><ArrowRight size={17} color="#940B27"/></TouchableOpacity>
          </View>;})}
        </View>
        <View style={{backgroundColor:'#FAF8F4',borderRadius:9,padding:14,flexDirection:'row',alignItems:'center',gap:12,marginTop:16}}><Info size={19} color="#A16C20"/><Text style={{flex:1,fontSize:13,lineHeight:20,color:'#7D8698'}}>Нәтижелер тест аяқталғаннан кейін көрсетіледі.</Text></View>
        <Text accessibilityLiveRegion="polite" style={{fontSize:13,color:'#9198A6',marginTop:18,marginBottom:2}}>{filtered.length} / {results.length} нәтиже</Text>
      </View>
    </View></ScrollView>
  </SafeAreaView>;
}
