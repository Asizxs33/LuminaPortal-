import { confirmAction } from '../../lib/confirmAction';
import { notify } from '../../lib/notify';
import { displayFont } from '../../theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Image, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, GraduationCap, ChevronRight, BookOpen, Coins, Bell } from 'lucide-react-native';
import { API } from '../constants/api';

const ink='#340B13', burgundy='#800F1D', border='#E7DCD6';
export default function StudentProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {width}=useWindowDimensions();
  const mobile=width<768;
  const [coins,setCoins]=useState<number|null>(null);
  const [coinError,setCoinError]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    (async()=>{if(!user?.id)return;try{
      const token=await AsyncStorage.getItem('lumina_token');
      const res=await fetch(`${API}/api/users/coins?userId=${user.id}`,{headers:token?{Authorization:`Bearer ${token}`}:{},signal:controller.signal});
      if(!res.ok)throw Error('Balance unavailable');
      const data=await res.json();setCoins(data.coins);setCoinError(false);
    }catch{if(!controller.signal.aborted)setCoinError(true);}})();
    return()=>controller.abort();
  },[user?.id]);
  const handleLogout=async()=>{if(await confirmAction('Жүйеден шығуды растаңыз')){await logout();router.replace('/login');}};
  const initial=user?.name?.trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
  const sectionTitle={fontFamily:displayFont,fontSize:mobile?25:28,fontWeight:'700' as const,color:ink,marginTop:20,marginBottom:10};
  const iconBox={width:42,height:42,borderRadius:11,backgroundColor:'#FAEBED',alignItems:'center' as const,justifyContent:'center' as const};
  const card={backgroundColor:'#FFF',borderWidth:1,borderColor:border,borderRadius:15,paddingHorizontal:16};
  return <SafeAreaView edges={['top','left','right']} style={{flex:1,backgroundColor:'#FCFAF7'}}>
    {mobile&&<View style={{height:64,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:'#DCCFC8',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={require('../../assets/brand/lumina-symbol.png')} style={{width:46,height:46}} resizeMode="contain"/><Text style={{fontFamily:displayFont,fontSize:width<360?23:28,fontWeight:'700',color:ink}}>LuminaPortal</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Хабарламалар" onPress={()=>notify.info('Жаңа хабарламалар жоқ.')} style={{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'}}><Bell size={27} color={ink}/></TouchableOpacity>
    </View>}
    <ScrollView contentContainerStyle={{paddingHorizontal:mobile?18:32,paddingTop:mobile?16:28,paddingBottom:24}}>
      <View style={{width:'100%',maxWidth:760,alignSelf:'center'}}>
        <Text style={{fontFamily:displayFont,fontSize:mobile?38:44,lineHeight:mobile?46:54,fontWeight:'700',letterSpacing:-.8,color:ink}}>Профиль</Text>
        <Text style={{fontFamily:displayFont,fontSize:mobile?19:22,lineHeight:27,color:'#786967',marginBottom:16}}>Жеке кабинетті басқару</Text>
        <View style={{borderRadius:14,overflow:'hidden',backgroundColor:'#5B0717',borderWidth:1,borderColor:'#75172A'}}>
          <ImageBackground source={require('../../assets/library-hero.png')} imageStyle={{width:'100%',height:'100%'}} resizeMode="cover" style={{width:'100%'}}>
            <View style={{paddingHorizontal:24,paddingTop:22,...Platform.select({web:{backgroundImage:'linear-gradient(90deg, rgba(78,3,20,.97) 0%, rgba(78,3,20,.87) 44%, rgba(67,0,12,.32) 100%)'} as any,default:{backgroundColor:'rgba(75,3,19,.8)'}})}}>
              <View style={{width:76,height:76,borderRadius:38,backgroundColor:'#FFF3E1',alignItems:'center',justifyContent:'center',marginBottom:8}}><Text style={{fontFamily:displayFont,fontSize:38,fontWeight:'700',color:ink}}>{initial}</Text></View>
              <Text style={{fontFamily:displayFont,fontSize:28,lineHeight:34,fontWeight:'700',color:'#FFFAF2'}}>{user?.name||'…'}</Text>
              <Text style={{color:'#ECDCD5',fontSize:16,lineHeight:23,marginTop:2}}>{user?.email||'…'}</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#FFF2DC',paddingHorizontal:16,paddingVertical:6,borderRadius:30,alignSelf:'flex-start',marginTop:10}}><GraduationCap size={19} color={burgundy}/><Text style={{fontSize:15,fontWeight:'700',color:burgundy}}>Студент</Text></View>
              <View style={{height:1,backgroundColor:'rgba(239,207,175,.65)',marginTop:20}}/>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Баланс туралы" onPress={()=>notify.info(coinError?'Балансты жүктеу мүмкін болмады. Бетті қайта ашып көріңіз.':'Бұл — оқу тапсырмаларына арналған ішкі ұпайлар.')} style={{minHeight:58,flexDirection:'row',alignItems:'center',gap:14}}>
                <Coins size={27} color="#F4D38B"/><Text style={{fontSize:17,fontWeight:'600',color:'#FFF8ED',flex:1}}>Баланс</Text><Text style={{fontSize:23,color:'#F7D78F',fontWeight:'700'}}>{coins===null?'—':coins} ₿</Text><ChevronRight size={22} color="#F3DFBC"/>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <Text style={sectionTitle}>Жеке ақпарат</Text>
        <View style={card}>
          {[{label:'АТЫ-ЖӨНІ',value:user?.name,Icon:User},{label:'ЭЛЕКТРОНДЫҚ ПОШТА',value:user?.email,Icon:Mail}].map(({label,value,Icon},i)=><View key={label} style={{flexDirection:'row',alignItems:'center',gap:18,paddingVertical:15,borderTopWidth:i?1:0,borderTopColor:'#EFE7E1'}}><View style={iconBox}><Icon size={24} color={burgundy}/></View><View style={{flex:1}}><Text style={{fontSize:11,lineHeight:16,color:'#9C8E89'}}>{label}</Text><Text selectable style={{fontSize:16,lineHeight:23,color:'#151923',marginTop:2}}>{value||'—'}</Text></View></View>)}
        </View>
        <Text style={sectionTitle}>Қызметтер</Text>
        <View style={card}>
          {[{label:'Оқу материалдары',Icon:BookOpen,gold:false,action:()=>notify.info('Оқу материалдары бөлімі дайындалуда.')},{label:'LuminaPortal туралы',Icon:GraduationCap,gold:true,action:()=>notify.info('LuminaPortal — білімді бағалау және оқу нәтижелерін талдау платформасы. Нұсқа: 1.0.0.')}].map(({label,Icon,gold,action},i)=><TouchableOpacity accessibilityRole="button" key={label} onPress={action} style={{flexDirection:'row',alignItems:'center',gap:18,paddingVertical:12,borderTopWidth:i?1:0,borderTopColor:'#EFE7E1',minHeight:70}}><View style={{...iconBox,backgroundColor:gold?'#FFF1CA':'#FAEBED'}}><Icon size={24} color={gold?'#925019':burgundy}/></View><Text style={{flex:1,fontSize:17,fontWeight:'600',color:'#151923'}}>{label}</Text><ChevronRight size={22} color="#8F817D"/></TouchableOpacity>)}
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Жүйеден шығу" onPress={handleLogout} style={{minHeight:48,marginTop:12,borderRadius:10,borderWidth:1,borderColor:burgundy,backgroundColor:'#FAEFF0',flexDirection:'row',justifyContent:'center',alignItems:'center',gap:14}}><LogOut size={23} color={burgundy}/><Text style={{fontSize:17,fontWeight:'700',color:burgundy}}>Жүйеден шығу</Text></TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
