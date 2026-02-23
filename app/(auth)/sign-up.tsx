import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen() {
  const { colors, isDark } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="person-add-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Join your campus community on UGig
        </Text>

        <View
          style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        >
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Full Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View
          style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        >
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View
          style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          onPress={handleSignUp}
          disabled={!canSubmit || loading}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.borderLight,
              opacity: pressed && canSubmit ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.submitBtnText,
              { color: canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
            ]}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.switchLink, { color: colors.primary }]}> Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
