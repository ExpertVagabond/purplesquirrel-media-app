import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoUpload } from '../hooks/useVideoUpload';
import UploadProgress from '../components/UploadProgress';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { UPLOAD_MAX_SIZE_MB } from '../constants/config';
import type { Visibility } from '../lib/api/types';

export default function UploadScreen() {
  const navigation = useNavigation();
  const { stage, progress, upload, reset } = useVideoUpload();

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
        Alert.alert('File too large', `Maximum size is ${UPLOAD_MAX_SIZE_MB}MB`);
        return;
      }
      setFileUri(asset.uri);
      setFileName(asset.fileName ?? 'video.mp4');
      if (!title) setTitle(asset.fileName?.replace(/\.[^.]+$/, '') ?? '');
    }
  }

  async function recordVideo() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to record videos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 600,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileName(asset.fileName ?? 'recording.mp4');
    }
  }

  async function handleUpload() {
    if (!fileUri) return;
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your video');
      return;
    }

    const contentType = fileName.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
    const visibility: Visibility = isPublic ? 'public' : 'private';

    await upload(fileUri, contentType, {
      title: title.trim(),
      description: description.trim() || undefined,
      visibility,
    });
  }

  function handleReset() {
    reset();
    setFileUri(null);
    setFileName('');
    setTitle('');
    setDescription('');
    setIsPublic(true);
  }

  // Upload in progress or complete
  if (stage !== 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>
            {stage === 'ready' ? 'Upload Complete!' : stage === 'failed' ? 'Upload Failed' : 'Uploading...'}
          </Text>
          <UploadProgress
            stage={stage as 'uploading' | 'processing' | 'ready' | 'failed'}
            progress={progress}
          />
          {(stage === 'ready' || stage === 'failed') && (
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>
                {stage === 'ready' ? 'Upload Another' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // File not selected yet
  if (!fileUri) {
    return (
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>Upload a Video</Text>
          <Text style={styles.pickerSubtitle}>
            Record a new video or choose from your gallery
          </Text>

          <TouchableOpacity onPress={recordVideo} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.primary, '#6B2FD9']}
              style={styles.pickerButton}
            >
              <Text style={styles.pickerButtonText}>Record Video</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButtonOutline}
            onPress={pickVideo}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerButtonOutlineText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Metadata form
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.formContainer}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileLabel}>Selected:</Text>
        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
        <TouchableOpacity onPress={() => { setFileUri(null); setFileName(''); }}>
          <Text style={styles.changeFile}>Change</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter video title"
        placeholderTextColor={colors.textMuted}
        maxLength={100}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your video..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={4}
        maxLength={2000}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>

      <TouchableOpacity onPress={handleUpload} activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.primary, '#6B2FD9']}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadButtonText}>Upload Video</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  progressTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  pickerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pickerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  pickerButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl * 2,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minWidth: 220,
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  pickerButtonOutline: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl * 2,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    minWidth: 220,
  },
  pickerButtonOutlineText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  formContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  fileLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  fileName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  changeFile: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  uploadButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
