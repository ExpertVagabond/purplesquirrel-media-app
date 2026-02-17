import { apiClient } from './client';
import type {
  Comment,
  CreateCommentParams,
  LikeStatus,
  PaginatedResponse,
} from './types';

export async function listComments(
  videoId: string,
  page = 1,
  limit = 20,
) {
  return apiClient.get<PaginatedResponse<Comment>>(
    `/videos/${videoId}/comments?page=${page}&limit=${limit}`,
  );
}

export async function createComment(
  videoId: string,
  params: CreateCommentParams,
) {
  return apiClient.post<Comment>(`/videos/${videoId}/comments`, params);
}

export async function deleteComment(videoId: string, commentId: string) {
  return apiClient.delete<{ success: boolean }>(
    `/videos/${videoId}/comments/${commentId}`,
  );
}

export async function likeComment(videoId: string, commentId: string) {
  return apiClient.post<LikeStatus>(
    `/videos/${videoId}/comments/${commentId}/like`,
  );
}
