import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

export default function WalletConnectScreen() {
  const { signIn, loading } = useAuth();
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      await signIn();
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        error instanceof Error ? error.message : 'Could not connect wallet',
      );
    } finally {
      setConnecting(false);
    }
  }

  const isLoading = loading || connecting;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>PSM</Text>
        <Text style={styles.title}>Purple Squirrel Media</Text>
        <Text style={styles.subtitle}>
          Upload and share videos with the Solana community
        </Text>

        <TouchableOpacity
          onPress={handleConnect}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, '#6B2FD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Connect Wallet</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Requires a Solana wallet app (Phantom, Solflare, etc.)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 22,
  },
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl * 2,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    minWidth: 220,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
