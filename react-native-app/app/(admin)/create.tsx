import { displayFont } from '../../theme';
import { notify } from '../../lib/notify';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { useAuth } from '../../context/AuthContext';
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ArrowLeft, FileUp, FileText, BookOpen, Clock3, Target, CloudCheck, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../../context/AuthContext';
import { API } from '../constants/api';

function FormField({label,value,onChangeText,placeholder,Icon,numeric=false,required=false}:{label:string;value:string;onChangeText:(v:string)=>void;placeholder:string;Icon:any;numeric?:boolean;required?:boolean}) {
  const [focused,setFocused]=useState(false);
  return <View style={{flex:1,minWidth:0}}><Text style={{fontSize:14,fontWeight:'600',color:'#302B32',marginBottom:7}}>{label}{required&&<Text style={{color:'#950D2B'}}> *</Text>}</Text><View style={{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:focused?'#940B27':'#DADCE3',backgroundColor:'#FFF',borderRadius:9,paddingHorizontal:14}}><Icon size={21} color={focused?'#940B27':'#687184'}/><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9297A5" keyboardType={numeric?'numeric':'default'} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{flex:1,minWidth:0,minHeight:46,fontSize:15,color:'#19202B',paddingVertical:10,...Platform.select({web:{outlineStyle:'none'} as any})}}/></View></View>;
}

