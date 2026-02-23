import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { PaymentProvider } from '../context/PaymentContext';
import { NotificationProvider } from '../context/NotificationContext';
import { WalletProvider } from '../context/WalletContext';
import { VerificationProvider } from '../context/VerificationContext';
import { GigFlowProvider } from '../context/GigFlowContext';
import { ReviewProvider } from '../context/ReviewContext';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

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
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}
