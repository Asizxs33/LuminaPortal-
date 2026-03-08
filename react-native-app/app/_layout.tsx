import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Platform } from 'react-native';
import WebSidebar from '../components/WebSidebar';
import { usePathname } from 'expo-router';

const AUTH_ROUTES = ['/login', '/register', '/'];

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDesktopWeb = Platform.OS === 'web' &&
    typeof window !== 'undefined' && window.innerWidth >= 768;
  const isAuthRoute = !pathname || AUTH_ROUTES.includes(pathname) || pathname === '';

  // Desktop + logged in: sidebar on left, constrained content on right
  if (isDesktopWeb && user && !isAuthRoute) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#eef1f8' }}>
        <WebSidebar />
        <View style={{ flex: 1, overflow: 'auto' as any, backgroundColor: '#eef1f8' }}>
          <View style={{ maxWidth: 960, width: '100%', alignSelf: 'center', flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  // Desktop + auth route: centered card layout
  if (isDesktopWeb && isAuthRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#eef1f8', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', maxWidth: 480, backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 32 } as any}>
          {children}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell>
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
        </AppShell>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
