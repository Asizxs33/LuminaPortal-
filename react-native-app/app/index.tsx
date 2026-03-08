import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Zap, BarChart3, Users, Lock, ChevronRight, Play, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from 'expo-router';

const AbstractHeroGraphic = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', height: 400 }}>
    {/* Background glow / shapes */}
    <View style={{ position: 'absolute', width: 300, height: 300, backgroundColor: '#eef2ff', borderRadius: 150, top: 40, right: 20 }} />
    <View style={{ position: 'absolute', width: 200, height: 200, backgroundColor: '#fdf4ff', borderRadius: 100, bottom: 20, left: 40 }} />
    
    {/* Main glass card mock */}
    <View style={{ 
      width: 380, backgroundColor: 'white', padding: 24, borderRadius: 24, 
      shadowColor: '#4848e5', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 40,
      elevation: 10, borderWidth: 1, borderColor: '#f1f5f9', zIndex: 10
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ gap: 6 }}>
          <View style={{ width: 120, height: 12, backgroundColor: '#e2e8f0', borderRadius: 6 }} />
          <View style={{ width: 80, height: 10, backgroundColor: '#f1f5f9', borderRadius: 5 }} />
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#4848e5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>98</Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' }}>
           <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="#4848e5" /></View>
           <View style={{ flex: 1, height: 10, backgroundColor: '#cbd5e1', borderRadius: 5 }} />
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#10b981' }}>
           <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="#10b981" /></View>
           <View style={{ flex: 1, height: 10, backgroundColor: '#10b981', borderRadius: 5 }} />
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' }}>
           <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="#4848e5" /></View>
           <View style={{ width: '60%', height: 10, backgroundColor: '#cbd5e1', borderRadius: 5 }} />
         </View>
      </View>

      <View style={{ marginTop: 24, height: 48, backgroundColor: '#4848e5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
         <View style={{ width: 100, height: 10, backgroundColor: 'white', borderRadius: 5, opacity: 0.8 }} />
      </View>
    </View>
    
    {/* Floating element */}
    <View style={{
      position: 'absolute', top: 60, left: -20, backgroundColor: 'white', padding: 16, borderRadius: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
      flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 20
    }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef08a', alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={16} color="#ca8a04" />
      </View>
      <View>
        <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 13 }}>ЖИ Анализ</Text>
        <Text style={{ color: '#64748b', fontSize: 11 }}>Дайын</Text>
      </View>
    </View>
  </View>
);

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const handleStart = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') router.push('/(admin)/dashboard');
      else router.push('/(student)/dashboard');
    } else {
      router.push('/login');
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
          {/* ----- HEADER ----- */}
          <View className="border-b border-slate-100 bg-white">
            <View className="flex-row items-center justify-between px-4 md:px-8 py-4 self-center w-full max-w-[1400px]">
              <View className="flex-row items-center gap-2 md:gap-3">
                <View className="bg-indigo-600 p-2 md:p-2.5 rounded-xl">
                  <BookOpen size={20} color="white" />
                </View>
                <Text className="text-[18px] md:text-[22px] font-black text-slate-900 tracking-tight">LuminaPortal</Text>
              </View>
              <View className="flex-row items-center gap-2 md:gap-3">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" asChild>
                      <TouchableOpacity className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl">
                        <Text className="text-slate-600 text-[14px] md:text-[15px] font-bold">Кіру</Text>
                      </TouchableOpacity>
                    </Link>
                    <Link href="/register" asChild>
                      <TouchableOpacity className="px-4 md:px-5 py-2 md:py-3 bg-slate-900 rounded-xl">
                        <Text className="text-white text-[14px] md:text-[15px] font-bold">Тіркелу</Text>
                      </TouchableOpacity>
                    </Link>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={logout}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-slate-100 rounded-xl"
                  >
                    <Text className="text-slate-600 text-[14px] md:text-[15px] font-bold">Шығу</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* ----- MAIN CONTENT WRAPPER ----- */}
          <View style={{ flex: 1, width: '100%', maxWidth: 1400, alignSelf: 'center' }}>
            
            {/* HERO SECTION */}
            <View className="flex-col lg:flex-row items-center px-4 lg:px-16 pt-10 lg:pt-20 pb-10 lg:pb-16 gap-10">
              
              {/* Text Side */}
              <View className="items-center lg:items-start w-full lg:flex-1">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eef2ff', marginBottom: 24 }}>
                  <Zap size={16} color="#4848e5" />
                  <Text style={{ color: '#4848e5', fontSize: 14, fontWeight: '800' }}>Жаңа буынды платформа</Text>
                </View>

                <Text className="text-[40px] lg:text-[56px] text-center lg:text-left font-black text-slate-900 mb-6 leading-[48px] lg:leading-[64px] tracking-tight">
                  Оқу процесін <Text style={{ color: '#4848e5' }}>сандық</Text> деңгейге көтеріңіз
                </Text>

                <Text className="text-lg text-center lg:text-left text-slate-500 mb-10 leading-7 lg:max-w-[90%]">
                  LuminaPortal — сіздің оқу орныңызға немесе бизнесіңізге арналған қауіпсіз, ЖИ қамтылған және ең озық онлайн бағалау жүйесі. 
                </Text>

                <View className="flex-col lg:flex-row w-full lg:w-auto gap-4 items-center">
                  <Link href={isAuthenticated ? (user?.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard') : '/login'} asChild>
                    <TouchableOpacity className="flex-row items-center justify-center gap-3 bg-indigo-600 px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 w-full lg:w-auto">
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>
                        {isAuthenticated ? 'Панельге өту' : 'Тегін бастау'}
                      </Text>
                      <ArrowRight size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </Link>

                  <Link href="/login" asChild>
                    <TouchableOpacity className="flex-row items-center justify-center gap-3 bg-indigo-600 px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 w-full lg:w-auto">
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>Бастау</Text>
                      <ArrowRight size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Trust badges */}
                <View className="flex-row flex-wrap justify-center lg:justify-start gap-5 mt-10">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>ЖИ генератор</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>Анти-чит</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>Нақты уақыт</Text>
                  </View>
                </View>
              </View>

              {/* Graphic Side (Desktop Only) */}
              <View className="hidden lg:flex lg:flex-1 items-center justify-center">
                <AbstractHeroGraphic />
              </View>

            </View>

            {/* FULL WIDTH STATS BANNER */}
            <View className="mx-4 md:mx-6 lg:mx-10 bg-slate-900 rounded-[32px] p-10 mb-16 lg:mb-20 flex-col md:flex-row justify-around items-center gap-10 lg:gap-8 shadow-2xl shadow-indigo-900/10">
              <View className="items-center">
                <Text className="text-[#38bdf8] text-5xl md:text-5xl lg:text-5xl font-black tracking-tighter">10K+</Text>
                <Text className="text-slate-400 text-sm md:text-base font-bold mt-2 uppercase tracking-wide">Студент</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#a78bfa] text-5xl md:text-5xl lg:text-5xl font-black tracking-tighter">500+</Text>
                <Text className="text-slate-400 text-sm md:text-base font-bold mt-2 uppercase tracking-wide">Тест & Құжат</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#34d399] text-5xl md:text-5xl lg:text-5xl font-black tracking-tighter">98%</Text>
                <Text className="text-slate-400 text-sm md:text-base font-bold mt-2 uppercase tracking-wide">Дәлдік</Text>
              </View>
            </View>

            {/* FEATURES */}
            <View style={{ paddingHorizontal: '5%', marginBottom: 80 }}>
              <View style={{ alignItems: 'center', marginBottom: 40 }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -1, textAlign: 'center' }}>
                  Мүмкіндіктердің <Text style={{ color: '#4848e5' }}>жаңа шегі</Text>
                </Text>
                <Text style={{ fontSize: 18, color: '#64748b', textAlign: 'center', maxWidth: 600, lineHeight: 28 }}>
                  Сізге оқу процесін бақылау және басқару үшін қажетті барлық құралдар бір жерде жинақталған.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between' }}>
                {[
                  { icon: <BarChart3 size={28} color="#4848e5" />, title: 'Нақты уақыт аналитика', desc: 'Студенттердің нәтижелерін графиктер мен кестелер арқылы бақылаңыз.', bg: '#eef2ff' },
                  { icon: <ShieldCheck size={28} color="#10b981" />, title: 'Қауіпсіздік кепілдігі', desc: 'Анти-чит механизмі және мобилді платформада сенімді тестілеу.', bg: '#dcfce7' },
                  { icon: <Sparkles size={28} color="#9333ea" />, title: 'ЖИ сұрақ генераторы', desc: 'Жасанды интеллект көмегімен тақырып бойынша сұрақтарды автоматты жасаңыз.', bg: '#f3e8ff' },
                  { icon: <Users size={28} color="#ea580c" />, title: 'Рөлдік жүйе', desc: 'Студент және Әкімші — әрқайсысына арнайы функционал және интерфейс.', bg: '#ffedd5' },
                ].map((ft, idx) => (
                  <View key={idx} style={{ 
                    flexBasis: 300, flexGrow: 1, 
                    backgroundColor: '#f8fafc', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0',
                    gap: 20
                  }}>
                    <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: ft.bg, alignItems: 'center', justifyContent: 'center' }}>
                      {ft.icon}
                    </View>
                    <View>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 10 }}>{ft.title}</Text>
                      <Text style={{ fontSize: 15, color: '#64748b', lineHeight: 24 }}>{ft.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA */}
            <View className="px-5 w-full self-center mb-16">
              <View className="bg-indigo-600 p-8 md:p-12 rounded-[32px] items-center flex-col gap-8 overflow-hidden relative w-full shadow-2xl shadow-indigo-600/20">
                {/* Decorative circles */}
                <View className="absolute w-[400px] h-[400px] rounded-full bg-white/10 -top-[200px] -right-[100px]" />
                <View className="absolute w-[200px] h-[200px] rounded-full bg-white/5 -bottom-[50px] -left-[50px]" />

                <View className="z-10 items-center">
                  <Text className="text-white text-3xl md:text-4xl font-black mb-4 text-center tracking-tight">Келесі қадам жасаңыз</Text>
                  <Text className="text-indigo-100 text-[16px] md:text-lg text-center leading-7 max-w-[500px]">
                    Платформаның барлық мүмкіндіктеріне ие болыңыз. Тегін тіркеліп, студенттеріңізді бүгіннен бастап бағалаңыз.
                  </Text>
                </View>

                <Link href="/register" asChild>
                  <TouchableOpacity className="bg-white py-4 md:py-5 px-8 md:px-10 rounded-full flex-row items-center justify-center gap-3 shadow-xl shadow-black/10 z-10 w-full sm:w-auto">
                    <Text className="text-indigo-600 text-[16px] md:text-lg font-black">Тіркелу — Тегін</Text>
                    <ArrowRight size={20} color="#4848e5" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* FOOTER */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 40, paddingHorizontal: '5%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <View style={{ backgroundColor: '#f1f5f9', padding: 6, borderRadius: 8 }}>
                  <BookOpen size={16} color="#64748b" />
                 </View>
                 <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>LuminaPortal</Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '600' }}>© 2026 Барлық құқықтар қорғалған.</Text>
            </View>

          </View>
        </ScrollView>
    </SafeAreaView>
  );
}
