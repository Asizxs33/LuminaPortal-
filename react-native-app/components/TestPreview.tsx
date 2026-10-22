import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react-native';
import BrandMark from './BrandMark';
import { displayFont } from '../theme';

export default function TestPreview({ visible, onClose, title, questions }: { visible: boolean; onClose: () => void; title: string; questions: any[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [code, setCode] = useState<Record<number, string>>({});
  useEffect(() => { if (visible) { setIndex(0); setAnswers({}); setCode({}); } }, [visible]);
  const current = Math.max(0, Math.min(index, questions.length - 1));
  const question = questions[current];
  const burgundy = '#990F2E';
  const button = {minHeight:44,paddingHorizontal:23,borderWidth:1,borderRadius:9,flexDirection:'row' as const,alignItems:'center' as const,justifyContent:'center' as const,gap:10};
  return <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
    <SafeAreaView className="test-preview" style={{flex:1,backgroundColor:'#FCFAF7'}}>
      <View style={{backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#EDE7DF'}}>
        <View className="preview-header" style={{width:'100%',maxWidth:1440,alignSelf:'center',paddingHorizontal:24,paddingVertical:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap'}}>
          <BrandMark compact/>
          <View className="preview-mode" style={{flexDirection:'row',alignItems:'center',gap:9,paddingVertical:9,paddingHorizontal:20,borderWidth:1,borderColor:burgundy,borderRadius:24}}><Eye size={19} color={burgundy}/><Text style={{color:burgundy,fontSize:13,fontWeight:'600'}}>Алдын ала қарау</Text></View>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10}}><ArrowLeft size={20} color={burgundy}/><Text style={{color:burgundy,fontWeight:'600',fontSize:13}}>Редакторға оралу</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{paddingBottom:28}}>
        <View className="preview-content" style={{width:'100%',maxWidth:1200,alignSelf:'center',paddingHorizontal:24,paddingTop:27}}>
          <Text style={{fontSize:14,color:'#7A8495',marginBottom:10}}>Тест  /  <Text style={{color:burgundy}}>Оқушы көрінісі</Text></Text>
          <View className="preview-intro" style={{gap:16,marginBottom:19}}>
            <View style={{flex:1}}><Text className="preview-title" style={{fontFamily:displayFont,fontSize:40,lineHeight:46,fontWeight:'700',color:'#101521'}}>{title}</Text><Text style={{fontSize:14,lineHeight:21,color:'#7A8598',marginTop:6}}>Оқушы көрінісі · Нәтиже сақталмайды</Text></View>
            <View className="preview-progress" style={{gap:10}}><Text accessibilityLiveRegion="polite" style={{fontSize:14,color:'#7A8598',textAlign:'right'}}>Сұрақ {question?current+1:0} / {questions.length}</Text><View accessibilityRole="progressbar" accessibilityLabel="Сұрақтар бойынша ілгерілеу" accessibilityValue={{min:0,max:questions.length,now:question?current+1:0}} style={{height:9,borderRadius:5,backgroundColor:'#EEEDEC',overflow:'hidden'}}><View style={{height:'100%',width:`${questions.length?(current+1)/questions.length*100:0}%`,minWidth:question?5:0,borderRadius:5,backgroundColor:burgundy}}/></View></View>
          </View>
          {question?<View className="preview-question-card" style={{backgroundColor:'#FFF',borderRadius:15,padding:24,shadowColor:'#6E4B34',shadowOpacity:.06,shadowRadius:22,shadowOffset:{width:0,height:7}}}>
            <Text style={{fontSize:12,color:'#A69884',fontWeight:'500',marginBottom:9}}>{current+1}-СҰРАҚ</Text>
            <Text className="preview-question-text" style={{fontFamily:displayFont,fontSize:27,lineHeight:35,fontWeight:'700',color:'#101521',marginBottom:22}}>{question.text}</Text>
            {!!question.image_url&&<Image source={{uri:question.image_url}} resizeMode="contain" style={{width:'100%',height:200,marginBottom:18}}/>}
            {question.type==='CODE'?<View style={{gap:10}}><Text style={{fontSize:13,color:'#7A8598'}}>Код · Алдын ала қарау</Text><TextInput accessibilityLabel="Код редакторы — алдын ала қарау" multiline autoCapitalize="none" autoCorrect={false} value={code[current]??question.initial_code??''} onChangeText={value=>setCode(prev=>({...prev,[current]:value}))} placeholder="# Кодты осы жерге жазыңыз" placeholderTextColor="#9CA3AF" style={{fontFamily:'monospace',minHeight:220,padding:18,borderRadius:10,borderWidth:1,borderColor:'#E7E1D8',backgroundColor:'#FAF9F6',color:'#263247',fontSize:14,textAlignVertical:'top'}}/></View>:<View accessibilityRole="radiogroup" accessibilityLabel="Жауап нұсқалары" style={{gap:9}}>{question.options?.map((option:any,i:number)=>{
              const checked=answers[current]===i;
              return <TouchableOpacity className="preview-option" key={i} accessibilityRole="radio" accessibilityLabel={`${String.fromCharCode(65+i)}. ${option.text}`} accessibilityState={{checked}} onPress={()=>setAnswers(prev=>({...prev,[current]:i}))} style={{minHeight:49,flexDirection:'row',alignItems:'center',gap:24,paddingVertical:7,paddingHorizontal:17,borderWidth:1,borderColor:checked?burgundy:'#E8DDCC',borderRadius:9,backgroundColor:checked?'#FBEEF1':'#FCFAF7'}}>
                <View style={{width:19,height:19,borderRadius:10,borderWidth:1.5,borderColor:checked?burgundy:'#B3B3B3',alignItems:'center',justifyContent:'center',backgroundColor:'#FFF'}}>{checked&&<View style={{height:10,width:10,borderRadius:5,backgroundColor:burgundy}}/>}</View>
                <View style={{width:35,height:35,borderRadius:18,backgroundColor:checked?'#F4DCE3':'#F3EFE6',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:16,fontWeight:'500',color:checked?burgundy:'#172034'}}>{String.fromCharCode(65+i)}</Text></View><Text style={{fontSize:16,lineHeight:23,color:'#172034',flex:1}}>{option.text}</Text>
              </TouchableOpacity>;
            })}</View>}
            <View style={{flexDirection:'row',justifyContent:'space-between',gap:14,marginTop:23,paddingTop:13,borderTopWidth:1,borderTopColor:'#ECE6DF'}}>
              <TouchableOpacity accessibilityRole="button" disabled={current===0} onPress={()=>setIndex(current-1)} style={[button,{borderColor:current===0?'#DDE0E5':'#D7CDBF',backgroundColor:current===0?'#F2F2F3':'#FFF'}]}><ArrowLeft size={20} color={current===0?'#9BA2AF':'#727D91'}/><Text style={{fontSize:15,fontWeight:'600',color:current===0?'#9BA2AF':'#727D91'}}>Артқа</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" disabled={current>=questions.length-1} onPress={()=>setIndex(current+1)} style={[button,{borderColor:burgundy,backgroundColor:burgundy,opacity:current>=questions.length-1 ? .45 : 1}]}><Text style={{fontSize:15,fontWeight:'600',color:'#FFF'}}>Келесі</Text><ArrowRight size={20} color="#FFF"/></TouchableOpacity>
            </View>
          </View>:<View style={{padding:35,backgroundColor:'white',borderRadius:13}}><Text style={{fontSize:16,color:'#778298',textAlign:'center'}}>Алдымен редакторда сұрақ қосыңыз.</Text></View>}
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,marginTop:18}}><Eye size={18} color="#7E8793"/><Text style={{fontSize:12,lineHeight:19,color:'#7A8598',flexShrink:1}}>Алдын ала қарау режимі: жауаптар сақталмайды.</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
