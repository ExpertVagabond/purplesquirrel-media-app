import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '../lib/api/comments';
import type { Comment } from '../lib/api/types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  videoId: string;
}

function CommentItem({ comment, videoId }: { comment: Comment; videoId: string }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => commentsApi.likeComment(videoId, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {(comment.user.username ?? comment.user.walletAddress)[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <Text style={styles.commentAuthor}>
          {comment.user.username ?? comment.user.walletAddress.slice(0, 8)}
          <Text style={styles.commentTime}>  {timeAgo}</Text>
        </Text>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => likeMutation.mutate()}
          >
            <Text style={[styles.commentActionText, comment.liked && styles.liked]}>
              {comment.liked ? '\u2764' : '\u2661'} {comment.likes}
            </Text>
          </TouchableOpacity>
          {comment.replyCount > 0 && (
            <Text style={styles.commentActionText}>
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CommentsSection({ videoId }: Props) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const res = await commentsApi.listComments(videoId);
      return res.data;
    },
    enabled: expanded,
  });

  const postMutation = useMutation({
    mutationFn: (commentText: string) =>
      commentsApi.createComment(videoId, { text: commentText }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  const comments = data?.data ?? [];
  const total = data?.total ?? 0;

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedBar}
        onPress={() => setExpanded(true)}
      >
        <Text style={styles.collapsedText}>Comments</Text>
        <Text style={styles.collapsedCount}>Tap to view</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Comments ({total})</Text>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={() => text.trim() && postMutation.mutate(text.trim())}
          disabled={!text.trim() || postMutation.isPending}
        >
          {postMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.sendText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem comment={item} videoId={videoId} />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
          }
        />
      )}
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
  },
  collapsedBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  collapsedText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  collapsedCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  closeText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  commentAvatarText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentTime: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  commentAction: {
    paddingVertical: 2,
  },
  commentActionText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  liked: {
    color: colors.error,
  },
});
