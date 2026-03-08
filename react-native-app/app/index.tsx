import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Zap, BarChart3, Users, Lock, ChevronRight, Play, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const handleStart = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') router.push('/(admin)/dashboard');
      else router.push('/(student)/dashboard');
    } else {
      router.push('/login');
    }
  };


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ----- HEADER ----- */}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: 'white' }}>
            <View style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
              paddingHorizontal: isDesktop ? 60 : 24, paddingVertical: 16, 
              alignSelf: 'center', width: '100%'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ backgroundColor: '#4848e5', padding: 8, borderRadius: 10 }}>
                  <BookOpen size={20} color="white" />
                </View>
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>LuminaPortal</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {!isAuthenticated ? (
                  <>
                    <TouchableOpacity
                      onPress={() => router.push('/login')}
                      style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
                    >
                      <Text style={{ color: '#475569', fontSize: 15, fontWeight: '700' }}>Кіру</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push('/register')}
                      style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#0f172a', borderRadius: 12 }}
                    >
                      <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Тіркелу</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={logout}
                    style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 12 }}
                  >
                    <Text style={{ color: '#475569', fontSize: 15, fontWeight: '700' }}>Шығу</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* ----- MAIN CONTENT WRAPPER ----- */}
          <View style={{ flex: 1, width: '100%' }}>
            
            {/* HERO SECTION */}
            <View style={{ 
              flexDirection: isDesktop ? 'row' : 'column', 
              alignItems: 'center', 
              paddingHorizontal: isDesktop ? 60 : 24, 
              paddingTop: isDesktop ? 80 : 40,
              paddingBottom: isDesktop ? 60 : 40,
              gap: 40
            }}>
              {/* Text Side */}
              <View style={[ { alignItems: isDesktop ? 'flex-start' : 'center', width: '100%' }, isDesktop && { flex: 1 } ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eef2ff', marginBottom: 24 }}>
                  <Zap size={16} color="#4848e5" />
                  <Text style={{ color: '#4848e5', fontSize: 14, fontWeight: '800' }}>Жаңа буынды платформа</Text>
                </View>

                <Text style={{ 
                  fontSize: isDesktop ? 56 : 40, 
                  textAlign: isDesktop ? 'left' : 'center', 
                  fontWeight: '900', 
                  color: '#0f172a', 
                  marginBottom: 24, 
                  lineHeight: isDesktop ? 64 : 48,
                  letterSpacing: -1.5
                }}>
                  Оқу процесін <Text style={{ color: '#4848e5' }}>сандық</Text> деңгейге көтеріңіз
                </Text>

                <Text style={{ 
                  fontSize: isDesktop ? 18 : 16, 
                  textAlign: isDesktop ? 'left' : 'center', 
                  color: '#64748b', 
                  marginBottom: 40, 
                  lineHeight: 28,
                  maxWidth: isDesktop ? '90%' : '100%'
                }}>
                  LuminaPortal — сіздің оқу орныңызға немесе бизнесіңізге арналған қауіпсіз, ЖИ қамтылған және ең озық онлайн бағалау жүйесі. 
                </Text>

                <View style={{ flexDirection: isDesktop || isTablet ? 'row' : 'column', width: '100%', gap: 16, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={handleStart}
                    style={{ 
                      backgroundColor: '#4848e5', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16, 
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
                      width: isDesktop || isTablet ? 'auto' : '100%',
                      shadowColor: '#4848e5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>
                      {isAuthenticated ? 'Панельге өту' : 'Тегін бастау'}
                    </Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/login')}
                    style={{ 
                      backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, 
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
                      width: isDesktop || isTablet ? 'auto' : '100%'
                    }}
                  >
                    <Play size={20} color="#64748b" />
                    <Text style={{ color: '#475569', fontSize: 16, fontWeight: '800' }}>Демо қарау</Text>
                  </TouchableOpacity>
                </View>

                {/* Trust badges */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: isDesktop ? 'flex-start' : 'center', gap: 20, marginTop: 40 }}>
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

              {/* Graphic Side */}
              {isDesktop && (
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <AbstractHeroGraphic />
                </View>
              )}
            </View>

            {/* FULL WIDTH STATS BANNER */}
            <View style={{ 
              marginHorizontal: isDesktop ? 60 : 24, 
              backgroundColor: '#0f172a', 
              borderRadius: 32, 
              padding: isDesktop ? 60 : 32, 
              marginBottom: 80,
              flexDirection: isTablet || isDesktop ? 'row' : 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              gap: isTablet || isDesktop ? 0 : 40,
              shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 10
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#38bdf8', fontSize: isDesktop ? 48 : 40, fontWeight: '900', letterSpacing: -1 }}>10K+</Text>
                <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Студент</Text>
              </View>
              {(isTablet || isDesktop) && <View style={{ width: 1, height: 60, backgroundColor: '#334155' }} />}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#a78bfa', fontSize: isDesktop ? 48 : 40, fontWeight: '900', letterSpacing: -1 }}>500+</Text>
                <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Тест & Құжат</Text>
              </View>
              {(isTablet || isDesktop) && <View style={{ width: 1, height: 60, backgroundColor: '#334155' }} />}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#34d399', fontSize: isDesktop ? 48 : 40, fontWeight: '900', letterSpacing: -1 }}>98%</Text>
                <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Дәлдік</Text>
              </View>
            </View>

            {/* FEATURES */}
            <View style={{ paddingHorizontal: isDesktop ? 60 : 24, marginBottom: 80 }}>
              <View style={{ alignItems: isDesktop ? 'center' : 'flex-start', marginBottom: 40 }}>
                <Text style={{ fontSize: isDesktop ? 40 : 32, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -1, textAlign: isDesktop ? 'center' : 'left' }}>
                  Мүмкіндіктердің <Text style={{ color: '#4848e5' }}>жаңа шегі</Text>
                </Text>
                <Text style={{ fontSize: 18, color: '#64748b', textAlign: isDesktop ? 'center' : 'left', maxWidth: 600, lineHeight: 28 }}>
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
                    width: isDesktop ? '48%' : (isTablet ? '48%' : '100%'), 
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
            <View style={{ marginHorizontal: isDesktop ? 60 : 24, marginBottom: 60 }}>
              <View style={{ 
                backgroundColor: '#4848e5', padding: isDesktop ? 60 : 32, borderRadius: 32,
                flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between',
                gap: 32, overflow: 'hidden', position: 'relative'
              }}>
                {/* Decorative circles */}
                <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.1)', top: -200, right: -100 }} />
                <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -50 }} />

                <View style={[ { zIndex: 10 }, isDesktop && { flex: 1 } ]}>
                  <Text style={{ color: 'white', fontSize: isDesktop ? 40 : 32, fontWeight: '900', marginBottom: 16, textAlign: isDesktop ? 'left' : 'center', letterSpacing: -1 }}>Келесі қадам жасаңыз</Text>
                  <Text style={{ color: '#e0e7ff', fontSize: 18, textAlign: isDesktop ? 'left' : 'center', lineHeight: 28, maxWidth: 500 }}>
                    Платформаның барлық мүмкіндіктеріне ие болыңыз. Тегін тіркеліп, студенттеріңізді бүгіннен бастап бағалаңыз.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/register')}
                  style={{ 
                    backgroundColor: 'white', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 100,
                    flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
                    zIndex: 10
                  }}
                >
                  <Text style={{ color: '#4848e5', fontSize: 18, fontWeight: '800' }}>Тіркелу — Тегін</Text>
                  <ArrowRight size={20} color="#4848e5" />
                </TouchableOpacity>
              </View>
            </View>

            {/* FOOTER */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 40, paddingHorizontal: isDesktop ? 60 : 24, flexDirection: isDesktop || isTablet ? 'row' : 'column', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
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
    </SafeAreaProvider>
  );
}
