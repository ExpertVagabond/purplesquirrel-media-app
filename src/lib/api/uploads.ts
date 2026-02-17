import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from './client';
import type { Upload, UploadStatus, CompleteUploadParams } from './types';

export async function createUpload(filename: string, contentType: string) {
  return apiClient.post<Upload>('/uploads', { filename, contentType });
}

export async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<boolean> {
  try {
    const uploadResult = await FileSystem.uploadAsync(presignedUrl, fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': contentType,
      },
    });

    // FileSystem.uploadAsync doesn't support progress natively,
    // so we signal completion
    onProgress?.(100);

    return uploadResult.status >= 200 && uploadResult.status < 300;
  } catch (err) {
    console.error('S3 upload failed:', err);
    return false;
  }
}

export async function completeUpload(params: CompleteUploadParams) {
  return apiClient.post<{ videoId: string; status: string }>(
    '/uploads/complete',
    params,
  );
}

export async function getUploadStatus(videoId: string) {
  return apiClient.get<UploadStatus>(`/uploads/${videoId}/status`);
}

export async function cancelUpload(videoId: string) {
  return apiClient.delete<{ success: boolean }>(`/uploads/${videoId}`);
}
