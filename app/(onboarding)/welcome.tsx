import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const logo = require('../../assets/logo.png');

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.center}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.brand, { color: '#0B1F3B' }]}>UGig</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Campus gigs, done by students.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/(onboarding)/carousel')}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: '#19A7A8', opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.ctaText, { color: '#fff' }]}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 48,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
