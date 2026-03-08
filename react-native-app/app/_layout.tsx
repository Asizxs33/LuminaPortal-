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
    <AuthProvider>
      {/* On Web, we wrap the whole app in a flex-row View to put Sidebar next to Stack */}
      <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', backgroundColor: isWeb ? '#eef1f8' : 'white' }}>
        
        {/* Sidebar conditionally renders via internal Platform check */}
        <WebSidebar />
        
        {/* Main Content Area */}
        <View style={[
          { flex: 1, overflow: 'hidden' as any },
          // On web, add a max-width and center it to prevent stretching
          isWeb && { maxWidth: 960, width: '100%', alignSelf: 'center', backgroundColor: '#eef1f8' }
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

