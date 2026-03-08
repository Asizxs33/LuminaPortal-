import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import WebSidebar from '../components/WebSidebar';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const { width } = useWindowDimensions();
  // We constrain mobile Web styling if width > 500 without triggering the full desktop layout
  const isMobileDesktop = isWeb && width <= 768;

  return (
    <AuthProvider>
      {/* On Web, we wrap the whole app in a flex-row View to put Sidebar next to Stack */}
      <View style={{ flex: 1, flexDirection: isWeb && width > 768 ? 'row' : 'column', backgroundColor: isWeb ? '#eef1f8' : 'white', alignItems: isMobileDesktop ? 'center' : 'stretch' }}>
        
        {/* Sidebar conditionally renders via internal Platform check */}
        {(!isWeb || width > 768) && <WebSidebar />}
        
        {/* Main Content Area */}
        <View style={[
          { flex: 1, overflow: 'hidden' as any, width: '100%' },
          // On web, add a max-width and center it to prevent stretching
          isWeb && width > 768 && { maxWidth: 960, alignSelf: 'center', backgroundColor: '#eef1f8' },
          // Mobile constrain
          isMobileDesktop && { maxWidth: 500, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 40, elevation: 5 }
        ]}>
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
      </View>

      <StatusBar style="auto" />
    </AuthProvider>
  );
}

