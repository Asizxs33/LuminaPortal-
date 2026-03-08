import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import WebSidebar from '../components/WebSidebar';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* Sidebar conditionally renders via internal Platform check */}
        <WebSidebar />
        
        {/* Wrap Stack in a standard View. Native HTML divs break RN Gesture Responder */}
        <View 
          style={isWeb ? ({ marginLeft: 'var(--sidebar-width, 0px)', flex: 1 } as any) : { flex: 1 }}
          className={isWeb ? 'layout-main-content' : undefined}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="test/[id]/start" />
            <Stack.Screen name="test/[id]/take" />
            <Stack.Screen name="test/[id]/result" />
          </Stack>
        </View>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

