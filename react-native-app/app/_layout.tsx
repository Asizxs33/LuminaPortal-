import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import WebSidebar from '../components/WebSidebar';

const isWeb = Platform.OS === 'web';

if (isWeb) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Cannot record touch end without a touch start')) {
      return;
    }
    originalConsoleError(...args);
  };
}

export default function RootLayout() {
  const { width } = useWindowDimensions();
  // We constrain mobile Web styling if width > 500 without triggering the full desktop layout
  const isMobileDesktop = isWeb && width <= 768;

  return (
    <AuthProvider>
      {/* On Web, we wrap the whole app in a flex-row View to put Sidebar next to Stack */}
      <View style={{ flex: 1, height: isWeb ? '100vh' : '100%', flexDirection: isWeb && width > 768 ? 'row' : 'column', backgroundColor: isWeb ? '#eef1f8' : 'white', alignItems: isMobileDesktop ? 'center' : 'stretch' }}>
        
        {/* Sidebar conditionally renders via internal Platform check */}
        {(!isWeb || width > 768) && <WebSidebar />}
        
        {/* Main Content Area Wrapper */}
        <View style={{ flex: 1, height: '100%', alignItems: 'center', backgroundColor: isWeb ? '#eef1f8' : 'white' }}>
          
          <View style={[
            { flex: 1, height: '100%', overflow: 'hidden' as any, width: '100%' },
            // On web desktop, allow full expansion for landing page edge-to-edge
            isWeb && width > 768 && { flex: 1, backgroundColor: '#eef1f8' },
            // Mobile constrain (shadow frame)
            isMobileDesktop && { maxWidth: 500, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 40, elevation: 5 }
          ]}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
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
        </View>
      </View>

      <StatusBar style="auto" />
    </AuthProvider>
  );
}

