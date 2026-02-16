import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

type Stage = 'uploading' | 'processing' | 'ready' | 'failed';

interface UploadProgressProps {
  stage: Stage;
  progress: number; // 0-100
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready' },
];

export default function UploadProgress({ stage, progress }: UploadProgressProps) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${stage === 'ready' ? 100 : stage === 'failed' ? progress : progress}%`,
              backgroundColor: stage === 'failed' ? colors.error : colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.stages}>
        {STAGES.map((s, i) => (
          <View key={s.key} style={styles.stageItem}>
            <View
              style={[
                styles.dot,
                i <= currentIdx && stage !== 'failed' && styles.dotActive,
                stage === 'failed' && styles.dotFailed,
              ]}
            />
            <Text
              style={[
                styles.stageLabel,
                i <= currentIdx && stage !== 'failed' && styles.stageLabelActive,
              ]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {stage === 'failed' && (
        <Text style={styles.errorText}>Upload failed. Please try again.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  barBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  stages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stageItem: {
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotFailed: {
    backgroundColor: colors.error,
  },
  stageLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  stageLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
