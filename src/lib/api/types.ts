export type VideoStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed';

export type Visibility = 'public' | 'unlisted' | 'private';

export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  status: VideoStatus;
  visibility: Visibility;
  sourceUrl: string | null;
  hlsUrl: string | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  duration: number | null;
  resolution: string | null;
  fileSize: number | null;
  tags: string[];
  category: string | null;
  likes: number;
  views: number;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  uploadUrl: string;
  videoId: string;
  expiresIn: number;
}

export interface UploadStatus {
  videoId: string;
  status: VideoStatus;
  hlsUrl: string | null;
  thumbnailUrl: string | null;
  progress: number | null;
}

export interface AuthNonceResponse {
  nonce: string;
  message: string;
}

export interface AuthVerifyResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}

export type APIResponse<T> =
  | { data: T; error: null }
  | { data: null; error: APIError };

export interface ListVideosParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VideoStatus;
  visibility?: Visibility;
  userId?: string;
  sort?: 'latest' | 'popular' | 'oldest';
}

export interface UpdateVideoParams {
  title?: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
  category?: string;
}

export interface CompleteUploadParams {
  videoId: string;
  title: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
  category?: string;
  autoTranscribe?: boolean;
}
