import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useVerification } from '../context/VerificationContext';

interface IdVerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function IdVerificationModal({ visible, onClose }: IdVerificationModalProps) {
  const { colors, isDark } = useTheme();
  const { submitIdVerification } = useVerification();
  const [selectedImage, setSelectedImage] = useState(false);

  const handlePickImage = () => {
    // Mock image selection — in production, use expo-image-picker:
    // const result = await ImagePicker.launchImageLibraryAsync({ ... });
    // if (!result.canceled) setSelectedImage(true);
    setSelectedImage(true);
  };

  const handleSubmit = () => {
    if (!selectedImage) return;
    submitIdVerification();
    setSelectedImage(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedImage(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Student ID</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Upload a photo of your student ID for additional verification. This earns you the "ID Verified" badge.
          </Text>

          <Pressable
            onPress={handlePickImage}
            style={[
              styles.uploadArea,
              {
                backgroundColor: colors.surface,
                borderColor: selectedImage ? colors.success : colors.border,
              },
            ]}
          >
            {selectedImage ? (
              <View style={styles.uploadContent}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={[styles.uploadTitle, { color: colors.success }]}>Photo Selected</Text>
                <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
                  student_id.jpg
                </Text>
              </View>
            ) : (
              <View style={styles.uploadContent}>
                <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.uploadTitle, { color: colors.text }]}>
                  Tap to Select Photo
                </Text>
                <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
                  Take a photo or select from gallery
                </Text>
              </View>
            )}
          </Pressable>

          <View style={[styles.infoBox, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Your ID will be reviewed by our team within 24 hours. In this demo, it will be auto-approved in ~5 seconds.
            </Text>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedImage}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: selectedImage ? colors.primary : colors.borderLight,
                opacity: pressed && selectedImage ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name="cloud-upload"
              size={18}
              color={selectedImage ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
            />
            <Text
              style={[
                styles.submitBtnText,
                { color: selectedImage ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
              ]}
            >
              Submit for Review
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { flex: 1, padding: 20 },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  uploadHint: {
    fontSize: 13,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: { padding: 20, paddingBottom: 36, borderTopWidth: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
});
