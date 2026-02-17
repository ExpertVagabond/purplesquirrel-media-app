import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { sendTip } from '../lib/solana';
import * as paymentsApi from '../lib/api/payments';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  creatorId: string;
  creatorWallet: string;
  creatorName: string;
  videoId?: string;
}

const TIP_AMOUNTS = [
  { label: '0.01 SOL', lamports: 0.01 * LAMPORTS_PER_SOL },
  { label: '0.05 SOL', lamports: 0.05 * LAMPORTS_PER_SOL },
  { label: '0.1 SOL', lamports: 0.1 * LAMPORTS_PER_SOL },
  { label: '0.5 SOL', lamports: 0.5 * LAMPORTS_PER_SOL },
];

export default function TipCreatorButton({
  creatorId,
  creatorWallet,
  creatorName,
  videoId,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const tipMutation = useMutation({
    mutationFn: async (lamports: number) => {
      // 1. Send SOL on-chain via MWA
      const signature = await sendTip(creatorWallet, lamports);

      // 2. Record the tip in the backend
      await paymentsApi.recordTip({
        toUserId: creatorId,
        videoId,
        amount: lamports,
        signature,
      });

      return signature;
    },
    onSuccess: (signature) => {
      setShowModal(false);
      setSelectedAmount(null);
      Alert.alert(
        'Tip Sent!',
        `Your tip to ${creatorName} was confirmed.\n\nTx: ${signature.slice(0, 16)}...`,
      );
    },
    onError: (error: Error) => {
      Alert.alert('Tip Failed', error.message);
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.tipButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.tipIcon}>{'\u26A1'}</Text>
        <Text style={styles.tipText}>Tip</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              Tip {creatorName}
            </Text>
            <Text style={styles.sheetSubtitle}>
              Send SOL directly to the creator's wallet
            </Text>

            <View style={styles.amounts}>
              {TIP_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt.lamports}
                  style={[
                    styles.amountChip,
                    selectedAmount === amt.lamports && styles.amountChipActive,
                  ]}
                  onPress={() => setSelectedAmount(amt.lamports)}
                >
                  <Text
                    style={[
                      styles.amountText,
                      selectedAmount === amt.lamports &&
                        styles.amountTextActive,
                    ]}
                  >
                    {amt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedAmount || tipMutation.isPending) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={() =>
                selectedAmount && tipMutation.mutate(selectedAmount)
              }
              disabled={!selectedAmount || tipMutation.isPending}
            >
              {tipMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.confirmText}>
                  {selectedAmount
                    ? `Send ${(selectedAmount / LAMPORTS_PER_SOL).toFixed(2)} SOL`
                    : 'Select amount'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowModal(false);
                setSelectedAmount(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tipIcon: {
    fontSize: fontSize.md,
  },
  tipText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl + 16,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  amounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  amountChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  amountChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
  },
  amountText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  amountTextActive: {
    color: colors.accent,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
