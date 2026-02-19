import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { COLLEGES, College } from '../constants/Colleges';

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const { selectCollege } = useUser();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    selectCollege(selected);
    router.replace('/(tabs)');
  };

  const renderCollege = ({ item }: { item: College }) => {
    const isSelected = selected === item.id;
    return (
      <Pressable
        onPress={() => setSelected(item.id)}
        style={[
          styles.collegeCard,
          {
            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.collegeInfo}>
          <Text style={[styles.collegeName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.collegeLocation, { color: colors.textSecondary }]}>{item.location}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="school" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Select Your Campus</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          You'll only see gigs posted at your college. You can change this later in Settings.
        </Text>
      </View>

      <FlatList
        data={COLLEGES}
        keyExtractor={item => item.id}
        renderItem={renderCollege}
        contentContainerStyle={styles.list}
        style={styles.listContainer}
      />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: selected ? colors.primary : colors.borderLight,
              opacity: pressed && selected ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.continueBtnText,
              { color: selected ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
            ]}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={selected ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 24,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  collegeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
  },
  collegeInfo: {
    flex: 1,
    marginRight: 12,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  collegeLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
