import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VideoPlayer from '../components/VideoPlayer';
import * as videosApi from '../lib/api/videos';
import type { RootStackParamList } from '../types/navigation';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

type Route = RouteProp<RootStackParamList, 'VideoPlayer'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function VideoPlayerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { videoId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const res = await videosApi.getVideo(videoId);
      return res.data;
    },
  });

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const video = data;

  return (
    <ScrollView style={styles.container}>
      {video.hlsUrl ? (
        <VideoPlayer uri={video.hlsUrl} />
      ) : (
        <View style={styles.noVideo}>
          <Text style={styles.noVideoText}>Video not available</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{video.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {video.views} views
          </Text>
          <Text style={styles.meta}>{video.likes} likes</Text>
        </View>

        <TouchableOpacity
          style={styles.creatorRow}
          onPress={() =>
            navigation.navigate('CreatorProfile', {
              userId: video.creator.id,
            })
          }
        >
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {(video.creator.username ?? video.creator.walletAddress)[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.creatorName}>
            {video.creator.username ?? video.creator.walletAddress.slice(0, 12)}
          </Text>
        </TouchableOpacity>

        {video.description && (
          <Text style={styles.description}>{video.description}</Text>
        )}

        {video.tags.length > 0 && (
          <View style={styles.tags}>
            {video.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  noVideo: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  creatorAvatarText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  creatorName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
});
