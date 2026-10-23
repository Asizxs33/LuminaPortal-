import { confirmAction } from '../../../../lib/confirmAction';
import { notify } from '../../../../lib/notify';
import ExamControls from '../../../../components/ExamControls';
import { useLocalDraft } from '../../../../hooks/useLocalDraft';
import { useAuth } from '../../../../context/AuthContext';
import TestPreview from '../../../../components/TestPreview';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, ArrowLeft, Trash2, Edit2, Code2, List, Save, X, Terminal, Upload, Download, Eye, Search, CloudCheck, Copy, ChevronLeft, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { displayFont } from '../../../../theme';
import { API } from '../../../constants/api';

interface Option {
  text: string;
  is_correct: boolean;
}

interface TestCase {
  input: string;
  expected_output: string;
}

interface Question {
  id?: number;
  type: 'MULTIPLE_CHOICE' | 'CODE';
  text: string;
  options?: Option[];
  initial_code?: string;
  image_url?: string;
  test_cases?: TestCase[];
  order_index?: number;
}

interface TestDetail {
  id: string;
  title: string;
  questions: Question[];
}

export default function TestEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [preview, setPreview] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [mobilePanel, setMobilePanel] = useState<'questions' | 'exam'>('questions');
  const [changes, setChanges] = useState<Record<string, Question>>({});
  const inlineDraft = useLocalDraft(user ? `editor-inline:${user.id}:${id}` : null, changes, saved => setChanges(saved || {}));
  useEffect(() => { setPage(0); }, [search]);

  // Modals
  const [showMCModal, setShowMCModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const fileInputRef = useRef<any>(null);
  const mcImageInputRef = useRef<any>(null);
  const codeImageInputRef = useRef<any>(null);

  // MC Form State
  const [mcText, setMcText] = useState('');
  const [mcImageUrl, setMcImageUrl] = useState('');
  const [mcOptions, setMcOptions] = useState<Option[]>([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  // Code Form State
  const [codeText, setCodeText] = useState('');
  const [codeImageUrl, setCodeImageUrl] = useState('');
  const [codeInitial, setCodeInitial] = useState('');
  const [codeTestCases, setCodeTestCases] = useState<TestCase[]>([{ input: '', expected_output: '' }]);

  const draft = useLocalDraft(user ? `question-draft:${user.id}:${id}` : null, {mcText,mcImageUrl,mcOptions,codeText,codeImageUrl,codeInitial,codeTestCases,editingId}, saved => {setMcText(saved.mcText);setMcImageUrl(saved.mcImageUrl);setMcOptions(saved.mcOptions);setCodeText(saved.codeText);setCodeImageUrl(saved.codeImageUrl);setCodeInitial(saved.codeInitial);setCodeTestCases(saved.codeTestCases);setEditingId(saved.editingId);});

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const res = await fetch(`${API}/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data=await res.json();if(data.can_manage===false){router.replace(`/test/${id}/results` as any);return;}setTest(data);
      } else {
        notify.error('Тест табылмады');
        router.back();
      }
    } catch (e) {
      console.error(e);
      setFormError('Серверге қосылу сәтсіз болды. Жоба сақталды.');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    const remove = async () => {
      try {
        const token = await AsyncStorage.getItem('lumina_token');
        const res = await fetch(`${API}/api/questions?id=${questionId}`, {method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
        if (!res.ok) throw new Error();
        setChanges(prev => { const next = {...prev}; delete next[questionId]; return next; });
        await fetchTest();
      } catch { setFormError('Сұрақты өшіру мүмкін болмады. Қайта көріңіз.'); }
    };
    if (Platform.OS === 'web') { if (await confirmAction('Бұл сұрақты өшіргіңіз келетініне сенімдісіз бе?')) void remove(); }
    else Alert.alert('Сұрақты өшіру', 'Бұл сұрақты өшіргіңіз келетініне сенімдісіз бе?', [{text:'Бас тарту',style:'cancel'},{text:'Өшіру',style:'destructive',onPress:remove}]);
  };

  const saveMultipleChoice = async () => {
    if (!mcText.trim() || mcOptions.some(o => !o.text.trim())) {
      setFormError('Сұрақ пен барлық жауап нұсқаларын толтырыңыз.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const payload: Question = {
        type: 'MULTIPLE_CHOICE',
        text: mcText,
        image_url: mcImageUrl || undefined,
        options: mcOptions,
        test_id: id as unknown
      } as any;

      const res = await fetch(`${API}/api/questions${editingId ? `?id=${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingId !== null) setChanges(prev => { const next = {...prev}; delete next[editingId]; return next; });
        notify.success('Сұрақ сақталды');
        setShowMCModal(false);
        setEditingId(null);
        resetMCForm();
        fetchTest();
      } else {
        setFormError('Сақтау мүмкін болмады. Қайта көріңіз.');
      }
    } catch (e) {
      setFormError('Серверге қосылу сәтсіз болды. Жоба сақталды.');
    } finally {
      setSaving(false);
    }
  };

  const saveCodeQuestion = async () => {
    if (!codeText.trim() || !codeTestCases.length || codeTestCases.some(tc => !tc.expected_output.trim())) {
      setFormError('Сұрақты және күтілетін нәтижені толтырыңыз.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      const payload: Question = {
        type: 'CODE',
        text: codeText,
        image_url: codeImageUrl || undefined,
        initial_code: codeInitial,
        test_cases: codeTestCases,
        test_id: id as unknown
      } as any;

      const res = await fetch(`${API}/api/questions${editingId ? `?id=${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingId !== null) setChanges(prev => { const next = {...prev}; delete next[editingId]; return next; });
        notify.success('Сұрақ сақталды');
        setShowCodeModal(false);
        setEditingId(null);
        resetCodeForm();
        fetchTest();
      } else {
        setFormError('Сақтау мүмкін болмады. Қайта көріңіз.');
      }
    } catch (e) {
      setFormError('Серверге қосылу сәтсіз болды. Жоба сақталды.');
    } finally {
      setSaving(false);
    }
  };

  const resetMCForm = () => {
    setMcText('');
    setMcImageUrl('');
    setMcOptions([
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]);
  };

  const resetCodeForm = () => {
    setCodeText('');
    setCodeImageUrl('');
    setCodeInitial('');
    setCodeTestCases([{ input: '', expected_output: '' }]);
  };

  // --- EXCEL / CSV IMPORT (web only) ---
  const downloadTemplate = () => {
    const csv = [
      'question,option_a,option_b,option_c,option_d,correct',
      '2+2 нешеге тең?,3,4,5,6,B',
      'Қазақстанның астанасы?,Алматы,Астана,Шымкент,Тараз,B',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): { text: string; options: { text: string; is_correct: boolean }[] }[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions: { text: string; options: { text: string; is_correct: boolean }[] }[] = [];
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 6) continue;
      const [qText, a, b, c, d, correct] = cols;
      const correctLetter = correct.toUpperCase();
      questions.push({
        text: qText,
        options: [
          { text: a, is_correct: correctLetter === 'A' },
          { text: b, is_correct: correctLetter === 'B' },
          { text: c, is_correct: correctLetter === 'C' },
          { text: d, is_correct: correctLetter === 'D' },
        ],
      });
    }
    return questions;
  };

  const handleFileImport = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const text = await file.text();
    let questions = parseCSV(text);

    if (questions.length === 0) {
      notify.error('Файлда сұрақтар табылмады немесе формат дұрыс емес. Шаблонды жүктеп алыңыз.');
      setImporting(false);
      return;
    }

    let ok = 0;
    let fail = 0;
    const token = await AsyncStorage.getItem('lumina_token');

    for (const q of questions) {
      try {
        const res = await fetch(`${API}/api/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: 'MULTIPLE_CHOICE', text: q.text, options: q.options, test_id: id }),
        });
        if (res.ok) ok++; else fail++;
      } catch { fail++; }
    }

    setImportResult({ ok, fail });
    setImporting(false);
    fetchTest();
    // Reset the file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const editQuestion = (q: Question, duplicate = false) => {
    setEditingId(duplicate ? null : q.id!); setFormError('');
    if (q.type === 'CODE') { setCodeText(q.text); setCodeInitial(q.initial_code || ''); setCodeImageUrl(q.image_url || ''); setCodeTestCases(q.test_cases || []); setShowCodeModal(true); }
    else { setMcText(q.text); setMcImageUrl(q.image_url || ''); setMcOptions((q.options || []).map(o => ({...o}))); setShowMCModal(true); }
  };
  const changeQuestion = (q: Question, patch: Partial<Question>) => setChanges(prev => ({...prev, [q.id!]: {...q, ...prev[q.id!], ...patch}}));
  const saveInline = async () => {
    if (saving || !inlineDraft.ready) return;
    const pending = Object.values(changes);
    if (!pending.length) { notify.success('Барлық өзгеріс сақталған'); return; }
    if (pending.some(q => !q.text.trim() || (q.type === 'MULTIPLE_CHOICE' && (!q.options?.length || q.options.some(o => !o.text.trim()) || q.options.filter(o => o.is_correct).length !== 1)))) {
      setFormError('Сұрақ пен жауаптарды толтырып, бір дұрыс жауапты таңдаңыз.'); return;
    }
    setSaving(true); setFormError('');
    try {
      const token = await AsyncStorage.getItem('lumina_token');
      for (const q of pending) {
        const res = await fetch(`${API}/api/questions?id=${q.id}`, {method:'PATCH', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({...q,test_id:id}), signal:AbortSignal.timeout(20000)});
        if (!res.ok) throw Error();
        setChanges(prev => { const next = {...prev}; delete next[q.id!]; return next; });
      }
      await fetchTest(); notify.success('Өзгерістер сақталды');
    } catch { setFormError('Кейбір өзгерістер сақталмады. Жоба құрылғыда қалды — қайта сақтап көріңіз.'); }
    finally { setSaving(false); }
  };

  if (loading || !test) return <SafeAreaView style={{flex:1,backgroundColor:'#FCFAF7',justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color="#990F2E"/></SafeAreaView>;
  const questions = (test.questions || []).map((q, index) => ({q: changes[q.id!] || q, index})).filter(({q}) => !search.trim() || q.text.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const pageCount = Math.max(1, Math.ceil(questions.length / 8));
  const activePage = Math.min(page,pageCount-1);
  const field = {borderWidth:1,borderColor:'#DDE0E5',borderRadius:9,backgroundColor:'#FFF',color:'#182032',fontSize:14,paddingHorizontal:13,paddingVertical:10};
  const action = {flexDirection:'row' as const,alignItems:'center' as const,justifyContent:'center' as const,gap:9,minHeight:43,paddingHorizontal:17,borderRadius:9,borderWidth:1};
  return (
    <SafeAreaView className="question-editor" style={{flex:1,backgroundColor:'#FCFAF7'}} edges={['top','left','right']}>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:40}}>
        <View className="editor-header" style={{gap:16,marginBottom:20}}>
          <View style={{flex:1}}><Text style={{fontSize:13,color:'#778093',marginBottom:10}}>Тесттер  /  {test.title}  /  <Text style={{color:'#990F2E'}}>Редактор</Text></Text><Text className="editor-title" style={{fontFamily:displayFont,fontSize:38,lineHeight:43,fontWeight:'700',color:'#101521'}}>{test.title}</Text><Text style={{color:'#748096',fontSize:15,marginTop:3}}>Сұрақтар редакторы</Text></View>
          <View style={{gap:12,alignItems:'flex-end'}}><View style={{flexDirection:'row',gap:7,alignItems:'center'}}><CloudCheck size={17} color="#7C8491"/><Text style={{fontSize:12,color:'#7C8491'}}>{Object.keys(changes).length ? inlineDraft.status || 'Жоба сақталуда…' : draft.status || 'Жоба құрылғыда сақталады'}</Text></View><View style={{flexDirection:'row',gap:10}}><TouchableOpacity accessibilityRole="button" onPress={()=>setPreview(true)} style={[action,{borderColor:'#990F2E',backgroundColor:'#FFF'}]}><Eye size={20} color="#990F2E"/><Text style={{color:'#990F2E',fontWeight:'600'}}>Алдын ала қарау</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" disabled={saving || !inlineDraft.ready} onPress={saveInline} style={[action,{borderColor:'#990F2E',backgroundColor:'#990F2E',opacity:saving ? .6 : 1}]}><Save size={19} color="#FFF"/><Text style={{color:'#FFF',fontWeight:'600'}}>{saving?'Сақталуда…':'Сақтау'}</Text></TouchableOpacity></View></View>
        </View>
        {!!formError && !showMCModal && !showCodeModal && <Text accessibilityRole="alert" style={{color:'#990F2E',marginBottom:14,lineHeight:21}}>{formError}</Text>}
        <View className="editor-mobile-tabs" style={{flexDirection:'row',gap:10,marginBottom:15}}>{([{key:'questions',label:'Сұрақтар'},{key:'exam',label:'Бақылау'}] as const).map(tab=><TouchableOpacity key={tab.key} accessibilityRole="button" accessibilityState={{selected:mobilePanel===tab.key}} onPress={()=>setMobilePanel(tab.key)} style={{flex:1,padding:12,alignItems:'center',borderBottomWidth:2,borderBottomColor:mobilePanel===tab.key?'#990F2E':'#E5E0DA'}}><Text style={{fontSize:14,fontWeight:'600',color:mobilePanel===tab.key?'#990F2E':'#7B8497'}}>{tab.label}</Text></TouchableOpacity>)}</View>
        <View className="editor-columns" style={{gap:16}}>
          <View className={`editor-questions ${mobilePanel!=='questions'?'editor-hide-mobile':''}`} style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E6E3DF',borderRadius:13,padding:15,minWidth:0}}>
            <View className="editor-list-header" style={{gap:12,marginBottom:17}}><View style={{flexDirection:'row',alignItems:'center',gap:14}}><Text style={{fontFamily:displayFont,fontSize:27,fontWeight:'700',color:'#101521'}}>Сұрақтар</Text><Text style={{fontSize:13,color:'#748096'}}>{test.questions?.length || 0} сұрақ</Text></View><View className="editor-search" style={{flexDirection:'row',alignItems:'center',gap:9,borderWidth:1,borderColor:'#DDE0E5',borderRadius:9,paddingHorizontal:12}}><Search size={19} color="#7B8497"/><TextInput accessibilityLabel="Сұрақты іздеу" placeholder="Сұрақты іздеу" placeholderTextColor="#8B93A2" value={search} onChangeText={setSearch} style={{flex:1,minWidth:0,paddingVertical:12,fontSize:13,color:'#253147'}}/></View></View>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:9,paddingBottom:13,marginBottom:13,borderBottomWidth:1,borderBottomColor:'#E5E5E8'}}>
              <TouchableOpacity accessibilityRole="button" onPress={()=>{resetMCForm();setEditingId(null);setFormError('');setShowMCModal(true);}} style={[action,{flexGrow:1,borderColor:'#990F2E',backgroundColor:'#990F2E',paddingHorizontal:10}]}><List size={21} color="#FFF"/><Text style={{fontSize:13,fontWeight:'600',color:'#FFF'}}>+ Тест сұрағы</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={()=>{resetCodeForm();setEditingId(null);setFormError('');setShowCodeModal(true);}} style={[action,{flexGrow:1,borderColor:'#EFD48B',backgroundColor:'#FFF5D5',paddingHorizontal:10}]}><Code2 size={21} color="#926121"/><Text style={{fontSize:13,fontWeight:'600',color:'#926121'}}>+ Код сұрағы</Text></TouchableOpacity>
              {Platform.OS==='web' && <TouchableOpacity accessibilityRole="button" disabled={importing} onPress={()=>fileInputRef.current?.click()} style={[action,{flexGrow:1,borderColor:'#C2DFD3',backgroundColor:'#F4FAF7',paddingHorizontal:10}]}><Upload size={19} color="#3B6957"/><Text style={{fontSize:13,fontWeight:'600',color:'#3B6957'}}>{importing?'Импортталуда…':'Excel / CSV импорт'}</Text></TouchableOpacity>}
            </View>
            {importResult&&<Text style={{color:'#3B6957',fontSize:13,marginBottom:12}}>{importResult.ok} сұрақ қосылды{importResult.fail?` · ${importResult.fail} қате`:''}</Text>}
            {editingId!==null&&<TouchableOpacity accessibilityRole="button" onPress={()=>{if(test.questions.find(q=>q.id===editingId)?.type==='CODE')setShowCodeModal(true);else setShowMCModal(true);}} style={{padding:12,marginBottom:12,backgroundColor:'#FBEFF2',borderRadius:9}}><Text style={{fontSize:13,color:'#990F2E'}}>Сақталған өңдеуді жалғастыру</Text></TouchableOpacity>}
            {!questions.length && <View style={{padding:35,alignItems:'center',gap:8}}><Search size={25} color="#9CA3AF"/><Text style={{color:'#657088',textAlign:'center'}}>{search?'Сұрақ табылмады. Іздеуді өзгертіңіз.':'Алғашқы сұрақты жоғарыдағы батырмамен қосыңыз.'}</Text></View>}
            {questions.slice(activePage*8,activePage*8+8).map(({q,index})=><View key={q.id} style={{borderWidth:1,borderColor:'#E6E3DF',borderRadius:11,padding:14,marginBottom:12}}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><Text style={{color:'#990F2E',backgroundColor:'#FAE9EE',fontWeight:'600',fontSize:12,paddingHorizontal:11,paddingVertical:6,borderRadius:6}}>Сұрақ {index+1}{q.type==='CODE'?' · Код':''}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Сұрақ ${index+1}: толық өңдеу`} disabled={saving} onPress={()=>editQuestion(q)} style={{padding:7}}><Edit2 size={17} color="#7D8799"/></TouchableOpacity></View>
              <Text style={{color:'#7B8599',fontSize:12,marginBottom:6}}>Сұрақ мәтіні</Text>
              <TextInput accessibilityLabel={`Сұрақ ${index+1}: мәтіні`} multiline editable={!saving} value={q.text} onChangeText={text=>changeQuestion(q,{text})} style={[field,{minHeight:52,marginBottom:15,textAlignVertical:'top'}]}/>
              {!!q.image_url&&<Image source={{uri:q.image_url}} style={{height:150,width:'100%',marginBottom:14}} resizeMode="contain"/>}
              {q.type==='MULTIPLE_CHOICE'&&<><Text style={{color:'#7B8599',fontSize:12,marginBottom:8}}>Жауап нұсқалары</Text><View style={{gap:8}}>{q.options?.map((opt,oIdx)=><View key={oIdx} style={{flexDirection:'row',alignItems:'center',gap:10}}><Text style={{width:30,height:30,textAlign:'center',lineHeight:30,color:'#990F2E',backgroundColor:'#FAE9EE',borderRadius:15,fontWeight:'600'}}>{String.fromCharCode(65+oIdx)}</Text><TouchableOpacity accessibilityRole="radio" accessibilityLabel={`Сұрақ ${index+1}: дұрыс жауап ${String.fromCharCode(65+oIdx)}`} accessibilityState={{checked:opt.is_correct}} disabled={saving} onPress={()=>changeQuestion(q,{options:q.options?.map((o,i)=>({...o,is_correct:i===oIdx}))})} style={{padding:4}}><View style={{width:17,height:17,borderRadius:9,borderWidth:1.5,borderColor:opt.is_correct?'#990F2E':'#B6B7BA',alignItems:'center',justifyContent:'center'}}>{opt.is_correct&&<View style={{width:9,height:9,borderRadius:5,backgroundColor:'#990F2E'}}/>}</View></TouchableOpacity><TextInput accessibilityLabel={`Сұрақ ${index+1}: жауап ${String.fromCharCode(65+oIdx)}`} editable={!saving} value={opt.text} onChangeText={text=>changeQuestion(q,{options:q.options?.map((o,i)=>i===oIdx?{...o,text}:o)})} style={[field,{flex:1,minWidth:0,paddingVertical:7,fontSize:13}]}/></View>)}</View></>}
              {q.type==='CODE'&&<View style={{backgroundColor:'#F7F8FA',padding:12,borderRadius:8}}><Text style={{fontFamily:'monospace',fontSize:12,color:'#47536A'}}>{q.initial_code||'// Бастапқы код жоқ'}</Text><Text style={{color:'#7B8599',fontSize:12,marginTop:10}}>{q.test_cases?.length||0} тест-кейс</Text></View>}
              <View style={{flexDirection:'row',justifyContent:'flex-end',flexWrap:'wrap',gap:15,borderTopWidth:1,borderTopColor:'#ECE9E6',marginTop:12,paddingTop:8}}>{!!changes[q.id!]&&<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Сұрақ ${index+1}: өзгерісті болдырмау`} disabled={saving} onPress={()=>setChanges(prev=>{const next={...prev};delete next[q.id!];return next;})} style={{padding:6}}><Text style={{color:'#778298',fontSize:13}}>Болдырмау</Text></TouchableOpacity>}<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Сұрақ ${index+1}: көшіру`} disabled={saving} onPress={()=>editQuestion(q,true)} style={{flexDirection:'row',alignItems:'center',gap:7,padding:6}}><Copy size={17} color="#778298"/><Text style={{color:'#778298',fontSize:13}}>Көшіру</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Сұрақ ${index+1}: жою`} disabled={saving} onPress={()=>deleteQuestion(q.id!)} style={{flexDirection:'row',alignItems:'center',gap:7,padding:6}}><Trash2 size={17} color="#990F2E"/><Text style={{color:'#990F2E',fontSize:13}}>Жою</Text></TouchableOpacity></View>
            </View>)}
            {Platform.OS==='web'&&<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12}}><Text style={{fontSize:11,color:'#8891A1',flex:1}}>CSV пішімі · UTF-8</Text><TouchableOpacity accessibilityRole="button" onPress={downloadTemplate} style={{padding:5,flexDirection:'row',gap:6,alignItems:'center'}}><Download size={14} color="#7D899C"/><Text style={{fontSize:11,color:'#7D899C'}}>Үлгі жүктеу</Text></TouchableOpacity>{/* @ts-ignore */}<input ref={fileInputRef} type="file" accept=".csv,.txt" style={{display:'none'}} onChange={handleFileImport}/></View>}
            {pageCount>1&&<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:15,marginTop:8}}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Алдыңғы бет" disabled={activePage===0} onPress={()=>setPage(activePage-1)} style={{padding:9,opacity:activePage===0 ? .3 : 1}}><ChevronLeft size={20} color="#990F2E"/></TouchableOpacity><Text style={{fontSize:13,color:'#778298'}}>{activePage+1} / {pageCount}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Келесі бет" disabled={activePage>=pageCount-1} onPress={()=>setPage(activePage+1)} style={{padding:9,opacity:activePage>=pageCount-1 ? .3 : 1}}><ChevronRight size={20} color="#990F2E"/></TouchableOpacity></View>}
          </View>
          <View className={`editor-exam ${mobilePanel!=='exam'?'editor-hide-mobile':''}`} style={{minWidth:0}}><ExamControls testId={String(id)}/></View>
        </View>
      </ScrollView>

      <TestPreview visible={preview} onClose={()=>setPreview(false)} title={test.title} questions={(test.questions || []).map(q=>changes[q.id!] || q)}/>
      {/* MULTIPLE CHOICE MODAL */}
      <Modal visible={showMCModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMCModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3EDE4' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#10131B' }}>Тест сұрағын қосу</Text>
            <TouchableOpacity onPress={() => setShowMCModal(false)} style={{ padding: 8, backgroundColor: '#F3EDE4', borderRadius: 12 }}>
              <X size={20} color="#756D70" />
            </TouchableOpacity>
          </View>
          {!!formError && <Text accessibilityRole="alert" style={{padding:16,color:'#990F2E'}}>{formError}</Text>}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 8 }}>Сұрақ мәтіні</Text>
              <TextInput
                multiline
                numberOfLines={3}
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E5ED', borderRadius: 12, padding: 16, color: '#10131B', fontSize: 15, textAlignVertical: 'top', minHeight: 100, marginBottom: 16 }}
                placeholder="Сұрақты осында жазыңыз..."
                value={mcText}
                onChangeText={setMcText}
              />
              
              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 8 }}>Сурет қосу (міндетті емес)</Text>
              {Platform.OS === 'web' && (
                  <View style={{ marginBottom: 24, gap: 8 }}>
                      <TouchableOpacity
                          onPress={() => mcImageInputRef.current?.click()}
                          style={{ backgroundColor: '#F4E6E6', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                          <Upload size={18} color="#800F1D" />
                          <Text style={{ color: '#0369a1', fontWeight: '700', fontSize: 13 }}>{mcImageUrl ? 'Суретті ауыстыру' : 'Сурет таңдау'}</Text>
                      </TouchableOpacity>
                      {/* @ts-ignore */}
                      <input
                          ref={mcImageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => setMcImageUrl(reader.result as string);
                              reader.readAsDataURL(file);
                          }}
                      />
                      {mcImageUrl ? (
                          <View style={{ alignItems: 'center', gap: 6 }}>
                              <Image source={{ uri: mcImageUrl }} style={{ width: '100%', height: 150, borderRadius: 10 }} resizeMode="contain" />
                              <TouchableOpacity onPress={() => setMcImageUrl('')}>
                                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>✕ Суретті өшіру</Text>
                              </TouchableOpacity>
                          </View>
                      ) : null}
                  </View>
              )}

              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 12 }}>Жауап нұсқалары (Дұрыс жауапты таңдаңыз)</Text>
              <View style={{ gap: 12 }}>
                {mcOptions.map((opt, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity 
                      onPress={() => setMcOptions(prev => prev.map((o, i) => ({ ...o, is_correct: i === idx })))}
                      style={{ padding: 4 }}
                    >
                      <View style={{ 
                        height: 24, width: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                        borderColor: opt.is_correct ? '#800F1D' : '#E0E5ED', backgroundColor: opt.is_correct ? '#800F1D' : 'transparent'
                      }}>
                        {opt.is_correct && <View style={{ height: 8, width: 8, backgroundColor: 'white', borderRadius: 4 }} />}
                      </View>
                    </TouchableOpacity>
                    <TextInput 
                      style={{ flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: opt.is_correct ? '#800F1D' : '#E0E5ED', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#10131B' }}
                      placeholder={`${String.fromCharCode(65 + idx)} нұсқасы...`}
                      value={opt.text}
                      onChangeText={(t) => setMcOptions(prev => {
                        const next = [...prev];
                        next[idx].text = t;
                        return next;
                      })}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                disabled={saving}
                onPress={saveMultipleChoice}
                style={{ backgroundColor: '#800F1D', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {saving ? 'Сақталуда...' : 'Сұрақты сақтау'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* CODE QUESTION MODAL */}
      <Modal visible={showCodeModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCodeModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3EDE4' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#10131B' }}>Код сұрағын қосу</Text>
            <TouchableOpacity onPress={() => setShowCodeModal(false)} style={{ padding: 8, backgroundColor: '#F3EDE4', borderRadius: 12 }}>
              <X size={20} color="#756D70" />
            </TouchableOpacity>
          </View>
          {!!formError && <Text accessibilityRole="alert" style={{padding:16,color:'#990F2E'}}>{formError}</Text>}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
              
              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 8 }}>Есептің шарты</Text>
              <TextInput
                multiline
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E5ED', borderRadius: 12, padding: 16, color: '#10131B', fontSize: 15, textAlignVertical: 'top', minHeight: 100, marginBottom: 16 }}
                placeholder="Есептің сипаттамасын жазыңыз..."
                value={codeText}
                onChangeText={setCodeText}
              />
              
              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 8 }}>Сурет қосу (міндетті емес)</Text>
              {Platform.OS === 'web' && (
                  <View style={{ marginBottom: 20, gap: 8 }}>
                      <TouchableOpacity
                          onPress={() => codeImageInputRef.current?.click()}
                          style={{ backgroundColor: '#F4E6E6', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                          <Upload size={18} color="#800F1D" />
                          <Text style={{ color: '#0369a1', fontWeight: '700', fontSize: 13 }}>{codeImageUrl ? 'Суретті ауыстыру' : 'Сурет таңдау'}</Text>
                      </TouchableOpacity>
                      {/* @ts-ignore */}
                      <input
                          ref={codeImageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => setCodeImageUrl(reader.result as string);
                              reader.readAsDataURL(file);
                          }}
                      />
                      {codeImageUrl ? (
                          <View style={{ alignItems: 'center', gap: 6 }}>
                              <Image source={{ uri: codeImageUrl }} style={{ width: '100%', height: 150, borderRadius: 10 }} resizeMode="contain" />
                              <TouchableOpacity onPress={() => setCodeImageUrl('')}>
                                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>✕ Суретті өшіру</Text>
                              </TouchableOpacity>
                          </View>
                      ) : null}
                  </View>
              )}

              <Text style={{ fontWeight: '700', color: '#46393D', marginBottom: 8 }}>Бастапқы код (шаблон)</Text>
              <View style={{ backgroundColor: '#10131B', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  <TextInput
                   multiline
                   autoCapitalize="none"
                   autoCorrect={false}
                   style={{ color: '#E0E5ED', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14, minHeight: 120, padding: 16, textAlignVertical: 'top' }}
                   placeholder="def solve():\n  # Код..."
                   placeholderTextColor="#756D70"
                   value={codeInitial}
                   onChangeText={setCodeInitial}
                 />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', color: '#46393D' }}>Тест-кейстер</Text>
                <TouchableOpacity 
                  onPress={() => setCodeTestCases(prev => [...prev, { input: '', expected_output: '' }])}
                  style={{ backgroundColor: '#F4E6E6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ color: '#800F1D', fontWeight: '800', fontSize: 12 }}>+ Қосу</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 16 }}>
                {codeTestCases.map((tc, idx) => (
                  <View key={idx} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E5ED', borderRadius: 12, padding: 12 }}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                       <Text style={{ color: '#756D70', fontSize: 12, fontWeight: '800' }}>КЕЙС #{idx + 1}</Text>
                       {codeTestCases.length > 1 && (
                         <TouchableOpacity onPress={() => setCodeTestCases(prev => prev.filter((_, i) => i !== idx))}>
                           <Trash2 size={16} color="#ef4444" />
                         </TouchableOpacity>
                       )}
                     </View>
                     <Text style={{ fontSize: 12, color: '#A29792', marginBottom: 4 }}>Кіріс (Аргументтер):</Text>
                     <TextInput 
                       style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E5ED', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, marginBottom: 12 }}
                       placeholder="print(add(2, 5))"
                       value={tc.input}
                       onChangeText={(t) => setCodeTestCases(prev => {
                         const next = [...prev];
                         next[idx].input = t;
                         return next;
                       })}
                     />
                     <Text style={{ fontSize: 12, color: '#A29792', marginBottom: 4 }}>Күтілетін нәтиже (Шығыс):</Text>
                     <TextInput 
                       style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E5ED', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}
                       placeholder="7"
                       value={tc.expected_output}
                       onChangeText={(t) => setCodeTestCases(prev => {
                         const next = [...prev];
                         next[idx].expected_output = t;
                         return next;
                       })}
                     />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                disabled={saving}
                onPress={saveCodeQuestion}
                style={{ backgroundColor: '#800F1D', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {saving ? 'Сақталуда...' : 'Код сұрағын сақтау'}
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
