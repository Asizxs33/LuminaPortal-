import { confirmAction } from '../../lib/confirmAction';
import { notify } from '../../lib/notify';
import { displayFont } from '../../theme';
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, ShieldCheck, ChevronRight, ArrowLeft, ArrowRight, History } from 'lucide-react-native';

const ink='#230D13',burgundy='#8C102B';
export default function AdminProfile() {
  const {user,logout}=useAuth();
  const router=useRouter();
  const [leaving,setLeaving]=useState(false);
  const handleLogout=async()=>{
    if(leaving)return;
    setLeaving(true);
    try{if(await confirmAction('Жүйеден шығуды растаңыз')){await logout();router.replace('/login');}}catch{notify.error('Жүйеден шығу мүмкін болмады. Қайта көріңіз.');}finally{setLeaving(false);}
  };
  const initials=(user?.name||'?').trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const role=user?.role==='admin'?'Әкімші':'Мұғалім';
  const openHistory=()=>router.push('/(admin)/history' as any);
  const titleStyle={fontFamily:displayFont,fontSize:26,lineHeight:32,fontWeight:'700' as const,color:ink};
  const cardStyle={padding:18,borderWidth:1,borderColor:'#E1D7CE',borderRadius:12,backgroundColor:'#FFF'};
  return <SafeAreaView className="teacher-profile-page" style={{flex:1,backgroundColor:'#FCFAF7'}}>
    <ScrollView contentContainerClassName="teacher-profile-content" contentContainerStyle={{padding:18,paddingTop:24,paddingBottom:28}} keyboardShouldPersistTaps="handled">
      <View style={{width:'100%',maxWidth:1400,alignSelf:'center'}}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:8}}><Text style={{fontSize:13,color:'#786776'}}>Мұғалім кабинеті  /  <Text style={{color:burgundy}}>Профиль</Text></Text>{user?.role==='admin'&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Тарих және резервтік көшірмелер" onPress={openHistory} style={{flexDirection:'row',alignItems:'center',gap:7,minHeight:20}}><Text style={{fontSize:13,color:burgundy}}>Тарих және резервтік көшірмелер</Text><ArrowRight size={16} color={burgundy}/></TouchableOpacity>}</View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Артқа" onPress={()=>router.push('/(admin)/dashboard')} style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:10,minHeight:28,marginBottom:8}}><ArrowLeft size={22} color="#8C7E88"/><Text style={{fontSize:14,fontWeight:'600',color:'#7A6D7C'}}>Артқа</Text></TouchableOpacity>
        <Text className="teacher-profile-title" style={{fontFamily:displayFont,fontSize:38,lineHeight:46,fontWeight:'700',letterSpacing:-.8,color:ink}}>Профиль</Text><Text className="teacher-profile-subtitle" style={{fontFamily:displayFont,fontSize:18,lineHeight:26,color:'#788197',marginTop:4,marginBottom:20}}>Жеке ақпарат пен аккаунтты басқару</Text>
        <View className="teacher-profile-hero" style={{minHeight:220,borderRadius:12,overflow:'hidden',backgroundColor:'#650918',justifyContent:'center',marginBottom:18}}>
          <Image source={require('../../assets/library-hero.png')} resizeMode="cover" style={{position:'absolute',top:0,right:0,width:'75%',height:'100%'}}/>
          <View pointerEvents="none" style={{position:'absolute',top:0,bottom:0,left:0,right:0,...Platform.select({web:{backgroundImage:'linear-gradient(90deg, #780D23 0%, #650918 34%, rgba(75,3,18,.66) 57%, rgba(51,0,9,.08) 100%)'} as any,default:{backgroundColor:'rgba(86,6,24,.7)'}})}}/>
          <View className="teacher-profile-identity" style={{padding:24,flexDirection:'row',alignItems:'center',gap:20}}><View className="teacher-profile-avatar" style={{width:84,height:84,borderRadius:60,backgroundColor:'#FFF8EC',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:displayFont,fontSize:42,fontWeight:'700',color:'#62091A'}}>{initials}</Text></View><View style={{minWidth:0,flexShrink:1}}><Text className="teacher-profile-name" style={{fontFamily:displayFont,fontSize:32,lineHeight:40,fontWeight:'700',color:'#FFF8F0'}}>{user?.name||'…'}</Text><Text style={{fontSize:16,lineHeight:23,color:'#F3E1DA',marginTop:4}}>{user?.email||'…'}</Text><View style={{flexDirection:'row',alignItems:'center',gap:9,alignSelf:'flex-start',borderWidth:1,borderColor:'#C7A377',borderRadius:30,paddingHorizontal:16,paddingVertical:8,marginTop:14}}><ShieldCheck size={18} color="#FFF8EB"/><Text style={{fontSize:14,color:'#FFF8EB',fontWeight:'500'}}>{role}</Text></View></View><View className="teacher-profile-divider" style={{display:'none',width:1,height:118,backgroundColor:'rgba(204,158,92,.55)',marginLeft:24}}/></View>
        </View>
        <View className="teacher-profile-cards" style={{gap:16}}>
          <View className="teacher-profile-personal" style={cardStyle}><Text style={titleStyle}>Жеке ақпарат</Text>
            {[{label:'АТЫ-ЖӨНІ',value:user?.name,Icon:User,bg:'#FFF0F3',color:burgundy},{label:'ЭЛЕКТРОНДЫҚ ПОШТА',value:user?.email,Icon:Mail,bg:'#EBFAF6',color:'#369D99'}].map(({label,value,Icon,bg,color},i)=><View key={label} style={{flexDirection:'row',alignItems:'center',gap:20,paddingVertical:12,borderTopWidth:i?1:0,borderTopColor:'#E8E2DE',marginTop:i?0:8}}><View style={{width:48,height:48,borderRadius:11,backgroundColor:bg,alignItems:'center',justifyContent:'center'}}><Icon size={25} color={color}/></View><View style={{flex:1,minWidth:0}}><Text style={{fontSize:11,lineHeight:16,fontWeight:'600',color:'#A09598'}}>{label}</Text><Text selectable style={{fontSize:16,lineHeight:23,fontWeight:'600',color:'#19202D',marginTop:3}}>{value||'—'}</Text></View></View>)}
          </View>
          <View className="teacher-profile-account" style={cardStyle}><Text style={titleStyle}>Аккаунт</Text><View style={{flexDirection:'row',alignItems:'center',gap:18,paddingVertical:12,marginTop:8}}><View style={{width:48,height:48,borderRadius:11,backgroundColor:'#FFF0F3',alignItems:'center',justifyContent:'center'}}><ShieldCheck size={26} color={burgundy}/></View><Text style={{flex:1,fontSize:16,color:'#404550'}}>Рөл</Text><View style={{paddingHorizontal:18,paddingVertical:10,borderRadius:20,backgroundColor:'#FFF0F3'}}><Text style={{fontSize:16,fontWeight:'600',color:burgundy}}>{role}</Text></View></View>{user?.role==='admin'&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Тарих және көшірмелер" onPress={openHistory} style={{borderTopWidth:1,borderTopColor:'#E8E2DE',flexDirection:'row',alignItems:'center',gap:18,minHeight:73,paddingVertical:12}}><View style={{width:48,alignItems:'center'}}><History size={26} color={burgundy}/></View><Text style={{flex:1,fontSize:16,lineHeight:23,fontWeight:'600',color:'#68728B'}}>Тарих және көшірмелер</Text><ChevronRight size={21} color="#68728B"/></TouchableOpacity>}</View>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Жүйеден шығу" disabled={leaving} onPress={handleLogout} style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E1D7CE',borderRadius:11,minHeight:56,paddingHorizontal:22,flexDirection:'row',alignItems:'center',gap:22,marginTop:16,opacity:leaving?0.6:1}}>{leaving?<ActivityIndicator color={burgundy}/>:<LogOut size={25} color={burgundy}/>}<Text style={{flex:1,fontSize:16,fontWeight:'600',color:burgundy}}>Жүйеден шығу</Text><ChevronRight size={21} color={burgundy}/></TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
