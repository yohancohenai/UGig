import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { COLLEGES, College } from '../../constants/Colleges';

export default function CollegeSelectScreen() {
  const { colors, isDark } = useTheme();
  const { selectCollege } = useUser();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredColleges = useMemo(() => {
    if (!search.trim()) return COLLEGES;
    const q = search.toLowerCase();
    return COLLEGES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }, [search]);

  const handleContinue = async () => {
    if (!selected) return;
    await selectCollege(selected);
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/sign-in');
    }
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
          <Text style={[styles.collegeLocation, { color: colors.textSecondary }]}>
            {item.location}
          </Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
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

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search colleges..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredColleges}
        keyExtractor={(item) => item.id}
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
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContainer: { flex: 1 },
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
