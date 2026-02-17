import { apiClient } from './client';
import type { Tip, CreateTipParams, TipSummary } from './types';

export async function recordTip(params: CreateTipParams) {
  return apiClient.post<Tip>('/tips', params);
}

export async function getTipSummary(userId: string) {
  return apiClient.get<TipSummary>(`/users/${userId}/tips`);
}

export async function getVideoTips(videoId: string) {
  return apiClient.get<{ tips: Tip[]; total: number }>(
    `/videos/${videoId}/tips`,
  );
}
