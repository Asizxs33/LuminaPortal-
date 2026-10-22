import React, { useRef, useState } from 'react';
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ArrowUpRight, BarChart3, ChevronDown, FileText, Monitor, ShieldCheck, Zap } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';

const serif = Platform.OS === 'web' ? 'Georgia, Times New Roman, serif' : 'serif';
const ink = '#10131B';
const wine = '#800F1D';
const gold = '#B67B43';
const questions = [
  { question: 'Платформаны қалай қолдана бастаймын?', answer: 'Алдымен тіркеліңіз немесе бар аккаунтыңызға кіріңіз. Жеке кабинетте сізге қолжетімді тесттер мен бөлімдер көрсетіледі.' },
  { question: 'Тест туралы ақпаратты қайдан көремін?', answer: 'Тестті ашқанда оның сипаттамасын, уақытын және өту балын көресіз. Нұсқаулықпен танысып, дайын болғанда бастаңыз.' },
  { question: 'Нәтижелерімді қайдан табамын?', answer: 'Жеке кабинеттегі «Нәтижелер» бөліміне өтіңіз. Онда аяқталған тесттер бойынша жинаған ұпайларыңызды қарай аласыз.' },
  { question: 'Өз тестімді жасай аламын ба?', answer: 'Тест жасау мұғалім кабинетінде қолжетімді. «Тест жасау» бөлімінде тест туралы ақпаратты толтырып, сұрақтар мен жауап нұсқаларын қосыңыз.' },
];
const features = [
  { icon: FileText, title: 'Тест құру', text: 'Сұрақтар мен тапсырмаларды бір жерде дайындаңыз.', href: '/login' },
  { icon: BarChart3, title: 'Нәтижені талдау', text: 'Нәтижелерді көріп, оқу барысын бақылаңыз.', href: '/login' },
  { icon: ShieldCheck, title: 'Жеке кабинет', text: 'Тесттер мен аяқталған жұмыстарға өз кабинетіңізден өтіңіз.', href: '/login' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const dashboard = user?.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard';
  const scroll = useRef<ScrollView>(null);
  const [featuresY, setFeaturesY] = useState(0);
  const [lowerY, setLowerY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [faqY, setFaqY] = useState(0);
  const [active, setActive] = useState('home');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const goTo = (section: string) => {
    setActive(section);
    const positions: Record<string, number> = { home: 0, features: featuresY, start: lowerY + startY, faq: lowerY + faqY };
    scroll.current?.scrollTo({ y: positions[section] ?? 0, animated: false });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5DFD7', backgroundColor: '#FCFAF6' }}>
        <View className="w-full max-w-[1480px] self-center px-5 lg:px-12 py-4 flex-row items-center justify-between gap-3">
          <BrandMark compact />
          <View className="hidden lg:flex flex-row items-center gap-6 xl:gap-8">
            {[['home','Басты бет'],['features','Мүмкіндіктер'],['start','Қалай бастауға болады'],['faq','Сұрақтар']].map(([key,label]) => <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{ selected: active === key }} onPress={() => goTo(key)} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: active === key ? wine : 'transparent' }}><Text style={{ fontFamily: serif, fontSize: 16, color: active === key ? wine : ink }}>{label}</Text></TouchableOpacity>)}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Link href="/login" className="hidden sm:flex" style={{ color: '#303745', fontSize: 15 }}>Кіру</Link>
            <Link href={(isAuthenticated ? dashboard : '/register') as any} asChild><TouchableOpacity className="landing-action" style={{ backgroundColor: wine, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 }}><Text style={{ color: '#FFFCF7', fontFamily: serif, fontSize: 18 }}>{isAuthenticated ? 'Кабинет' : 'Тіркелу'}</Text></TouchableOpacity></Link>
          </View>
        </View>
      </View>
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-[1480px] self-center px-5 lg:px-12 pt-8 lg:pt-4">
          <View className="flex-col lg:flex-row gap-9 lg:gap-10 items-stretch">
            <View className="flex-1 justify-center py-5 lg:py-12">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 30 }}><View style={{ width: 48, height: 1, backgroundColor: gold }} /><Text style={{ fontFamily: serif, color: gold, fontSize: 11, letterSpacing: 3 }}>БІЛІМ • БАҒАЛАУ • ДАМУ</Text></View>
              <Text accessibilityRole="header" className="text-[48px] leading-[53px] sm:text-[64px] sm:leading-[69px]" style={{ color: ink, fontFamily: serif, fontWeight: '700', letterSpacing: -2 }}>Білімге бастар{'\n'}<Text style={{ color: wine, fontStyle: 'italic' }}>айқын бағыт.</Text></Text>
              <Text className="text-[19px] leading-[29px] lg:text-[24px] lg:leading-[35px]" style={{ color: '#303745', marginTop: 28, maxWidth: 540 }}>Тест құру, білімді бағалау және нәтижені талдау — бір кеңістікте.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 32 }}>
                <Link href={(isAuthenticated ? dashboard : '/register') as any} asChild><TouchableOpacity className="landing-action" style={{ minHeight: 54, backgroundColor: wine, borderRadius: 5, paddingHorizontal: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}><Text style={{ color: '#FFFCF7', fontFamily: serif, fontSize: 22 }}>{isAuthenticated ? 'Кабинетке өту' : 'Тегін бастау'}</Text><ArrowUpRight size={19} color="#FFFCF7" /></TouchableOpacity></Link>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 24, marginTop: 36 }}>
                <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}><Monitor size={25} color={gold} strokeWidth={1.6} /><Text style={{ color: '#303745', fontSize: 14 }}>Қазақша интерфейс</Text></View>
                <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#D8BA96', paddingLeft: 24 }}><Zap size={25} color={gold} strokeWidth={1.6} /><Text style={{ color: '#303745', fontSize: 14 }}>Нәтиже бірден</Text></View>
              </View>
            </View>
            <View className="flex-1 justify-end">
              <View style={{ borderWidth: 1, borderColor: gold, borderTopLeftRadius: 420, borderTopRightRadius: 420, padding: 6, paddingBottom: 0, overflow: 'hidden' }}>
                <View style={{ width: '100%', aspectRatio: 1.12, overflow: 'hidden', borderTopLeftRadius: 420, borderTopRightRadius: 420, backgroundColor: '#E5D5CA' }}>
                  <Image source={require('../assets/library-hero.png')} accessibilityLabel="Биік аркалы терезесі мен кітап сөрелері бар классикалық кітапхана" resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} />
                </View>
              </View>
              <View style={{ height: 5, borderWidth: 1, borderColor: gold, marginHorizontal: -6, backgroundColor: '#FCFAF6' }} />
            </View>
          </View>
        </View>
        <View onLayout={event => setFeaturesY(event.nativeEvent.layout.y)} style={{ borderTopWidth: 1, borderTopColor: '#D8BA96', marginTop: 24 }}>
          <View className="w-full max-w-[1480px] self-center px-5 lg:px-12 py-8">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 16 }}><View style={{ width: 48, height: 1, backgroundColor: gold }} /><Text style={{ fontFamily: serif, color: gold, fontSize: 10, letterSpacing: 3 }}>ПЛАТФОРМА МҮМКІНДІКТЕРІ</Text></View>
            <Text accessibilityRole="header" className="text-[30px] leading-[38px] lg:text-[42px] lg:leading-[50px]" style={{ fontFamily: serif, fontWeight: '700', color: ink, letterSpacing: -1 }}>Оқу мен бағалауға қажет құралдар</Text>
            <View className="flex-col md:flex-row gap-7 lg:gap-10 mt-7">
              {features.map(({ icon: Icon, title, text, href }, index) => <Link key={title} href={(isAuthenticated ? dashboard : href) as any} asChild><TouchableOpacity className="academic-feature flex-1" style={{ flexDirection: 'row', gap: 20, paddingVertical: 4 }}><Text style={{ fontFamily: serif, fontSize: 42, color: '#C79563', lineHeight: 48 }}>0{index + 1}</Text><View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: '#D8BA96', paddingLeft: 20 }}><Icon size={33} color={wine} strokeWidth={1.6} /><Text style={{ fontFamily: serif, color: ink, fontWeight: '700', fontSize: 22, marginTop: 12 }}>{title}</Text><Text style={{ color: '#6E707A', fontSize: 14, lineHeight: 21, marginTop: 6, paddingRight: 22 }}>{text}</Text><ArrowRight size={21} color={wine} style={{ alignSelf: 'flex-end', marginTop: 8 }} /></View></TouchableOpacity></Link>)}
            </View>
          </View>
        </View>
        <View onLayout={event => setLowerY(event.nativeEvent.layout.y)} className="w-full max-w-[1480px] self-center px-5 lg:px-12 pb-8">
          <View onLayout={event => setStartY(event.nativeEvent.layout.y)} className="flex-col lg:flex-row gap-8 lg:gap-16 my-8 py-9 lg:py-12" style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#D8BA96' }}>
            <View className="lg:w-[38%]">
              <Text accessibilityRole="header" className="text-[32px] leading-[39px] lg:text-[40px] lg:leading-[47px]" style={{ fontFamily: serif, color: ink, fontWeight: '700', letterSpacing: -1 }}>Алғашқы қадамнан{ '\n' }нәтижеге дейін.</Text>
              <Text style={{ color: '#756D70', fontSize: 16, lineHeight: 25, marginTop: 16, maxWidth: 380 }}>Бәрі жеке кабинеттен басталады. Тесттеріңіз бен нәтижелеріңіз бір жерде.</Text>
              <Link href={(isAuthenticated ? dashboard : '/register') as any} asChild>
                <TouchableOpacity className="landing-action" style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: wine, borderRadius: 5, paddingVertical: 15, paddingHorizontal: 24, marginTop: 26 }}>
                  <Text style={{ color: '#FFFCF7', fontFamily: serif, fontSize: 20 }}>{isAuthenticated ? 'Кабинетке өту' : 'Тіркеліп бастау'}</Text>
                  <ArrowUpRight size={19} color="#FFFCF7" />
                </TouchableOpacity>
              </Link>
            </View>
            <View className="flex-1">
              {[
                { title: 'Жеке кабинет ашыңыз', description: 'Тіркеліп, өз аккаунтыңызға кіріңіз.' },
                { title: 'Тестті таңдаңыз', description: 'Қолжетімді тестті ашып, сұрақтарға жауап беріңіз.' },
                { title: 'Нәтижеңізді қараңыз', description: 'Жинаған ұпайыңызды көріп, келесі дайындықты жоспарлаңыз.' },
              ].map((step, index) => (
                <View key={step.title} style={{ flexDirection: 'row', gap: 22, paddingVertical: 20, borderTopWidth: index ? 1 : 0, borderTopColor: '#E5DFD7' }}>
                  <Text style={{ fontFamily: serif, color: gold, fontSize: 24, width: 30, lineHeight: 30 }}>{index + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: serif, color: ink, fontSize: 23, lineHeight: 29 }}>{step.title}</Text>
                    <Text style={{ color: '#756D70', fontSize: 14, lineHeight: 22, marginTop: 6 }}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View onLayout={event => setFaqY(event.nativeEvent.layout.y)} className="flex-col lg:flex-row gap-7 lg:gap-16 py-8 lg:py-12">
            <View className="lg:w-[38%]">
              <Text accessibilityRole="header" style={{ fontFamily: serif, fontSize: 34, lineHeight: 42, fontWeight: '700', color: ink, letterSpacing: -0.7 }}>Жиі қойылатын{ '\n' }сұрақтар</Text>
              <Text style={{ color: '#756D70', fontSize: 15, lineHeight: 24, marginTop: 14, maxWidth: 330 }}>Бастамас бұрын білгіңіз келетін бірнеше жауап.</Text>
            </View>
            <View className="flex-1" style={{ borderTopWidth: 1, borderTopColor: '#D8BA96' }}>
              {questions.map((item, index) => {
                const expanded = openQuestion === index;
                return (
                  <View key={item.question} style={{ borderBottomWidth: 1, borderBottomColor: '#E5DFD7' }}>
                    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={item.question} onPress={() => setOpenQuestion(expanded ? null : index)} style={{ minHeight: 76, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                      <Text style={{ flex: 1, fontFamily: serif, color: expanded ? wine : ink, fontSize: 21, lineHeight: 29 }}>{item.question}</Text>
                      <ChevronDown size={21} color={wine} strokeWidth={1.5} style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
                    </TouchableOpacity>
                    {expanded && <Text style={{ color: '#756D70', fontSize: 15, lineHeight: 25, paddingBottom: 24, paddingRight: 35 }}>{item.answer}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#E5DFD7', marginTop: 16, paddingTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}><BrandMark compact /><Text style={{ color: '#6E707A', fontSize: 12 }}>© 2026 LuminaPortal</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
