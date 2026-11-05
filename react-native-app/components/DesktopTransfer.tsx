import React,{useRef,useState} from 'react';
import {Platform,Text,TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Download,Upload} from 'lucide-react-native';
import {API} from '../app/constants/api';
import {notify} from '../lib/notify';
import {confirmAction} from '../lib/confirmAction';

export function DesktopDownload(){
 if(Platform.OS!=='web')return null;
 return <a href="/downloads/LuminaPortal-setup.exe" download style={{color:'#940B27',fontSize:13,textDecoration:'underline',padding:'12px 0',display:'inline-block'}}>Windows бағдарламасын жүктеу</a>;
}

export function DesktopExport({testId}:{testId:string}){
 const [busy,setBusy]=useState(false);
 if(Platform.OS!=='web')return null;
 return <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={async()=>{
  if(busy||!await confirmAction('Автономды файлда дұрыс жауаптар болады. Оны тек офлайн тестілеуге таратыңыз. Серверлік емтихан қорғанысы бұл файлға қолданылмайды. Жалғастыру керек пе?'))return;
  setBusy(true);try{const token=await AsyncStorage.getItem('lumina_token');const res=await fetch(`${API}/api/tests/${encodeURIComponent(testId)}?desktopExport=true`,{headers:{Authorization:`Bearer ${token}`}});const data=await res.json();if(!res.ok)throw Error(data.error||'Файл жүктелмеді.');const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`lumina-${testId}.lumina-test`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify.success('Бағдарламаға арналған тест дайын.');}catch(e){notify.error((e as Error).message);}finally{setBusy(false);}
 }} style={{padding:12,borderWidth:1,borderColor:'#DAD8DD',borderRadius:10,flexDirection:'row',gap:8,alignItems:'center'}}><Download size={18} color="#940B27"/><Text style={{color:'#940B27',fontSize:13}}>{busy?'Жүктелуде…':'Бағдарламаға жүктеу'}</Text></TouchableOpacity>;
}

export function DesktopResultImport({onImported}:{onImported:()=>void}){
 const [busy,setBusy]=useState(false);const input=useRef<HTMLInputElement>(null);
 if(Platform.OS!=='web')return null;
 return <><input ref={input} type="file" accept=".lumina-result" aria-label="Бағдарлама нәтижесін таңдау" style={{display:'none'}} onChange={async e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file||busy)return;setBusy(true);try{if(file.size>6_000_000)throw Error('Файл тым үлкен.');const data=JSON.parse(await file.text());if(data.format!=='lumina-result'||data.version!==1)throw Error('Бағдарламада сақталған .lumina-result файлын таңдаңыз.');const token=await AsyncStorage.getItem('lumina_token');const res=await fetch(`${API}/api/results`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({...data,action:'desktopImport'})});const result=await res.json();if(!res.ok)throw Error(result.error||'Нәтиже сақталмады.');notify.success('Автономды нәтиже сақталды.');onImported();}catch(e){notify.error((e as Error).message);}finally{setBusy(false);}}}/><TouchableOpacity accessibilityRole="button" disabled={busy} onPress={()=>input.current?.click()} style={{alignSelf:'flex-start',flexDirection:'row',gap:9,alignItems:'center',borderWidth:1,borderColor:'#DAD8DD',padding:12,borderRadius:9,marginBottom:17}}><Upload size={18} color="#940B27"/><Text style={{color:'#940B27',fontSize:13}}>{busy?'Сақталуда…':'Бағдарламадан нәтиже жүктеу'}</Text></TouchableOpacity></>;
}
