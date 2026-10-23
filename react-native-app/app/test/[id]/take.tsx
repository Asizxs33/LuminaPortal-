import {fullscreenState,requestPageFullscreen} from '../../../lib/fullscreen';
import { displayFont } from '../../../theme';
import { confirmAction } from '../../../lib/confirmAction';
import { usePreventRemove } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, AppState, TextInput, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2, Code2, Terminal, Play, Copy, Flag, CloudCheck, CloudOff, ShieldCheck, ChevronDown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

import { API } from '../../constants/api';

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  type: 'MULTIPLE_CHOICE' | 'CODE';
  text: string;
  initial_code?: string;
  image_url?: string;
  test_cases?: any[];
  options: Option[];
}

interface TestDetail {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  passing_score: number;
  attempt_token: string;
  exam_mode?: boolean;
  exam_attempt_id?:string;
  questions: Question[];
}

export default function TestTake() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const questionScroll = useRef<ScrollView>(null);
  const [navigationOpen,setNavigationOpen]=useState(false);
  const [finishReview, setFinishReview] = useState(false);
  const [syncState, setSyncState] = useState('Жауаптар сақталуда…');
  const [online, setOnline] = useState(true);
  const [visited, setVisited] = useState<number[]>([0]);
  const answerRevision = useRef(0);
  const { user } = useAuth();
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<number, string>>({});
  const [codeStatuses, setCodeStatuses] = useState<Record<number, { status: string, output: string, passed: number, total: number, proof?: string }>>({});
  const [runningCode, setRunningCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [mentorHint, setMentorHint] = useState<string | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [saveNotice, setSaveNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [examGate,setExamGate]=useState(false);
  const [examNotice,setExamNotice]=useState('');
  const [fullScreen,setFullScreen]=useState(false);
  const [fullscreenAvailable,setFullscreenAvailable]=useState(false);
  const [standalone,setStandalone]=useState(false);
  const wasFullscreen=useRef(false);
  const unavailableRecorded=useRef<string|null>(null);
  useEffect(()=>{
    if(Platform.OS!=='web')return;
    const state=fullscreenState(document,window);
    setFullscreenAvailable(state.supported);setFullScreen(state.active);setStandalone(state.standalone);wasFullscreen.current=state.active;
  },[]);
  const examQueue=useRef<Promise<any>>(Promise.resolve());
  const mono=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const [restored, setRestored] = useState(false);
  const deadline = useRef(0);
  const startedAt = useRef(0);
  const submissionId = useRef('');
  const persistQueue = useRef<Promise<void>>(Promise.resolve());
  const storageKey = `attempt-v2:${user?.id}:${id}`;
  const [antiCheatWarnings, setAntiCheatWarnings] = useState(0);

  const appState = useRef(AppState.currentState);
  const hasFinished = useRef(false);
  const lastAlertedWarning = useRef(0);
  const lastWarningTime = useRef(0);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'web') {
      window.alert('Көшірілді!');
    } else {
      Alert.alert('Дайын', 'Мәтін алмасу буферіне көшірілді!');
    }
  };

  useEffect(() => {
    if (user?.id) fetchTest();
    if (user?.id) {
        AsyncStorage.getItem('lumina_token').then(token=>fetch(`${API}/api/users/coins?userId=${user.id}`, {headers:{Authorization:`Bearer ${token}`}}))
            .then(res => res.json())
            .then(data => { if (data.coins !== undefined) setCoins(data.coins); })
            .catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    if(test?.exam_mode)return;
    const handleBlur = () => {
       if (!hasFinished.current && !loading && !submitting) {
          const now = Date.now();
          if (now - lastWarningTime.current > 2000) {
              lastWarningTime.current = now;
              setAntiCheatWarnings(w => w + 1);
          }
       }
    };

    if (Platform.OS === 'web') {
        window.addEventListener('blur', handleBlur);
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (!hasFinished.current && !loading && !submitting) {
        if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
          const now = Date.now();
          if (now - lastWarningTime.current > 2000) {
              lastWarningTime.current = now;
              setAntiCheatWarnings(w => w + 1);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (Platform.OS === 'web') {
          window.removeEventListener('blur', handleBlur);
      }
    };
  }, [loading, submitting,test?.exam_mode]);

  useEffect(() => {
      if(test?.exam_mode)return;
      if (antiCheatWarnings > lastAlertedWarning.current) {
          lastAlertedWarning.current = antiCheatWarnings;
          
          setExamNotice(`Басқа терезеге ауысу тіркелді: ${antiCheatWarnings}/3. Уақыт тоқтамайды.`);
          if (antiCheatWarnings >= 3 && !hasFinished.current && test && !loading && !submitting) handleFinish(true);
      }
  }, [antiCheatWarnings, test, loading, submitting]);

  usePreventRemove(Boolean(test && !loading && !submitting), async ({ data }) => {
    const leave=()=>navigation.dispatch(data.action);
    const message='Жауаптар осы құрылғыда сақталды. Уақыт тоқтамайды. Шығасыз ба?';
    if(Platform.OS==='web'){if(await confirmAction(message))leave();}
    else Alert.alert('Тесттен шығу',message,[{text:'Қалу',style:'cancel'},{text:'Шығу',onPress:leave}]);
  });
  useEffect(()=>{
    if(!test || loading || submitting || hasFinished.current) return;
    const raw=JSON.stringify({test,answers,codeAnswers,codeStatuses,currentQuestionIndex,flagged,visited,deadline:deadline.current,startedAt:startedAt.current,submissionId:submissionId.current,antiCheatWarnings});
    persistQueue.current=persistQueue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(storageKey,raw));
    persistQueue.current.then(()=>setSaveNotice('Жауаптар осы құрылғыда сақталды')).catch(()=>setSaveNotice('Жауаптарды сақтау мүмкін болмады. Бетті жаппаңыз.'));
  },[test,answers,codeAnswers,codeStatuses,currentQuestionIndex,flagged,visited,antiCheatWarnings,loading,submitting,storageKey]);
  useEffect(()=>{
    if(Platform.OS!=='web'||!test||loading)return;
    const warn=(event:BeforeUnloadEvent)=>{if(!hasFinished.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[test,loading]);
  const finishRef=useRef<() => void>(()=>{});
  const timedOut=useRef(false);
  useEffect(()=>{
    if(!test || loading || hasFinished.current)return;
    const tick=()=>{
      const seconds=Math.max(0,Math.ceil((deadline.current-(test.exam_mode?mono():Date.now()))/1000));setTimeLeft(seconds);
      if(!seconds&&!timedOut.current){timedOut.current=true;finishRef.current();}
    };
    tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);
  },[test,loading]);

  const sendExam = (body:any) => {
    examQueue.current=examQueue.current.catch(()=>{}).then(async()=>{
      const token=await AsyncStorage.getItem('lumina_token');
      const response=await fetch(`${API}/api/tests/${id}`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
      const data=await response.json();if(!response.ok)throw Error(data.error);
      deadline.current=mono()+Math.max(0,data.deadline-data.server_now);
      const count=data.events.filter((e:any)=>e.kind!=='fullscreen_unavailable').length;
      setAntiCheatWarnings(count);
      if(body.action==='save' && body.revision===answerRevision.current) setSyncState('Жауаптар серверде сақталды');
      if(body.action==='event') {
        const reasons:Record<string,string>={window_blur:'Басқа терезеге ауысу',hidden:'Бетті жасыру',fullscreen_exit:'Толық экраннан шығу',fullscreen_unavailable:'Толық экран қолжетімсіз'};
        setExamNotice(body.kind==='fullscreen_unavailable'?'Мобильді режим · уақыт пен терезе ауыстыру бақыланады.':`${reasons[body.kind] || 'Оқиға тіркелді'} · ${count}/3. Уақыт тоқтамайды.`);
      }
      if(data.deadline<=data.server_now&&!hasFinished.current)finishRef.current();
    }).catch(()=>setSyncState('Серверге сақталмады. Байланысты тексеріңіз; уақыт тоқтамайды.'));
  };
  const latestExam=useRef<any>({});
  latestExam.current={answers:Object.fromEntries((test?.questions||[]).map((q,i)=>[q.id,answers[i]])),code_answers:Object.fromEntries((test?.questions||[]).map((q,i)=>[q.id,codeAnswers[i]])),code_proofs:Object.fromEntries((test?.questions||[]).map((q,i)=>[q.id,codeStatuses[i]?.proof]))};
  useEffect(()=>{
    if(!test?.exam_attempt_id||loading||submitting)return;
    answerRevision.current++; setSyncState('Жауаптар сақталуда…');
    const save=()=>sendExam({action:'save',revision:answerRevision.current,...latestExam.current});
    const timeout=setTimeout(save,300);const interval=setInterval(save,5000);
    return()=>{clearTimeout(timeout);clearInterval(interval);};
  },[test?.exam_attempt_id,answers,codeAnswers,codeStatuses,loading,submitting]);
  useEffect(()=>{
    if(!test?.exam_attempt_id||loading||submitting||Platform.OS!=='web')return;
    const record=(kind:string)=>sendExam({action:'event',kind,event_id:`${Date.now()}-${Math.random()}`});
    const blur=()=>record('window_blur');
    const hidden=()=>{if(document.hidden)record('hidden');};
    const fullscreen=()=>{const state=fullscreenState(document,window);setFullScreen(state.active);if(wasFullscreen.current&&!state.active)record('fullscreen_exit');wasFullscreen.current=state.active;};
    window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);document.addEventListener('fullscreenchange',fullscreen);document.addEventListener('webkitfullscreenchange',fullscreen);
    if(!fullscreenAvailable&&!standalone&&unavailableRecorded.current!==test.exam_attempt_id){unavailableRecorded.current=test.exam_attempt_id;record('fullscreen_unavailable');}
    return()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('fullscreenchange',fullscreen);document.removeEventListener('webkitfullscreenchange',fullscreen);};
  },[test?.exam_attempt_id,loading,submitting,fullscreenAvailable,standalone]);
  const enterFullscreen=async()=>{
    if(Platform.OS!=='web')return;
    try{
      const state=await requestPageFullscreen(document,window);
      setFullScreen(state.active);wasFullscreen.current=state.active;
      if(!state.active&&!state.supported)setExamNotice('Мобильді режим · уақыт пен терезе ауыстыру серверде бақыланады.');
      if(state.supported&&!state.active)throw Error('Fullscreen did not activate');
    }catch{
      setFullscreenAvailable(false);
      setExamNotice('Браузер толық экранды ашпады. Мобильді режимде жалғастыра аласыз; уақыт пен ауысулар бақыланады.');
    }
  };

  const fetchTest = async (beginExam=false) => {
    try {
      const auth=await AsyncStorage.getItem('lumina_token');
      const metaResponse=await fetch(`${API}/api/tests/${id}`,{headers:{Authorization:`Bearer ${auth}`}});
      const meta=await metaResponse.json();
      if(meta.exam_mode){
        if(!beginExam){setExamGate(true);return;}
        const response=await fetch(`${API}/api/tests/${id}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({action:'begin'})});
        const data=await response.json();if(!response.ok)throw Error(data.error);
        if(data.finished){router.replace({pathname:'/test/[id]/result',params:{id:String(id),resultId:String((await (await fetch(`${API}/api/results`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({test_id:id,submission_id:data.exam_attempt_id,attempt_token:data.attempt_token})})).json()).id)}});return;}
        const choices:Record<number,any>={},codes:Record<number,string>={},proofs:Record<number,any>={};
        data.questions.forEach((q:Question,i:number)=>{choices[i]=data.answers[q.id];codes[i]=data.code_answers[q.id]??q.initial_code??'';if(data.code_proofs[q.id])proofs[i]={proof:data.code_proofs[q.id]};});
        setAnswers(choices);setCodeAnswers(codes);setCodeStatuses(proofs);
        try { const saved=JSON.parse(await AsyncStorage.getItem(storageKey)||'{}');
          if(saved.submissionId===data.exam_attempt_id){setFlagged(saved.flagged||[]);setVisited(saved.visited||[0]);setCurrentQuestionIndex(Math.min(saved.currentQuestionIndex||0,data.questions.length-1));setRestored(true);}
        } catch { /* Server answers remain available if local navigation state cannot be restored. */ }
        setSyncState('Жауаптар серверден қалпына келтірілді');
        deadline.current=mono()+Math.max(0,data.deadline-data.server_now);startedAt.current=data.started_at;submissionId.current=data.exam_attempt_id;
        setTimeLeft(Math.max(0,Math.ceil((data.deadline-data.server_now)/1000)));setTest(data);setExamGate(false);return;
      }
      const raw=await AsyncStorage.getItem(storageKey);
      if(raw) {
        let saved:any;try{saved=JSON.parse(raw);}catch{saved={};}
        if(saved.test?.id===id && saved.test?.attempt_token && saved.deadline && saved.submissionId) {
          setTest(saved.test);setAnswers(saved.answers||{});setCodeAnswers(saved.codeAnswers||{});setCodeStatuses(saved.codeStatuses||{});
          setCurrentQuestionIndex(Math.min(saved.currentQuestionIndex||0,saved.test.questions.length-1));setFlagged(saved.flagged||[]);setVisited(saved.visited||[0]);
          deadline.current=saved.deadline;startedAt.current=saved.startedAt;submissionId.current=saved.submissionId;
          lastAlertedWarning.current=saved.antiCheatWarnings||0;setAntiCheatWarnings(saved.antiCheatWarnings||0);
          setTimeLeft(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));setRestored(true);return;
        }
      }
      const token=await AsyncStorage.getItem('lumina_token');
      const response=await fetch(`${API}/api/tests/${id}?forAttempt=true`,{headers:{Authorization:`Bearer ${token}`}});
      if(!response.ok)throw Error('load');
      const data=await response.json();
      startedAt.current=Date.now();deadline.current=Date.now()+data.duration_minutes*60000;
      submissionId.current=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setTest(data);setTimeLeft(data.duration_minutes*60);
      const initial:Record<number,string>={};data.questions.forEach((q:Question,i:number)=>{if(q.type==='CODE')initial[i]=q.initial_code||'';});setCodeAnswers(initial);
    } catch { setSubmitError('Тестті жүктеу мүмкін болмады. Байланысты тексеріңіз.'); }
    finally {setLoading(false);}
  };

  const handleRunCode = async () => {
      if (!test) return;
      const q = test.questions[currentQuestionIndex];
      const code = codeAnswers[currentQuestionIndex] || q.initial_code;

      setRunningCode(true);
      try {
          const token = await AsyncStorage.getItem('lumina_token');
          const res = await fetch(`${API}/api/execute`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  code: code,
                  language: 'python', // Switched from JS to Python
                  test_id: test.id,
                  question_index: currentQuestionIndex,
                  question_id: q.id
              })
          });

          const data = await res.json();
          setCodeStatuses(prev => ({
              ...prev,
              [currentQuestionIndex]: data
          }));
      } catch (err) {
          Alert.alert('Қате', 'Кодты тексеру мүмкін болмады. Интернетті тексеріңіз.');
      } finally {
          setRunningCode(false);
      }
  };

  const handleAskMentor = async () => {
      if (!test) return;
      const q = test.questions[currentQuestionIndex];
      const code = codeAnswers[currentQuestionIndex] || q.initial_code || '';

      setMentorLoading(true);
      setMentorHint(null);
      try {
          const res = await fetch(`${API}/api/mentor/hint`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization:`Bearer ${await AsyncStorage.getItem('lumina_token')}` },
              body: JSON.stringify({ test_id:id, questionText: q.text, userCode: code, userId: user?.id })
          });
          const data = await res.json();
          if (data.hint) {
              setMentorHint(data.hint);
              if (data.coinsRemaining !== undefined) setCoins(data.coinsRemaining);
          } else if (data.error) {
              Alert.alert('Қате', data.error);
          }
      } catch (err) {
          Alert.alert('Қате', 'ИИ-менторға қосылу мүмкін болмады. Интернетті тексеріңіз.');
      } finally {
          setMentorLoading(false);
      }
  };

  const handleFinish = async (forced = false) => {
    if (!test || !user || submitting || hasFinished.current) return;
    
    hasFinished.current = true;
    setSubmitting(true);

    try {
      await examQueue.current.catch(()=>{});
      const token=await AsyncStorage.getItem('lumina_token');
      const selected:Record<number,any>={},codes:Record<number,string>={},proofs:Record<number,string>={};
      test.questions.forEach((q,i)=>{selected[q.id]=answers[i];codes[q.id]=codeAnswers[i]||'';proofs[q.id]=codeStatuses[i]?.proof||'';});
      const response=await fetch(`${API}/api/results`,{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({test_id:test.id,submission_id:submissionId.current,attempt_token:test.attempt_token,answers:selected,code_answers:codes,code_proofs:proofs,time_spent:Math.floor((Date.now()-startedAt.current)/1000)})});
      const result=await response.json();
      if(!response.ok)throw Error(result.error||'Нәтиже сақталмады.');
      await persistQueue.current.catch(()=>{});await AsyncStorage.removeItem(storageKey);
      router.replace({pathname:'/test/[id]/result',params:{id:test.id,resultId:String(result.id)}});
    } catch(error:any) {
      setSubmitError(error.message||'Нәтиже сақталмады. Жауаптар құрылғыда сақталған. Қайта жіберіңіз.');
      setSubmitting(false);hasFinished.current=false;
    }
  };
  finishRef.current=()=>{void handleFinish(true);};

  const isAnswered = (i:number) => test?.questions[i]?.type === 'CODE'
    ? Boolean(codeAnswers[i]?.trim() && codeAnswers[i] !== (test.questions[i].initial_code || '')) || Boolean(codeStatuses[i]?.proof)
    : answers[i] !== undefined && answers[i] !== null;
  const missing = (test?.questions || []).map((_,i)=>i).filter(i=>!isAnswered(i));
  const confirmFinish = () => setFinishReview(true);
  const goToQuestion = (i:number) => {setNavigationOpen(false);setCurrentQuestionIndex(i);setMentorHint(null);questionScroll.current?.scrollTo({y:0,animated:false});};
  useEffect(()=>{setVisited(v=>v.includes(currentQuestionIndex)?v:[...v,currentQuestionIndex]);},[currentQuestionIndex]);
  useEffect(()=>{
    if(Platform.OS!=='web')return;
    const update=()=>setOnline(navigator.onLine);update();
    window.addEventListener('online',update);window.addEventListener('offline',update);
    return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};
  },[]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading || submitting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#800F1D" />
        <Text style={{ marginTop: 12, color: '#756D70', fontWeight: '600' }}>
          {submitting ? 'Тексерілуде...' : 'Сұрақтар жүктелуде...'}
        </Text>
      </SafeAreaView>
    );
  }

  if(examGate)return <SafeAreaView className="exam-gate" style={{flex:1,justifyContent:'center',padding:24,backgroundColor:'#FCFAF7'}}><View style={{width:'100%',maxWidth:480,alignSelf:'center',padding:24,borderWidth:1,borderColor:'#E6E0D8',borderRadius:20,backgroundColor:'#FFF',gap:16}}><View style={{width:52,height:52,borderRadius:15,backgroundColor:'#FAE9EC',alignItems:'center',justifyContent:'center'}}><ShieldCheck size={29} color="#990F2E"/></View><Text style={{fontFamily:displayFont,fontSize:30,fontWeight:'700',color:'#101521'}}>Емтиханға дайынсыз ба?</Text><Text style={{fontSize:15,lineHeight:23,color:'#707B90'}}>Терезе ауыстыру тіркеледі. 3 бұзушылықтан кейін емтихан аяқталады. Сервердегі уақыт тоқтамайды. ЖИ кеңестері өшірулі.</Text>{!fullscreenAvailable&&!standalone&&<View style={{padding:14,borderRadius:12,backgroundColor:'#F8F1E6',gap:8}}><Text style={{fontSize:14,lineHeight:21,color:'#6F5937'}}>Бұл браузерде толық экран қолжетімсіз. Тест мобильді режимде ашылады. Бұл бұзушылық емес.</Text><Text style={{fontSize:12,lineHeight:19,color:'#807563'}}>iPhone: Safari → Бөлісу → Басты экранға қосу. Сайтты сол белгішеден ашсаңыз, браузер панельдерінсіз пайдалануға болады.</Text></View>}{!!submitError&&<Text accessibilityRole="alert" style={{color:'#990F2E',lineHeight:21}}>{submitError}</Text>}<TouchableOpacity accessibilityRole="button" onPress={async()=>{await enterFullscreen();setLoading(true);await fetchTest(true);}} style={{minHeight:50,alignItems:'center',justifyContent:'center',padding:14,backgroundColor:'#990F2E',borderRadius:12}}><Text style={{color:'white',fontSize:16,fontWeight:'600'}}>{fullscreenAvailable&&!standalone?'Толық экранда бастау':'Емтиханды бастау / жалғастыру'}</Text></TouchableOpacity></View></SafeAreaView>;


  if (!test || !test.questions?.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#10131B', marginBottom: 16 }}>{submitError || 'Сұрақтар жоқ'}</Text>
        {!!submitError && <TouchableOpacity onPress={()=>{setSubmitError('');setLoading(true);void fetchTest();}} style={{padding:14,marginBottom:12}}><Text style={{color:'#990F2E'}}>Қайта жүктеу</Text></TouchableOpacity>}
        <TouchableOpacity onPress={() => router.replace('/(student)/dashboard')} style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#800F1D', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Тақтаға оралу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isCodeQuestion = currentQuestion.type === 'CODE';
  const saveFailed=!online||(test.exam_mode?syncState.includes('сақталмады'):saveNotice.includes('мүмкін болмады'));

  return (
    <SafeAreaView className="test-take-page" style={{ flex: 1, backgroundColor: '#FCFAF7' }} edges={['top', 'left', 'right']}>
      <View className="take-header" style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,borderBottomWidth:1,borderBottomColor:'#E5DDD3',paddingHorizontal:20,paddingVertical:12,backgroundColor:'#FFF'}}>
        <View className="take-brand" style={{flexDirection:'row',alignItems:'center',gap:13,flex:1,minWidth:110}}><View style={{width:43,height:43,borderRadius:10,backgroundColor:'#FAE9EC',alignItems:'center',justifyContent:'center'}}><BookOpen size={25} color="#990F2E"/></View><View style={{flex:1}}><Text style={{fontSize:16,fontWeight:'700',color:'#142034'}} numberOfLines={1}>{test.title}</Text><Text style={{fontSize:12,color:'#7C879D',marginTop:3}}>{test.subject}</Text></View></View>
        <View className="take-sync" accessibilityLiveRegion="polite" style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,maxWidth:360}}>{!saveFailed?<CloudCheck size={21} color="#3E9153"/>:<CloudOff size={21} color="#AD741B"/>}<Text numberOfLines={saveFailed?2:1} style={{fontSize:12,lineHeight:19,color:'#7C879D',flexShrink:1}}>{restored?'Сессия қалпына келтірілді. ':''}{!online?'Байланыс жоқ. Жауаптар құрылғыда сақталады.':test.exam_mode?syncState:saveNotice}</Text></View>
        <View className="take-finish" style={{flex:1,alignItems:'flex-end'}}><TouchableOpacity accessibilityRole="button" onPress={confirmFinish} style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,borderWidth:1,borderColor:'#990F2E',borderRadius:9,paddingHorizontal:17,minHeight:39}}><Flag size={18} color="#990F2E"/><Text style={{fontSize:12,color:'#990F2E',fontWeight:'600'}}>Ерте аяқтау</Text></TouchableOpacity></View>
      </View>
      <View className="take-mobile-toolbar" style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,padding:12,borderBottomWidth:1,borderBottomColor:'#E5DDD3',backgroundColor:'#FFF'}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Clock size={18} color="#AA741B"/><Text style={{fontSize:20,fontWeight:'700',color:timeLeft<300?'#B42336':'#990F2E'}}>{formatTime(timeLeft)}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityState={{expanded:navigationOpen}} onPress={()=>{if(!navigationOpen)questionScroll.current?.scrollTo({y:0,animated:false});setNavigationOpen(!navigationOpen);}} style={{flexDirection:'row',alignItems:'center',gap:8,padding:7}}><Text style={{fontSize:12,color:'#7C879D'}}>Сұрақтар · {currentQuestionIndex+1}/{test.questions.length}</Text><ChevronDown size={18} color="#990F2E"/></TouchableOpacity></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
      <ScrollView ref={questionScroll} style={{flex:1}} contentContainerClassName="take-scroll-content" contentContainerStyle={{padding:20,paddingBottom:24}} keyboardShouldPersistTaps="handled">
       <View className="take-columns" style={{gap:20}}>
        <View className="take-main" style={{minWidth:0}}>
        <Text className="take-breadcrumb" style={{fontSize:12,color:'#7C879D',marginBottom:9}}>Бағалау  /  {test.title}</Text><Text className="take-page-title" style={{fontFamily:displayFont,fontSize:32,lineHeight:40,fontWeight:'700',color:'#101521',marginBottom:7}}>Тест тапсыру</Text>
        {!!submitError && <View style={{backgroundColor:'#FFF0F2',padding:14,borderRadius:10,marginBottom:14}}><Text accessibilityRole="alert" style={{color:'#990F2E'}}>{submitError}</Text><TouchableOpacity accessibilityRole="button" onPress={()=>handleFinish(true)} style={{paddingVertical:12}}><Text style={{color:'#990F2E',fontWeight:'600'}}>Қайта жіберу</Text></TouchableOpacity></View>}
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:12}}><Text style={{color:'#707B90'}}>Сұрақ {currentQuestionIndex+1} / {test.questions.length}</Text><TouchableOpacity accessibilityRole="button" accessibilityState={{selected:flagged.includes(currentQuestionIndex)}} onPress={()=>setFlagged(old=>old.includes(currentQuestionIndex)?old.filter(i=>i!==currentQuestionIndex):[...old,currentQuestionIndex])} style={{flexDirection:'row',alignItems:'center',gap:6,padding:10}}><Flag size={17} color="#990F2E"/><Text style={{color:'#990F2E'}}>{flagged.includes(currentQuestionIndex)?'Белгіленді':'Кейін қарау'}</Text></TouchableOpacity></View>
        {(test.exam_mode || !!examNotice) && <View className="take-exam-notice" style={{padding:14,backgroundColor:'#F8F1E6',borderRadius:10,marginBottom:12,flexDirection:'row',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}><ShieldCheck size={21} color="#AA741B"/><Text style={{color:'#990F2E',lineHeight:21,flex:1,fontSize:13}}>{examNotice || 'Емтихан · уақыт серверде бақыланады'}</Text>{!fullScreen&&fullscreenAvailable&&Platform.OS==='web'&&<TouchableOpacity onPress={()=>enterFullscreen().catch(()=>setExamNotice('Толық экран бұл браузерде қолжетімсіз.'))} style={{paddingVertical:8,width:'100%'}}><Text style={{color:'#990F2E',fontWeight:'600'}}>Толық экранға оралу</Text></TouchableOpacity>}</View>}
        {/* Question Card */}
        <View className="take-question-card" style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E4D9CB', padding: 20, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <View style={{ backgroundColor: isCodeQuestion ? '#fef3c7' : '#F4E6E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: isCodeQuestion ? '#d97706' : '#800F1D', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{currentQuestionIndex + 1}-СҰРАҚ</Text>
            </View>
            <Text style={{ color: '#A29792', fontSize: 12, fontWeight: '700' }}>
              {isCodeQuestion ? 'Код жазу (Олимпиада)' : 'Бірнеше таңдау'}
            </Text>
          </View>

          <Text className="take-question-text" style={{ fontSize: 21, fontWeight: '800', color: '#10131B', marginBottom: currentQuestion.image_url ? 16 : (isCodeQuestion ? 16 : 24), lineHeight: 28 }}>
            {currentQuestion.text}
          </Text>

          {currentQuestion.image_url && (
              <Image 
                source={{ uri: currentQuestion.image_url }} 
                style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: isCodeQuestion ? 16 : 24 }} 
                resizeMode="contain" 
              />
          )}

          {isCodeQuestion ? (
              // CODE IDE UI
              <View style={{ gap: 16 }}>
                 {/* ACMP STYLE INPUT/OUTPUT TABLE */}
                 {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 && (
                     <View style={{ borderWidth: 1, borderColor: '#16a34a', overflow: 'hidden', backgroundColor: 'white', marginBottom: 8 }}>
                         <View style={{ flexDirection: 'row', backgroundColor: '#dcfce7', borderBottomWidth: 1, borderBottomColor: '#16a34a' }}>
                             <Text style={{ width: 40, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12, borderRightWidth: 1, borderRightColor: '#16a34a', textAlign: 'center' }}>№</Text>
                             <Text style={{ flex: 1, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12, borderRightWidth: 1, borderRightColor: '#16a34a' }}>INPUT.TXT</Text>
                             <Text style={{ flex: 1, padding: 8, fontWeight: '800', color: '#166534', fontSize: 12 }}>OUTPUT.TXT</Text>
                         </View>
                         {currentQuestion.test_cases.slice(0, 3).map((tc, idx, arr) => (
                             <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: '#16a34a' }}>
                                 <View style={{ width: 40, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#16a34a' }}>
                                     <Text style={{ color: '#166534', fontSize: 13, fontWeight: '600' }}>{idx + 1}</Text>
                                 </View>
                                 <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: '#16a34a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#10131B' }}>{tc.input}</Text>
                                     <TouchableOpacity onPress={() => copyToClipboard(tc.input)} style={{ padding: 4 }}>
                                         <Copy size={14} color="#166534" />
                                     </TouchableOpacity>
                                 </View>
                                 <View style={{ flex: 1, padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#10131B' }}>{tc.expected_output}</Text>
                                     <TouchableOpacity onPress={() => copyToClipboard(tc.expected_output)} style={{ padding: 4 }}>
                                         <Copy size={14} color="#166534" />
                                     </TouchableOpacity>
                                 </View>
                             </View>
                         ))}
                     </View>
                 )}

                 <View style={{ backgroundColor: '#10131B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#46393D' }}>
                    <View style={{ backgroundColor: '#10131B', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <Code2 size={16} color="#A29792" />
                       <Text style={{ color: '#A29792', fontSize: 12, fontWeight: '800', flex: 1 }}>Python 3.10</Text>
                    </View>
                    <TextInput
                        multiline
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        style={{
                            color: '#DFD2C3',
                            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                            fontSize: 14,
                            minHeight: 180,
                            maxHeight: 500,
                            padding: 16,
                            textAlignVertical: 'top',
                            lineHeight: 22
                        }}
                        value={codeAnswers[currentQuestionIndex]}
                        onChangeText={(text) => {
                            const prevCode = codeAnswers[currentQuestionIndex] || '';
                            if (text.length > prevCode.length && text.endsWith('\n')) {
                                const lines = text.split('\n');
                                const prevLine = lines[lines.length - 2];
                                if (prevLine && prevLine.trim().endsWith(':')) {
                                    const match = prevLine.match(/^\s*/);
                                    const indent = match ? match[0] : '';
                                    setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text + indent + '    ' }));
                                    return;
                                } else if (prevLine) {
                                    const match = prevLine.match(/^\s*/);
                                    const indent = match ? match[0] : '';
                                    if (indent) {
                                        setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text + indent }));
                                        return;
                                    }
                                }
                            }
                            setCodeAnswers(prev => ({ ...prev, [currentQuestionIndex]: text }));
                        }}
                        placeholder="# Кодты осы жерге жазыңыз"
                        placeholderTextColor="#756D70"
                    />
                 </View>

                 <View style={{ gap: 12, flexDirection: 'row' }}>
                     <TouchableOpacity 
                        onPress={handleRunCode}
                        disabled={runningCode}
                        style={{ flex: 1, backgroundColor: runningCode ? '#A29792' : '#800F1D', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                     >
                        {runningCode ? <ActivityIndicator size="small" color="white" /> : <Play size={18} color="white" />}
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{runningCode ? 'Орындалуда...' : 'Кодты тексеру'}</Text>
                     </TouchableOpacity>

                     <TouchableOpacity 
                        onPress={handleAskMentor}
                        disabled={mentorLoading || !!test.exam_mode}
                        style={{ flex: 1, backgroundColor: mentorLoading ? '#c4b5fd' : '#800F1D', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                     >
                        {mentorLoading ? <ActivityIndicator size="small" color="white" /> : <BookOpen size={18} color="white" />}
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
                          {test.exam_mode ? 'Емтиханда өшірулі' : mentorLoading ? 'Ойлануда...' : `Кеңес сұрау ${coins !== null ? `(10 ₿)` : ''}`}
                        </Text>
                     </TouchableOpacity>
                 </View>
                 
                 {coins !== null && (
                     <Text style={{ color: '#756D70', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                         Сіздің балансыңыз: <Text style={{ fontWeight: '800', color: '#d97706' }}>{coins} ₿</Text>
                     </Text>
                 )}

                 {/* Mentor Hint Output */}
                 {mentorHint && (
                     <View style={{ backgroundColor: '#f5f3ff', borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', overflow: 'hidden', marginTop: 8 }}>
                         <View style={{ backgroundColor: '#F4E6E6', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#DFD2C3', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Code2 size={14} color="#800F1D" />
                            <Text style={{ color: '#800F1D', fontSize: 12, fontWeight: '800' }}>AI МЕНТОР</Text>
                         </View>
                         <View style={{ padding: 16 }}>
                             <Text style={{ fontSize: 14, color: '#4c1d95', lineHeight: 22 }}>
                                 {mentorHint}
                             </Text>
                         </View>
                     </View>
                 )}

                 {/* Console Output */}
                 {codeStatuses[currentQuestionIndex] && (
                     <View style={{ backgroundColor: '#FCFAF6', borderRadius: 16, borderWidth: 1, borderColor: '#DFD2C3', overflow: 'hidden', marginTop: 8 }}>
                         <View style={{ backgroundColor: '#F3EDE4', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#DFD2C3', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Terminal size={14} color="#756D70" />
                            <Text style={{ color: '#756D70', fontSize: 12, fontWeight: '800' }}>ТЕСТ НӘТИЖЕСІ</Text>
                         </View>
                         <View style={{ padding: 16 }}>
                             <Text style={{
                                 color: codeStatuses[currentQuestionIndex]?.status === 'PASSED' ? '#059669' : '#dc2626',
                                 fontWeight: '800', fontSize: 16, marginBottom: 8
                             }}>
                                 {codeStatuses[currentQuestionIndex]?.status === 'PASSED' ? '✅ Барлық тесттерден өтті!' : '❌ Қателік табылды'}
                             </Text>
                             {!codeStatuses[currentQuestionIndex]?.status?.includes('PASSED') && (
                                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#756D70', backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DFD2C3' }}>
                                    {codeStatuses[currentQuestionIndex]?.output}
                                </Text>
                             )}
                         </View>
                     </View>
                 )}
              </View>
          ) : (
            // MULTIPLE CHOICE UI
            <View accessibilityRole="radiogroup" accessibilityLabel="Жауап нұсқалары" style={{gap:10}}>{currentQuestion.options?.map((option,idx)=>{
              const selected=answers[currentQuestionIndex]===option.id;const letter=String.fromCharCode(65+idx);
              return <TouchableOpacity className="take-option" key={option.id} accessibilityRole="radio" accessibilityLabel={`${letter}. ${option.text}`} accessibilityState={{checked:selected}} onPress={()=>setAnswers(prev=>({...prev,[currentQuestionIndex]:option.id}))} style={{flexDirection:'row',alignItems:'center',minHeight:51,paddingHorizontal:15,paddingVertical:12,borderWidth:1,borderColor:selected?'#990F2E':'#E0D3C3',borderRadius:9,backgroundColor:selected?'#FBEEF1':'#FFF',gap:16}}>
                <View className="take-option-radio" style={{width:22,height:22,borderWidth:1.5,borderColor:selected?'#990F2E':'#CBBAA5',borderRadius:11,alignItems:'center',justifyContent:'center'}}>{selected&&<View style={{width:12,height:12,borderRadius:6,backgroundColor:'#990F2E'}}/>}</View><Text className="take-option-letter" style={{fontSize:15,color:'#182238',paddingRight:16,borderRightWidth:1,borderRightColor:'#E0D3C3'}}>{letter}</Text><Text className="take-option-text" style={{flex:1,minWidth:0,fontSize:16,lineHeight:23,fontWeight:'600',color:'#182238'}}>{option.text}</Text>
              </TouchableOpacity>;
            })}</View>
          )}

        </View>

        {/* Navigation Buttons */}
        <View className="take-desktop-navigation" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Алдыңғы сұрақ"
            onPress={()=>goToQuestion(currentQuestionIndex-1)}
            disabled={currentQuestionIndex === 0}
            style={{
              flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              backgroundColor: '#F3EDE4', opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}
          >
            <ArrowLeft size={18} color="#756D70" />
            <Text style={{ fontWeight: '800', color: '#756D70' }}>Артқа</Text>
          </TouchableOpacity>

          {isLastQuestion ? (
            <TouchableOpacity 
              onPress={confirmFinish} 
              style={{ flex: 1, paddingVertical: 16, backgroundColor: '#059669', borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontWeight: '800', color: 'white' }}>Аяқтау</Text>
              <CheckCircle2 size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Келесі сұрақ"
              onPress={()=>goToQuestion(currentQuestionIndex+1)}
              style={{ flex: 1, paddingVertical: 16, backgroundColor: '#800F1D', borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontWeight: '800', color: 'white' }}>Келесі</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>

        </View>
        <View className={`take-rail ${navigationOpen?'take-rail-open':''}`} style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E6E0D8',borderRadius:12,padding:17,minWidth:0}}>
          <View className="take-rail-timer" style={{flexDirection:'row',alignItems:'center',gap:17,paddingBottom:18,marginBottom:18,borderBottomWidth:1,borderBottomColor:'#E3D8CA'}}><View style={{width:64,height:64,borderRadius:32,backgroundColor:'#FFF3DE',alignItems:'center',justifyContent:'center'}}><Clock size={39} color="#B07B21" strokeWidth={1.6}/></View><View style={{flex:1}}><Text style={{fontSize:13,color:'#7C879D',fontWeight:'600'}}>Қалған уақыт</Text><Text className="take-timer-value" style={{fontFamily:displayFont,fontSize:44,lineHeight:51,fontWeight:'700',color:timeLeft<300?'#C02B38':'#990F2E'}}>{formatTime(timeLeft)}</Text></View></View>
          <Text style={{fontFamily:displayFont,fontSize:21,lineHeight:28,fontWeight:'700',color:'#101521',marginBottom:14}}>Сұрақтар навигациясы</Text>
          <View className="take-number-grid" style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{test.questions.map((q,i)=><TouchableOpacity className="take-number" key={q.id} accessibilityRole="button" accessibilityState={{selected:i===currentQuestionIndex}} accessibilityLabel={`Сұрақ ${i+1}, ${isAnswered(i)?'жауап берілді':visited.includes(i)?'өткізіліп кетті':'жауап берілмеген'}${flagged.includes(i)?', кейін қарау':''}`} onPress={()=>goToQuestion(i)} style={{flexBasis:'18%',flexGrow:1,minHeight:34,borderRadius:7,borderWidth:flagged.includes(i)?2:1,borderColor:flagged.includes(i)?'#990F2E':'#E0D3C3',backgroundColor:i===currentQuestionIndex?'#990F2E':isAnswered(i)?'#E6F7EF':'#FFF',alignItems:'center',justifyContent:'center',paddingVertical:5}}><Text style={{fontSize:12,color:i===currentQuestionIndex?'#FFF':'#172034'}}>{i+1}{flagged.includes(i)?' ⚑':isAnswered(i)?' ✓':visited.includes(i)?' –':''}</Text></TouchableOpacity>)}</View>
          <View style={{gap:7,marginTop:15}}>{[{label:'Ағымдағы',bg:'#990F2E',border:'#990F2E'},{label:'Жауап берілген',bg:'#E6F7EF',border:'#97C9B0'},{label:'Жауап берілмеген',bg:'#FFF',border:'#CBBAA5'}].map(item=><View key={item.label} style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{width:15,height:15,borderRadius:4,borderWidth:1,borderColor:item.border,backgroundColor:item.bg}}/><Text style={{fontSize:11,color:'#7C879D'}}>{item.label}</Text></View>)}<View style={{flexDirection:'row',alignItems:'center',gap:10}}><Flag size={17} color="#990F2E"/><Text style={{fontSize:11,color:'#7C879D'}}>Кейін қарау</Text></View></View>
          <Text style={{fontSize:11,color:'#7C879D',marginTop:14}}>Жауап берілді: {test.questions.length-missing.length} / {test.questions.length}</Text><View style={{height:5,backgroundColor:'#EEEAE4',borderRadius:3,marginTop:8,overflow:'hidden'}}><View style={{height:'100%',backgroundColor:'#990F2E',width:`${((test.questions.length-missing.length)/test.questions.length)*100}%`}}/></View>
        </View>
       </View>
      </ScrollView>
      <View className="take-mobile-navigation" style={{flexDirection:'row',gap:12,padding:12,paddingBottom:18,backgroundColor:'#FFF',borderTopWidth:1,borderColor:'#E5DDD3'}}><TouchableOpacity accessibilityRole="button" disabled={currentQuestionIndex===0} onPress={()=>goToQuestion(currentQuestionIndex-1)} style={{flex:1,minHeight:44,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#F1EEEA',opacity:currentQuestionIndex===0 ? .5 : 1}}><Text style={{color:'#7C879D',fontWeight:'600'}}>Артқа</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={()=>isLastQuestion?confirmFinish():goToQuestion(currentQuestionIndex+1)} style={{flex:1,minHeight:44,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#990F2E'}}><Text style={{color:'#FFF',fontWeight:'600'}}>{isLastQuestion?'Аяқтау':'Келесі'}</Text></TouchableOpacity></View>
      </KeyboardAvoidingView>
      <Modal visible={finishReview && !submitting} transparent animationType="fade" onRequestClose={()=>setFinishReview(false)}>
        <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:20,backgroundColor:'rgba(23,28,39,.36)'}}><View accessibilityViewIsModal style={{width:'100%',maxWidth:440,maxHeight:'85%',backgroundColor:'white',borderRadius:16,padding:24,gap:16}}>
          <Text accessibilityRole="header" style={{fontSize:22,fontWeight:'700',color:'#10131B'}}>Жауаптарды тексеру</Text>
          <Text style={{color:'#756D70',lineHeight:23}}>Жауап берілді: {test.questions.length-missing.length} / {test.questions.length}. Кейін қарау: {flagged.length}. Уақыт тоқтамайды.</Text>
          {missing.length>0&&<><Text style={{color:'#990F2E'}}>Жауап берілмеген сұрақтар:</Text><ScrollView style={{maxHeight:150}}><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{missing.map(i=><TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={`${i+1}-сұраққа өту`} onPress={()=>{setFinishReview(false);goToQuestion(i);}} style={{padding:12,minWidth:44,backgroundColor:'#F3EDE4',borderRadius:8}}><Text>{i+1}</Text></TouchableOpacity>)}</View></ScrollView></>}
          <TouchableOpacity accessibilityRole="button" onPress={()=>setFinishReview(false)} style={{padding:14,borderWidth:1,borderColor:'#DFD2C3',borderRadius:12,alignItems:'center'}}><Text>Тестке оралу</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{setFinishReview(false);void handleFinish(false);}} style={{padding:14,backgroundColor:'#800F1D',borderRadius:12,alignItems:'center'}}><Text style={{color:'white',fontWeight:'700'}}>Жауаптарды жіберу</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}
