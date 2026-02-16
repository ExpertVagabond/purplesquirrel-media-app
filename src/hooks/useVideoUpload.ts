import { useState, useRef, useCallback } from 'react';
import * as uploads from '../lib/api/uploads';
import type { VideoStatus, CompleteUploadParams } from '../lib/api/types';
import { UPLOAD_POLL_INTERVAL_MS } from '../constants/config';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

interface UploadState {
  stage: UploadStage;
  progress: number;
  videoId: string | null;
  error: string | null;
}

export function useVideoUpload() {
  const [state, setState] = useState<UploadState>({
    stage: 'idle',
    progress: 0,
    videoId: null,
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setState({ stage: 'idle', progress: 0, videoId: null, error: null });
  }, []);

  const upload = useCallback(
    async (
      fileUri: string,
      contentType: string,
      metadata: Omit<CompleteUploadParams, 'videoId'>,
    ) => {
      try {
        // 1. Create upload and get presigned URL
        setState({ stage: 'uploading', progress: 0, videoId: null, error: null });

        const filename = fileUri.split('/').pop() ?? 'video.mp4';
        const createRes = await uploads.createUpload(filename, contentType);
        if (!createRes.data) {
          throw new Error(createRes.error?.message ?? 'Failed to create upload');
        }

        const { uploadUrl, videoId } = createRes.data;
        setState((prev) => ({ ...prev, videoId }));

        // 2. Upload to S3
        const success = await uploads.uploadToS3(
          uploadUrl,
          fileUri,
          contentType,
          (progress) => setState((prev) => ({ ...prev, progress })),
        );

        if (!success) throw new Error('S3 upload failed');

        // 3. Complete upload
        setState((prev) => ({ ...prev, stage: 'processing', progress: 0 }));
        const completeRes = await uploads.completeUpload({
          videoId,
          ...metadata,
        });
        if (!completeRes.data) {
          throw new Error(completeRes.error?.message ?? 'Failed to complete upload');
        }

        // 4. Poll for processing status
        pollRef.current = setInterval(async () => {
          const statusRes = await uploads.getUploadStatus(videoId);
          if (!statusRes.data) return;

          const { status } = statusRes.data;
          if (status === 'ready') {
            if (pollRef.current) clearInterval(pollRef.current);
            setState((prev) => ({ ...prev, stage: 'ready', progress: 100 }));
          } else if (status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setState((prev) => ({
              ...prev,
              stage: 'failed',
              error: 'Video processing failed',
            }));
          }
        }, UPLOAD_POLL_INTERVAL_MS);
      } catch (err) {
        if (pollRef.current) clearInterval(pollRef.current);
        setState((prev) => ({
          ...prev,
          stage: 'failed',
          error: err instanceof Error ? err.message : 'Upload failed',
        }));
      }
    },
    [],
  );

  return { ...state, upload, reset };
}
