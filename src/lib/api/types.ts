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

// Comments
export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  user: Pick<User, 'id' | 'walletAddress' | 'username' | 'avatar'>;
  text: string;
  likes: number;
  liked: boolean;
  parentId: string | null;
  replyCount: number;
  createdAt: string;
}

export interface CreateCommentParams {
  text: string;
  parentId?: string;
}

// Likes (video-level already in videos.ts, this is for comment likes)
export interface LikeStatus {
  liked: boolean;
  totalLikes: number;
}

// Tips / Payments
export type TipStatus = 'pending' | 'confirmed' | 'failed';

export interface Tip {
  id: string;
  fromUserId: string;
  toUserId: string;
  videoId: string | null;
  amount: number; // lamports
  signature: string; // Solana tx signature
  status: TipStatus;
  message: string | null;
  createdAt: string;
}

export interface CreateTipParams {
  toUserId: string;
  videoId?: string;
  amount: number; // lamports
  signature: string;
  message?: string;
}

export interface TipSummary {
  totalReceived: number; // lamports
  totalSent: number; // lamports
  tipCount: number;
}

// Live Streams (placeholder for future)
export type LiveStreamStatus = 'idle' | 'live' | 'ended';

export interface LiveStream {
  id: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'walletAddress' | 'username' | 'avatar'>;
  title: string;
  status: LiveStreamStatus;
  viewerCount: number;
  streamUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
}
