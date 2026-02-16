import { apiClient } from './client';
import type {
  Video,
  ListVideosParams,
  UpdateVideoParams,
  PaginatedResponse,
} from './types';

export async function listVideos(params: ListVideosParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.visibility) searchParams.set('visibility', params.visibility);
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const path = `/videos${query ? `?${query}` : ''}`;
  return apiClient.get<PaginatedResponse<Video>>(path);
}

export async function getVideo(id: string) {
  return apiClient.get<Video>(`/videos/${id}`);
}

export async function updateVideo(id: string, data: UpdateVideoParams) {
  return apiClient.patch<Video>(`/videos/${id}`, data);
}

export async function deleteVideo(id: string) {
  return apiClient.delete<{ success: boolean }>(`/videos/${id}`);
}

export async function likeVideo(id: string) {
  return apiClient.post<{ liked: boolean }>(`/videos/${id}/like`);
}
