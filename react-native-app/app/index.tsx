import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, BarChart3, Check, FileText, Route, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';
import LearningRoute from '../components/LearningRoute';

const features = [
  { icon: FileText, title: 'Тест құрастыру', text: 'Қарапайым сұрақтардан бастап құжат негізіндегі күрделі тапсырмаларға дейін.' },
  { icon: BarChart3, title: 'Нақты нәтиже', text: 'Балл, өту шегі және аяқталған жұмыстар бір жерде көрінеді.' },
  { icon: ShieldCheck, title: 'Басқарылатын қолжетімділік', text: 'Студент пен әкімші әрекеттері рөлге сәйкес бөлінген.' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const dashboard = user?.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 38 }}>
        <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E3E8F0' }}>
          <View className="w-full max-w-[1240px] self-center px-5 lg:px-8 py-4 flex-row items-center justify-between">
            <BrandMark compact />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Link href="/login" asChild><TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 }}><Text style={{ color: '#34415A', fontWeight: '800' }}>Кіру</Text></TouchableOpacity></Link>
              <Link href={(isAuthenticated ? dashboard : '/register') as any} asChild><TouchableOpacity style={{ backgroundColor: '#315CF5', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 }}><Text style={{ color: 'white', fontWeight: '900' }}>{isAuthenticated ? 'Кабинетке өту' : 'Тіркелу'}</Text></TouchableOpacity></Link>
            </View>
          </View>
        </View>

        <View className="w-full max-w-[1240px] self-center px-5 lg:px-8 pt-12 lg:pt-20">
          <View className="flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
            <View className="flex-1 justify-center py-4 lg:py-8">
              <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E9EEFF', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginBottom: 22 }}>
                <Route size={16} color="#315CF5" />
                <Text style={{ color: '#315CF5', fontWeight: '900', fontSize: 13 }}>Оқу бағыты анық көрінеді</Text>
              </View>
              <Text style={{ color: '#16213E', fontSize: 48, lineHeight: 54, fontWeight: '900', letterSpacing: -2 }} className="lg:text-[64px] lg:leading-[68px]">Тесттен нәтижеге дейін — бір түсінікті бағыт</Text>
              <Text style={{ color: '#69758B', fontSize: 18, lineHeight: 29, marginTop: 22, maxWidth: 610 }}>LuminaPortal тест құруды, өткізуді және нәтижені талдауды бір жұмыс кеңістігіне жинайды.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
                <Link href={(isAuthenticated ? dashboard : '/register') as any} asChild><TouchableOpacity style={{ minHeight: 54, backgroundColor: '#315CF5', borderRadius: 12, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{isAuthenticated ? 'Оқуды жалғастыру' : 'Тегін бастау'}</Text><ArrowRight size={19} color="white" /></TouchableOpacity></Link>
                <Link href="/informatics?set=2" asChild><TouchableOpacity style={{ minHeight: 54, backgroundColor: 'white', borderWidth: 1, borderColor: '#CAD3E1', borderRadius: 12, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#16213E', fontWeight: '900', fontSize: 16 }}>Демо тестті ашу</Text></TouchableOpacity></Link>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 26 }}>
                {['Телефон мен компьютерде', 'Нәтиже бірден', 'Қазақша интерфейс'].map((item) => <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Check size={16} color="#16845B" strokeWidth={3} /><Text style={{ color: '#526078', fontWeight: '700', fontSize: 13 }}>{item}</Text></View>)}
              </View>
            </View>

            <View className="flex-1 bg-white border border-[#D9E0EC] rounded-[24px] p-5 lg:p-7 shadow-sm justify-between min-h-[430px]">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: '#69758B', fontWeight: '700', fontSize: 13 }}>Студент кабинеті</Text><Text style={{ color: '#16213E', fontWeight: '900', fontSize: 23, marginTop: 4 }}>Бүгінгі оқу бағыты</Text></View><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#E9EEFF', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#315CF5', fontWeight: '900' }}>АН</Text></View></View>
              <View style={{ backgroundColor: '#F8FAFD', borderWidth: 1, borderColor: '#E3E8F0', borderRadius: 16, padding: 18, marginVertical: 24 }}><LearningRoute steps={[{ label: 'Кіру', state: 'done' }, { label: 'Таңдау', state: 'done' }, { label: 'Тест', state: 'current' }, { label: 'Нәтиже', state: 'next' }]} /></View>
              <View style={{ gap: 11 }}>
                {[['Информатика · Тест 2', '47 сұрақ', '#315CF5'], ['Ақпараттық технологиялар', '50 минут', '#16845B']].map(([title, meta, color]) => <View key={title} style={{ borderWidth: 1, borderColor: '#E3E8F0', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 6, height: 42, borderRadius: 6, backgroundColor: color }} /><View style={{ flex: 1 }}><Text style={{ color: '#16213E', fontWeight: '900', fontSize: 15 }}>{title}</Text><Text style={{ color: '#69758B', fontSize: 12, marginTop: 4 }}>{meta}</Text></View><ArrowRight size={18} color="#69758B" /></View>)}
              </View>
            </View>
          </View>

          <View className="mt-16 lg:mt-24">
            <Text style={{ color: '#16213E', fontSize: 34, lineHeight: 41, fontWeight: '900', letterSpacing: -1, maxWidth: 650 }}>Күнделікті бағалау жұмысына қажет негізгі құралдар</Text>
            <View className="flex-col md:flex-row gap-4 mt-8">
              {features.map(({ icon: Icon, title, text }, index) => <View key={title} style={{ flex: 1, backgroundColor: index === 0 ? '#16213E' : 'white', borderWidth: 1, borderColor: index === 0 ? '#16213E' : '#D9E0EC', borderRadius: 18, padding: 24 }}><View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: index === 0 ? 'rgba(115,210,222,0.18)' : '#E9EEFF', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={index === 0 ? '#73D2DE' : '#315CF5'} /></View><Text style={{ color: index === 0 ? 'white' : '#16213E', fontSize: 20, fontWeight: '900', marginTop: 22 }}>{title}</Text><Text style={{ color: index === 0 ? '#BBC6DC' : '#69758B', fontSize: 15, lineHeight: 23, marginTop: 9 }}>{text}</Text></View>)}
            </View>
          </View>

          <View className="mt-16 lg:mt-24 bg-[#315CF5] rounded-[24px] p-7 lg:p-12 flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <View style={{ maxWidth: 650 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Sparkles size={20} color="#B8E34A" /><Text style={{ color: '#DCE4FF', fontWeight: '800' }}>Келесі қадам</Text></View><Text style={{ color: 'white', fontSize: 31, lineHeight: 38, fontWeight: '900', marginTop: 12 }}>Алғашқы тестті қазір ашып көріңіз</Text><Text style={{ color: '#DCE4FF', lineHeight: 24, marginTop: 9 }}>Тіркелмей-ақ демо тесттің құрылымын көруге болады.</Text></View>
            <Link href="/informatics?set=2" asChild><TouchableOpacity style={{ minHeight: 52, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 9 }}><Text style={{ color: '#315CF5', fontWeight: '900' }}>Демо тест</Text><ArrowRight size={18} color="#315CF5" /></TouchableOpacity></Link>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: '#D9E0EC', paddingTop: 26, marginTop: 54 }}><BrandMark compact /><Text style={{ color: '#7A869B', fontSize: 13 }}>© 2026 LuminaPortal</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
