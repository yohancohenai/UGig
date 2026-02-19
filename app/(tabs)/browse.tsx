import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useGigFlow } from '../../context/GigFlowContext';
import { useVerification } from '../../context/VerificationContext';
import type { Gig } from '../../constants/MockData';
import GigCard from '../../components/GigCard';
import GigDetailModal from '../../components/GigDetailModal';
import EmptyState from '../../components/EmptyState';
import VerificationBanner from '../../components/VerificationBanner';

export default function BrowseScreen() {
  const { colors } = useTheme();
  const { college, openCampusGigs } = useUser();
  const { acceptGig } = useGigFlow();
  const { canPerformActions } = useVerification();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);

  const filteredGigs = useMemo(() => {
    if (!search.trim()) return openCampusGigs;
    const q = search.toLowerCase();
    return openCampusGigs.filter(
      g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
    );
  }, [search, openCampusGigs]);

  const showVerificationAlert = () => {
    Alert.alert(
      'Verification Required',
      'Please verify your .edu email in Settings before accepting gigs.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Settings', onPress: () => router.push('/(tabs)/settings') },
      ]
    );
  };

  const handleAccept = () => {
    if (!selectedGig) return;
    if (!canPerformActions) { showVerificationAlert(); return; }
    acceptGig(selectedGig.id);
    setSelectedGig(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Campus indicator */}
      {college && (
        <View style={[styles.campusBar, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="school" size={14} color={colors.primary} />
          <Text style={[styles.campusBarText, { color: colors.primary }]}>
            {college.name}
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <VerificationBanner onVerify={() => router.push('/(tabs)/settings')} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search gigs..."
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

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} available
      </Text>

      <FlatList
        style={{ flex: 1 }}
        data={filteredGigs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GigCard
            gig={item}
            onPress={() => setSelectedGig(item)}
            actionLabel="Accept Job"
            onAction={() => {
              if (!canPerformActions) { showVerificationAlert(); return; }
              acceptGig(item.id);
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No gigs found"
            message={search ? 'Try a different search term.' : 'No open gigs on your campus right now.'}
          />
        }
      />

      <GigDetailModal
        gig={selectedGig}
        visible={!!selectedGig}
        onClose={() => setSelectedGig(null)}
        onAccept={handleAccept}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  campusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  campusBarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
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
    height: '100%',
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
