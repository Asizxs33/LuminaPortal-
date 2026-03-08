import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { Platform, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
      <AuthProvider>
        {/* On Web, we wrap the whole app in a flex-row View to put Sidebar next to Stack */}
        <View 
          className={isWeb ? "flex-1 min-h-screen w-full bg-[#eef1f8] flex-col md:flex-row items-center md:items-stretch" : "flex-1 bg-white flex-col items-stretch"}
        >
        
        {/* Sidebar conditionally renders visually on web desktop */}
        {isWeb ? (
          <View className="hidden md:flex">
            <WebSidebar />
          </View>
        ) : (
          <WebSidebar />
        )}
        
        {/* Main Content Area Wrapper */}
        <View className={isWeb ? "flex-[1] flex-col items-center bg-[#eef1f8] w-full" : "flex-[1] items-center bg-white w-full"}>
          
          <View 
            className={isWeb ? "flex-[1] w-full overflow-hidden bg-white md:bg-transparent max-w-[500px] md:max-w-none shadow-[0_0_40px_rgba(0,0,0,0.08)] md:shadow-none" : "flex-[1] w-full overflow-hidden bg-white"}
          >
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent', flex: 1 } }}>
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
    </SafeAreaProvider>
  );
}

