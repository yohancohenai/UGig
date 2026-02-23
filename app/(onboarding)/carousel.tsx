import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Step {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: 'megaphone-outline',
    title: 'Post Gigs',
    description: 'Need help on campus? Post a gig in seconds and set your budget.',
  },
  {
    icon: 'people-outline',
    title: 'Students Accept',
    description: 'Verified students at your college can browse and accept gigs.',
  },
  {
    icon: 'flash-outline',
    title: 'Get It Done Fast',
    description: 'Payments are held in escrow. Quick, safe, and on-campus.',
  },
];

export default function CarouselScreen() {
  const { colors, isDark } = useTheme();
  const { completeOnboarding } = useAuth();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/(onboarding)/college-select');
  };

  const handleNext = () => {
    if (activeIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderStep = ({ item }: { item: Step }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={item.icon} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  const isLast = activeIndex === STEPS.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleFinish}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.list}
      />

      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.borderLight,
                width: i === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.nextBtnText, { color: isDark ? '#0f1117' : '#fff' }]}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          {!isLast && (
            <Ionicons name="arrow-forward" size={18} color={isDark ? '#0f1117' : '#fff'} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  list: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 48,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
