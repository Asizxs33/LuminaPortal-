import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, Shield, BookOpen, ChevronRight, Settings, ArrowLeft, GraduationCap } from 'lucide-react-native';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    const performLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Жүйеден шығуды растаңыз')) performLogout();
    } else {
      Alert.alert(
        'Шығу',
        'Жүйеден шығуды растаңыз',
        [
          { text: 'Бас тарту', style: 'cancel' },
          {
            text: 'Шығу',
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment-50 relative overflow-hidden">
      {/* Soft decorative background orbs */}
      <ScrollView className="flex-1" contentContainerClassName="p-6 md:p-10 pb-20">

        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#756D70" />
          <Text className="text-parchment-500 font-bold">Артқа</Text>
        </TouchableOpacity>

        <View className="max-w-[700px] w-full mx-auto">
          {/* Header */}
          <Text className="font-display text-3xl font-bold text-parchment-900 tracking-tight mb-8">Профиль</Text>

          {/* Avatar Card */}
          <View className="bg-white rounded-xl p-8 items-center border border-parchment-200   mb-6">
            <View className="w-24 h-24 rounded-full bg-academic-600 items-center justify-center mb-4  ">
              <Text className="font-display text-white text-3xl font-bold">{getInitials(user?.name || '')}</Text>
            </View>

            <Text className="font-display text-2xl font-bold text-parchment-900">{user?.name || 'Пайдаланушы'}</Text>
            <Text className="text-parchment-500 mt-1 text-base font-medium">{user?.email}</Text>

            <View className="flex-row items-center gap-1.5 bg-academic-50 px-4 py-2 rounded-full mt-4 border border-academic-100">
               <Shield size={16} color="#800F1D" />
               <Text className="text-academic-600 font-bold text-[14px]">Әкімші</Text>
            </View>
          </View>

          {/* Info blocks */}
          <View className="bg-white rounded-xl border border-parchment-200   mb-6 overflow-hidden">
            <View className="p-6 border-b border-parchment-100/60 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-academic-50 items-center justify-center">
                <User size={22} color="#800F1D" />
              </View>
              <View className="flex-1">
                <Text className="text-[12px] text-parchment-400 font-bold tracking-wider mb-1">АТЫ-ЖӨНІ</Text>
                <Text className="text-base font-bold text-parchment-900">{user?.name}</Text>
              </View>
            </View>

            <View className="p-6 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">
                <Mail size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-[12px] text-parchment-400 font-bold tracking-wider mb-1">ЭЛЕКТРОНДЫҚ ПОШТА</Text>
                <Text className="text-base font-bold text-parchment-900">{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Quick Links */}
          <View className="bg-white rounded-xl border border-parchment-200   mb-8 overflow-hidden">
             
             {/* Go to Student View */}
             <TouchableOpacity
               className="p-6 flex-row items-center gap-4 border-b border-parchment-100/60 active:bg-parchment-50/50 transition-colors"
               onPress={() => router.push('/(student)/dashboard')}
             >
               <View className="w-12 h-12 rounded-xl bg-teal-50 items-center justify-center">
                 <GraduationCap size={22} color="#0d9488" />
               </View>
               <Text className="flex-1 text-base font-bold text-parchment-900">Студент порталына өту</Text>
               <ChevronRight size={20} color="#DFD2C3" />
             </TouchableOpacity>

             <TouchableOpacity
               className="p-6 flex-row items-center gap-4 border-b border-parchment-100/60 active:bg-parchment-50/50 transition-colors"
               onPress={() => Alert.alert('Жақында', 'Бұл мүмкіндік дайындалуда')}
             >
               <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center">
                 <Settings size={22} color="#f97316" />
               </View>
               <Text className="flex-1 text-base font-bold text-parchment-900">Баптаулар</Text>
               <ChevronRight size={20} color="#DFD2C3" />
             </TouchableOpacity>

             <TouchableOpacity
               className="p-6 flex-row items-center gap-4 active:bg-parchment-50/50 transition-colors"
               onPress={() => Alert.alert('LuminaPortal', 'Нұсқа: 1.0.0')}
             >
               <View className="w-12 h-12 rounded-xl bg-academic-50 items-center justify-center">
                 <BookOpen size={22} color="#a855f7" />
               </View>
               <Text className="flex-1 text-base font-bold text-parchment-900">LuminaPortal туралы</Text>
               <ChevronRight size={20} color="#DFD2C3" />
             </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-3 bg-red-50 py-5 rounded-xl border border-red-100 active:bg-red-100 transition-colors"
          >
            <LogOut size={22} color="#dc2626" />
            <Text className="text-red-600 font-bold text-lg">Жүйеден шығу</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
