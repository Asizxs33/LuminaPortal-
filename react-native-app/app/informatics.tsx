import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// The old catalogue was retired; keep bookmarked links useful.
export default function RetiredInformaticsTests() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#FCFAF7',gap:12}}>
      <ActivityIndicator size="large" color="#990F2E" accessibilityLabel="Авторизация тексерілуде"/>
      <Text style={{fontSize:14,color:'#7C879D'}}>Жүйеге кіру тексерілуде…</Text>
    </View>;
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  return <Redirect href={['admin','teacher'].includes(user?.role || '') ? '/(admin)/dashboard' : '/(student)/dashboard'} />;
}
