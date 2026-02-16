import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VideoCard from '../components/VideoCard';
import * as videosApi from '../lib/api/videos';
import type { Video } from '../lib/api/types';
import type { RootStackParamList } from '../types/navigation';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

type Route = RouteProp<RootStackParamList, 'CreatorProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CreatorProfileScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { userId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['videos', 'creator', userId],
    queryFn: async () => {
      const res = await videosApi.listVideos({
        userId,
        visibility: 'public',
        status: 'ready',
        sort: 'latest',
        limit: 50,
      });
      return res.data;
    },
  });

  const videos = data?.data ?? [];
  const creator = videos[0]?.creator;

  function renderItem({ item }: { item: Video }) {
    return (
      <VideoCard
        video={item}
        onPress={() => navigation.navigate('VideoPlayer', { videoId: item.id })}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          creator ? (
            <View style={styles.header}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {(creator.username ?? creator.walletAddress)[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.name}>
                {creator.username ?? creator.walletAddress.slice(0, 12)}
              </Text>
              {creator.bio && (
                <Text style={styles.bio}>{creator.bio}</Text>
              )}
              <Text style={styles.videoCount}>{videos.length} videos</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No public videos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bio: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  videoCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
