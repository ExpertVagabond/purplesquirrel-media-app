import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import * as videosApi from '../lib/api/videos';
import type { Video } from '../lib/api/types';
import type { RootStackParamList } from '../types/navigation';
import { colors, spacing, fontSize } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChannelScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['videos', 'mine', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await videosApi.listVideos({ userId: user.id, limit: 50 });
      return res.data;
    },
    enabled: !!user,
  });

  const videos = data?.data ?? [];

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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.header}>My Videos ({videos.length})</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptyText}>
              Upload your first video from the Upload tab
            </Text>
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
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