export default function CreateTest() {
  const router = useRouter();
  const {width:viewportWidth}=useWindowDimensions();
  const [layoutWidth,setLayoutWidth]=useState(0);
  const width=layoutWidth||viewportWidth;
  const mobile=width<700;
  const [dragging,setDragging]=useState(false);
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [report, setReport] = useState<any>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newPassing, setNewPassing] = useState('70');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [wordFile, setWordFile] = useState<any>(null);
  const wordInputRef = useRef<any>(null);

  const draft = useLocalDraft(user ? `create-draft:${user.id}` : null, {newTitle,newSubject,newDuration,newPassing}, saved => {setNewTitle(saved.newTitle);setNewSubject(saved.newSubject);setNewDuration(saved.newDuration);setNewPassing(saved.newPassing);});

  const createTest = async () => {
    if (creating || importing) return;
    if (!newTitle.trim() || !newSubject.trim()) {
      setMessage('Атауы мен пәнді толтырыңыз.');
      notify.error('Атауы мен пәнді толтырыңыз.');
      return;
    }
    if (!Number.isInteger(Number(newDuration)) || Number(newDuration)<1 || Number(newDuration)>300 || !Number.isInteger(Number(newPassing)) || Number(newPassing)<0 || Number(newPassing)>100) { setMessage('Уақыт 1–300 минут, өту шегі 0–100% болуы керек.'); return; }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          description: '',
          duration_minutes: parseInt(newDuration) || 30,
          passing_score: Number(newPassing),
          is_published: false
        })
      });
      
      if (!res.ok) throw new Error('Create failed');
      const data = await res.json();
      
      await draft.clear();
      notify.success('Тест жобасы сақталды');
      router.push(`/test/${data.id}/edit` as any);
      
    } catch {
      setMessage('Тест сақталмады. Жоба осы құрылғыда қалды, қайта көріңіз.');
      notify.error('Тест сақталмады. Қайта көріңіз.');
    } finally {
      setCreating(false);
    }
  };

  const importWordTest = async (forcePreview = false) => {
    if (creating || importing) return;
    if (!newTitle.trim() || !newSubject.trim()) {
      setMessage('Атауы мен пәнді толтырыңыз.');
      notify.error('Атауы мен пәнді толтырыңыз.');
      return;
    }
    if (!Number.isInteger(Number(newDuration)) || Number(newDuration)<1 || Number(newDuration)>300 || !Number.isInteger(Number(newPassing)) || Number(newPassing)<0 || Number(newPassing)>100) { setMessage('Уақыт 1–300 минут, өту шегі 0–100% болуы керек.'); return; }
    if (!wordFile) {
      setMessage('Word (.docx) файлын таңдаңыз.');
      return;
    }
    if (!/\.docx$/i.test(wordFile.name || '')) {
      setMessage('Тек .docx Word файлын жүктеуге болады.');
      return;
    }

    if (wordFile.size > 4*1024*1024) { setMessage('Word файлы 4 МБ-тан аспауы керек.'); return; }
    setMessage('');
    setImporting(true);
    const preview = forcePreview || !report;
    try {
      const token = await getToken();
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('File read failed'));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(wordFile);
      });
      const res = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64,
          previewOnly: preview,
          fileName: wordFile.name,
          title: newTitle,
          subject: newSubject,
          duration_minutes: parseInt(newDuration) || 30,
          passing_score: Number(newPassing),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      if (preview) { setReport(data.report); return; }
      await draft.clear();
      notify.success('Тест жобасы сақталды');
      router.push(`/test/${data.id}/edit` as any);
    } catch (error: any) {
      setMessage(error.message || 'Word файлын оқу мүмкін болмады');
      notify.error('Word файлын импорттау мүмкін болмады.');
    } finally {
      setImporting(false);
    }
  };

  const chooseFile=(file:any)=>{
    setDragging(false);setReport(null);setMessage('');
    if(!file){setWordFile(null);return;}
    if(!/\.docx$/i.test(file.name||'')){setWordFile(null);setMessage('Тек .docx Word файлын таңдаңыз.');return;}
    if(file.size>4*1024*1024){setWordFile(null);setMessage('Word файлы 4 МБ-тан аспауы керек.');return;}
    setWordFile(file);
  };
  const busy=creating||importing;
  return <SafeAreaView className="create-test-page" onLayout={event=>setLayoutWidth(event.nativeEvent.layout.width)} style={{flex:1,backgroundColor:'#FCFAF7'}}>
    <ScrollView contentContainerClassName="create-page-content" contentContainerStyle={{paddingHorizontal:mobile?18:32,paddingTop:mobile?20:24,paddingBottom:32}} keyboardShouldPersistTaps="handled">
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Артқа" onPress={()=>router.push('/(admin)/dashboard')} style={{flexDirection:'row',alignItems:'center',gap:10,alignSelf:'flex-start',minHeight:36,marginBottom:mobile?18:16}}><ArrowLeft size={22} color="#56555E"/><Text style={{color:'#56555E',fontWeight:'600',fontSize:15}}>Артқа</Text></TouchableOpacity>
      <View style={{width:'100%',maxWidth:1060,alignSelf:'center'}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:12}}><Text style={{fontSize:13,color:'#717D91'}}>Тесттер / Жаңа тест</Text><View style={{flexDirection:'row',alignItems:'center',gap:8}}><CloudCheck size={18} color="#647187"/><Text accessibilityLiveRegion="polite" style={{color:'#717D91',fontSize:12}}>{draft.status||'Жоба осы құрылғыда сақталады'}</Text></View></View>
        <Text className="create-page-title" style={{fontFamily:displayFont,fontSize:mobile?34:44,lineHeight:mobile?42:52,fontWeight:'700',color:'#10151E',letterSpacing:-.8}}>Жаңа тест</Text>
        <Text className="create-page-subtitle" style={{fontFamily:displayFont,fontSize:mobile?18:21,lineHeight:27,color:'#788294',marginTop:4}}>Сұрақтар мен оқу материалдарын дайындаңыз.</Text>
        <View accessibilityLabel="1-қадам: Негізгі ақпарат. Кейін: Сұрақтар, Жариялау" style={{flexDirection:'row',alignItems:'center',alignSelf:'center',width:'100%',maxWidth:740,marginVertical:mobile?22:20}}>
          {['Негізгі ақпарат','Сұрақтар','Жариялау'].map((label,i)=><React.Fragment key={label}>{i>0&&<View style={{height:1,flex:1,backgroundColor:'#DDD4C9',marginHorizontal:mobile?6:18}}/>}<View className="create-step" style={{flexDirection:mobile?'column':'row',alignItems:'center',gap:mobile?7:12}}><View className="create-step-circle" style={{width:mobile?30:34,height:mobile?30:34,borderRadius:20,borderWidth:i?1:0,borderColor:'#DDD4C9',backgroundColor:i?'#FCFAF7':'#940B27',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:16,color:i?'#697184':'white',fontWeight:'600'}}>{i+1}</Text></View><Text className="create-step-label" style={{fontSize:mobile?11:14,fontWeight:i?'400':'600',color:i?'#788294':'#940B27'}}>{label}</Text></View></React.Fragment>)}
        </View>
        <View className="create-form-card" style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E1D9D0',borderRadius:14,padding:mobile?18:28}}>
          <Text style={{fontFamily:displayFont,fontSize:mobile?25:28,fontWeight:'700',color:'#10151E',marginBottom:12}}>Тест туралы</Text>
          {!!message&&<Text accessibilityRole="alert" style={{color:'#940B27',backgroundColor:'#FFF2F3',borderRadius:8,padding:12,marginBottom:14,lineHeight:21}}>{message}</Text>}
          <View style={{gap:16}}>
            <FormField label="Тест атауы" required value={newTitle} onChangeText={setNewTitle} placeholder="Мысалы: Жоғары математика" Icon={FileText}/>
            <FormField label="Пән" required value={newSubject} onChangeText={setNewSubject} placeholder="Мысалы: Математика" Icon={BookOpen}/>
            <View className="create-number-fields" style={{flexDirection:width<380?'column':'row',gap:mobile?12:28}}><FormField label="Уақыт (мин)" value={newDuration} onChangeText={setNewDuration} placeholder="30" Icon={Clock3} numeric/><FormField label="Өту баллы (%)" value={newPassing} onChangeText={setNewPassing} placeholder="70" Icon={Target} numeric/></View>
          </View>
          {Platform.OS==='web'&&<View style={{borderTopWidth:1,borderTopColor:'#DFE2E8',marginTop:20,paddingTop:16}}>
            <Text style={{fontFamily:displayFont,fontSize:mobile?23:26,fontWeight:'700',color:'#10151E',marginBottom:10}}>Word файлынан импорттау</Text>
            <View {...(Platform.OS==='web'?{onDragOver:(event:any)=>{event.preventDefault();if(!busy)setDragging(true);},onDragLeave:()=>setDragging(false),onDrop:(event:any)=>{event.preventDefault();if(!busy)chooseFile(event.dataTransfer.files?.[0]);}} as any:{})}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Word (.docx) файлын таңдау" disabled={busy} onPress={()=>wordInputRef.current?.click()} style={{minHeight:84,borderWidth:1,borderStyle:'dashed',borderColor:'#A50E30',borderRadius:12,backgroundColor:dragging?'#F9E4E9':'#FFF7F8',flexDirection:'row',justifyContent:'center',alignItems:'center',gap:16,padding:16,opacity:busy?0.6:1}}><FileUp size={36} color="#940B27"/><View style={{flexShrink:1}}><Text numberOfLines={2} style={{fontSize:mobile?15:17,fontWeight:'700',color:'#940B27'}}>{wordFile?wordFile.name:'Word (.docx) файлын таңдау'}</Text><Text style={{fontSize:12,lineHeight:18,color:'#858C9C',marginTop:4}}>Файлды осында сүйреп әкеліңіз немесе таңдаңыз.</Text></View></TouchableOpacity>
            </View>
            {/* @ts-ignore Web-only input */}
            <input ref={wordInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{display:'none'}} onChange={(event:any)=>{chooseFile(event.target.files?.[0]);event.target.value='';}}/>
            <View className="create-import-bottom" style={{flexDirection:mobile?'column':'row',alignItems:mobile?'flex-start':'center',gap:12,justifyContent:'space-between',marginTop:10}}><View style={{flex:1}}><Text style={{fontSize:12,lineHeight:18,color:'#7A8598'}}>Сұрақтар мен жауаптарды .docx файлынан жүктеңіз. Ең көбі 4 МБ.</Text>{!!wordFile&&<TouchableOpacity accessibilityRole="button" onPress={()=>chooseFile(null)} disabled={busy} style={{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:7}}><X size={14} color="#940B27"/><Text style={{fontSize:12,color:'#940B27'}}>Файлды алып тастау</Text></TouchableOpacity>}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Файлды тексеру" onPress={()=>importWordTest(true)} disabled={busy||!wordFile} style={{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:16,minHeight:36,borderWidth:1,borderColor:'#B6BECD',borderRadius:8,opacity:(busy||!wordFile)?0.5:1}}><FileText size={18} color="#5D687E"/><Text style={{fontSize:13,fontWeight:'600',color:'#5D687E'}}>{importing?'Өңделуде…':'Файлды тексеру'}</Text></TouchableOpacity></View>
            {report&&<View accessibilityLiveRegion="polite" style={{backgroundColor:'#FFF7E6',borderRadius:10,padding:14,marginTop:14,gap:6}}><Text style={{fontWeight:'700',color:'#634A1E'}}>Табылды: {report.recognized} · Өткізілді: {report.skipped}</Text><Text style={{fontSize:13,lineHeight:19,color:'#756643'}}>Толық емес немесе дұрыс жауабы белгіленбеген сұрақтар импортталмайды.</Text>{report.warnings.map((warning:string,i:number)=><Text key={i} style={{fontSize:13,color:'#756643'}}>{warning}</Text>)}{report.sample.map((text:string,i:number)=><Text key={i} numberOfLines={2} style={{fontSize:13}}>{i+1}. {text}</Text>)}<Text style={{fontSize:13,color:'#634A1E'}}>«Сақтау және жалғастыру» арқылы сұрақтарды жобаға қосыңыз.</Text></View>}
          </View>}
          <View className="create-form-footer" style={{borderTopWidth:1,borderTopColor:'#DFE2E8',paddingTop:14,marginTop:14,flexDirection:mobile?'column-reverse':'row',justifyContent:'space-between',gap:12}}>
            <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={()=>router.push('/(admin)/dashboard')} style={{minHeight:42,paddingHorizontal:30,borderWidth:1,borderColor:'#B6BECD',borderRadius:8,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:14,fontWeight:'600',color:'#4D576A'}}>Болдырмау</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Сақтау және жалғастыру" disabled={busy||!draft.ready} onPress={()=>wordFile?importWordTest(false):createTest()} style={{minHeight:42,paddingHorizontal:24,backgroundColor:'#940B27',borderRadius:8,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:14,opacity:(busy||!draft.ready)?0.6:1}}>{busy?<ActivityIndicator color="white"/>:<><Text style={{color:'white',fontSize:14,fontWeight:'600'}}>Сақтау және жалғастыру</Text><ArrowRight size={19} color="white"/></>}</TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
