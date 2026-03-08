import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import WebSidebar from '../components/WebSidebar';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* Sidebar renders itself only on desktop web via internal Platform check */}
        {isWeb && <WebSidebar />}
        <div id="main-content" style={isWeb ? undefined : undefined}>
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
        </div>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

