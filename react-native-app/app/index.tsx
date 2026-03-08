import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Zap, BarChart3, Users, Lock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
          <View className="flex-row items-center gap-2">
            <BookOpen size={28} color="#4848e5" />
            <Text className="text-xl font-black tracking-tight text-slate-900">LuminaPortal</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {!isAuthenticated ? (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/login')}
                  className="px-4 py-2 rounded-xl border border-slate-200"
                >
                  <Text className="text-slate-700 text-sm font-bold">Кіру</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/register')}
                  className="px-4 py-2 bg-[#4848e5] rounded-xl"
                >
                  <Text className="text-white text-sm font-bold">Тіркелу</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={logout}
                className="px-4 py-2 bg-slate-100 rounded-xl"
              >
                <Text className="text-slate-700 text-sm font-bold">Шығу</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View className="px-6 pt-14 pb-10 items-center">
          <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-[#4848e5]/10 mb-6">
            <Zap size={14} color="#4848e5" />
            <Text className="text-[#4848e5] text-xs font-bold">Жаңа буынды бағалау платформасы</Text>
          </View>

          <Text className="text-4xl text-center font-black tracking-tight text-slate-900 mb-5 leading-tight">
            <Text className="text-[#4848e5]">Дәлдікпен</Text>
            {' '}және сенімділікпен{'\n'}бағалаңыз
          </Text>

          <Text className="text-base text-center text-slate-500 mb-8 leading-relaxed">
            LuminaPortal — заманауи білім беру мекемелері мен кәсіпорындар үшін қауіпсіз, масштабталатын және интеллектуалды бағалау құралы.
          </Text>

          <TouchableOpacity
            onPress={handleStart}
            className="w-full bg-[#4848e5] py-4 rounded-2xl flex-row items-center justify-center gap-3 mb-4"
          >
            <Text className="text-white text-lg font-black">
              {isAuthenticated ? 'Панельге өту' : 'Тегін бастау'}
            </Text>
            <ArrowRight size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="w-full border border-slate-200 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Text className="text-slate-700 text-base font-bold">Кіру</Text>
          </TouchableOpacity>

          {/* Trust badges */}
          <View className="flex-row flex-wrap justify-center gap-4 mt-8">
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#10b981" />
              <Text className="text-xs font-semibold text-slate-500">ЖИ генератор</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#10b981" />
              <Text className="text-xs font-semibold text-slate-500">Анти-чит</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#10b981" />
              <Text className="text-xs font-semibold text-slate-500">Нақты уақыт</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-6 bg-[#4848e5] rounded-3xl p-6 mb-8">
          <Text className="text-white text-center font-bold text-base mb-6 opacity-80">Платформа статистикасы</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-white text-3xl font-black">10K+</Text>
              <Text className="text-white/70 text-xs mt-1">Студент</Text>
            </View>
            <View className="w-px bg-white/20" />
            <View className="items-center">
              <Text className="text-white text-3xl font-black">500+</Text>
              <Text className="text-white/70 text-xs mt-1">Тест</Text>
            </View>
            <View className="w-px bg-white/20" />
            <View className="items-center">
              <Text className="text-white text-3xl font-black">98%</Text>
              <Text className="text-white/70 text-xs mt-1">Дәлдік</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="px-6 mb-8">
          <Text className="text-2xl font-black text-slate-900 mb-2">Платформа мүмкіндіктері</Text>
          <Text className="text-slate-500 mb-6">Әкімшілер мен студенттерге арналған интерфейстер.</Text>

          {/* Feature cards */}
          <View className="gap-4">
            <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <View className="h-12 w-12 bg-blue-100 rounded-xl items-center justify-center mb-4">
                <BarChart3 size={24} color="#4848e5" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">Нақты уақыт аналитика</Text>
              <Text className="text-slate-500 text-sm leading-relaxed">
                Студенттердің нәтижелерін графиктер мен кестелер арқылы бақылаңыз.
              </Text>
            </View>

            <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <View className="h-12 w-12 bg-emerald-100 rounded-xl items-center justify-center mb-4">
                <ShieldCheck size={24} color="#10b981" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">Қауіпсіздік кепілдігі</Text>
              <Text className="text-slate-500 text-sm leading-relaxed">
                Анти-чит механизмі және мобилді платформада сенімді тестілеу.
              </Text>
            </View>

            <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <View className="h-12 w-12 bg-purple-100 rounded-xl items-center justify-center mb-4">
                <Zap size={24} color="#9333ea" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">ЖИ сұрақ генераторы</Text>
              <Text className="text-slate-500 text-sm leading-relaxed">
                Жасанды интеллект көмегімен тақырып бойынша сұрақтарды автоматты жасаңыз.
              </Text>
            </View>

            <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <View className="h-12 w-12 bg-amber-100 rounded-xl items-center justify-center mb-4">
                <Users size={24} color="#d97706" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">Рөлдік жүйе</Text>
              <Text className="text-slate-500 text-sm leading-relaxed">
                Студент және Әкімші — әрқайсысына арнайы функционал және интерфейс.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View className="mx-6 bg-slate-900 rounded-3xl p-8 items-center mb-8">
          <Lock size={32} color="#6366f1" className="mb-4" />
          <Text className="text-white text-2xl font-black text-center mb-3">Бүгін бастаңыз</Text>
          <Text className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
            Платформаның барлық мүмкіндіктеріне ие болыңыз — толығымен тегін.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="bg-[#4848e5] w-full py-4 rounded-xl items-center"
          >
            <Text className="text-white font-black text-base">Тіркелу — Тегін</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="px-6 pt-2 pb-4 items-center border-t border-slate-100">
          <View className="flex-row items-center gap-2 mb-2">
            <BookOpen size={18} color="#94a3b8" />
            <Text className="text-slate-400 font-semibold text-sm">LuminaPortal</Text>
          </View>
          <Text className="text-slate-400 text-xs">© 2026 Барлық құқықтар қорғалған.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
