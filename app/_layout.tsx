import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { PaymentProvider } from '../context/PaymentContext';
import { NotificationProvider } from '../context/NotificationContext';
import { WalletProvider } from '../context/WalletContext';
import { VerificationProvider } from '../context/VerificationContext';
import { GigFlowProvider } from '../context/GigFlowContext';
import { ReviewProvider } from '../context/ReviewContext';

function RootLayoutInner() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PaymentProvider>
          <NotificationProvider>
            <VerificationProvider>
              <WalletProvider>
                <GigFlowProvider>
                  <ReviewProvider>
                    <RootLayoutInner />
                  </ReviewProvider>
                </GigFlowProvider>
              </WalletProvider>
            </VerificationProvider>
          </NotificationProvider>
        </PaymentProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
