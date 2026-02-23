import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function RootIndex() {
  const { isLoading, onboardingComplete, isAuthenticated } = useAuth();
  const { isOnboarded, collegeLoading } = useUser();
  const { colors } = useTheme();

  if (isLoading || collegeLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/(onboarding)/college-select" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
