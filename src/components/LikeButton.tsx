import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as videosApi from '../lib/api/videos';
import { colors, spacing, fontSize } from '../constants/theme';

interface Props {
  videoId: string;
  initialLikes: number;
  initialLiked?: boolean;
}

export default function LikeButton({
  videoId,
  initialLikes,
  initialLiked = false,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => videosApi.likeVideo(videoId),
    onMutate: () => {
      // Optimistic update
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev - 1 : prev + 1));
    },
    onError: () => {
      // Rollback
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, liked && styles.buttonActive]}
      onPress={() => mutation.mutate()}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, liked && styles.iconActive]}>
        {liked ? '\u2764' : '\u2661'}
      </Text>
      <Text style={[styles.count, liked && styles.countActive]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonActive: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  icon: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.error,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  countActive: {
    color: colors.error,
  },
});
