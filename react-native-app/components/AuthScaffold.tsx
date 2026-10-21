import React, { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Route, ShieldCheck } from 'lucide-react-native';
import BrandMark from './BrandMark';

export default function AuthScaffold({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 flex-col lg:flex-row min-h-screen">
          <View className="hidden lg:flex lg:w-[46%] bg-[#16213E] px-14 py-12 justify-between overflow-hidden">
            <BrandMark inverse />
            <View style={{ maxWidth: 520 }}>
              <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(115,210,222,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <Route size={28} color="#73D2DE" />
              </View>
              <Text style={{ color: 'white', fontSize: 44, lineHeight: 50, fontWeight: '900', letterSpacing: -1.6 }}>Оқудағы келесі қадам әрқашан анық.</Text>
              <Text style={{ color: '#B8C4DD', fontSize: 17, lineHeight: 27, marginTop: 20, maxWidth: 470 }}>Тесттер, нәтижелер және оқу қарқыны бір сенімді кеңістікте.</Text>
              <View style={{ gap: 14, marginTop: 34 }}>
                {[['Нәтиже бірден көрінеді', CheckCircle2], ['Рөл автоматты анықталады', ShieldCheck]].map(([label, Icon]: any) => (
                  <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                    <Icon size={19} color="#B8E34A" />
                    <Text style={{ color: '#E8ECF5', fontSize: 15, fontWeight: '700' }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={{ color: '#8190AF', fontSize: 12 }}>LuminaPortal · Қауіпсіз бағалау ортасы</Text>
          </View>
          <View className="flex-1 px-5 py-8 lg:px-16 lg:py-12 justify-center items-center">
            <View className="flex lg:hidden self-start mb-10"><BrandMark /></View>
            <View style={{ width: '100%', maxWidth: 480 }}>
              <Text style={{ color: '#16213E', fontSize: 34, lineHeight: 41, fontWeight: '900', letterSpacing: -1 }}>{title}</Text>
              <Text style={{ color: '#69758B', fontSize: 16, lineHeight: 24, marginTop: 9, marginBottom: 30 }}>{subtitle}</Text>
              {children}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
