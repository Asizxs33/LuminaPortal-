import React, { ReactNode } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Route, ShieldCheck } from 'lucide-react-native';
import BrandMark from './BrandMark';

export default function AuthScaffold({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAF6' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 flex-col lg:flex-row min-h-screen">
          <View className="hidden lg:flex lg:w-[46%] bg-[#64101C] px-14 py-12 justify-between overflow-hidden">
            <BrandMark inverse />
            <View style={{ maxWidth: 520 }}>
              <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(115,210,222,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <Route size={28} color="#D6AA75" />
              </View>
              <Text style={{ color: 'white', fontFamily: Platform.OS === 'web' ? 'Georgia, Times New Roman, serif' : 'serif', fontSize: 44, lineHeight: 50, fontWeight: '700', letterSpacing: -1.6 }}>Оқудағы келесі қадам әрқашан анық.</Text>
              <Text style={{ color: '#E3CDC8', fontSize: 17, lineHeight: 27, marginTop: 20, maxWidth: 470 }}>Берілген тесттерді орындап, аяқталған жұмыстардың нәтижелерін жеке кабинеттен қараңыз.</Text>
              <View style={{ gap: 14, marginTop: 34 }}>
                {[['Нәтиже бірден көрінеді', CheckCircle2], ['Өз нәтижелеріңіз сақталады', ShieldCheck]].map(([label, Icon]: any) => (
                  <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                    <Icon size={19} color="#E2BE8E" />
                    <Text style={{ color: '#F5E9E3', fontSize: 15, fontWeight: '700' }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={{ color: '#C69E94', fontSize: 12 }}>LuminaPortal · Қауіпсіз бағалау ортасы</Text>
          </View>
          <View className="flex-1 px-5 py-8 lg:px-16 lg:py-12 justify-center items-center">
            <View className="flex lg:hidden self-start mb-10"><BrandMark /></View>
            <View style={{ width: '100%', maxWidth: 480 }}>
              <Text style={{ color: '#271C20', fontFamily: Platform.OS === 'web' ? 'Georgia, Times New Roman, serif' : 'serif', fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -1 }}>{title}</Text>
              <Text style={{ color: '#756D70', fontSize: 16, lineHeight: 24, marginTop: 9, marginBottom: 30 }}>{subtitle}</Text>
              {children}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
