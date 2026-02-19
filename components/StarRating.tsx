import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive = false, onRate }: StarRatingProps) {
  const { colors } = useTheme();

  const stars = Array.from({ length: 5 }, (_, i) => {
    const starNum = i + 1;
    const filled = starNum <= Math.round(rating);
    const iconName = filled ? 'star' : 'star-outline';
    const color = filled ? '#f5a623' : colors.textSecondary;

    if (interactive && onRate) {
      return (
        <Pressable key={i} onPress={() => onRate(starNum)} hitSlop={4}>
          <Ionicons name={iconName} size={size} color={color} />
        </Pressable>
      );
    }

    return <Ionicons key={i} name={iconName} size={size} color={color} />;
  });

  return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
