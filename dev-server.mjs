#!/usr/bin/env node
/**
 * Lightweight mock API server for PurpleSquirrel Media App development.
 * Implements the endpoints the mobile app expects.
 * Run: node dev-server.mjs
 */
import { createServer } from 'http';
import { randomUUID, randomBytes } from 'crypto';

const PORT = 3000;
const JWT_SECRET = 'dev-mock-secret';

// In-memory stores
const nonces = new Map();
const users = new Map();
const videos = new Map();
const tokens = new Map(); // token -> userId

function generateToken() {
  return randomBytes(32).toString('hex');
}

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const userId = tokens.get(token);
  return userId ? users.get(userId) : null;
}

// Seed some demo videos
function seedData() {
  const demoUser = {
    id: 'demo_user_1',
    walletAddress: 'DemoWa11etAddress111111111111111111111111111',
    username: 'purple_squirrel',
    avatar: null,
    bio: 'Demo creator account',
    role: 'creator',
    createdAt: new Date().toISOString(),
  };
  users.set(demoUser.id, demoUser);

  const sampleVideos = [
    { title: 'Welcome to Purple Squirrel Media', description: 'Introduction to our decentralized video platform' },
    { title: 'Solana Mobile Stack Overview', description: 'Building dApps for Solana Mobile' },
    { title: 'Web3 Video Monetization', description: 'How creators earn on PSM' },
  ];

  for (const v of sampleVideos) {
    const id = randomUUID();
    videos.set(id, {
      id,
      title: v.title,
      description: v.description,
      status: 'ready',
      visibility: 'public',
      duration: Math.floor(Math.random() * 600) + 30,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      thumbnailUrl: `https://picsum.photos/seed/${id}/640/360`,
      hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      creatorId: demoUser.id,
      creator: { id: demoUser.id, username: demoUser.username, avatar: demoUser.avatar },
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

seedData();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Health check
  if (path === '/health' && method === 'GET') {
    return jsonResponse(res, { status: 'healthy' });
  }

  // AUTH: POST /v1/auth/nonce
  if (path === '/v1/auth/nonce' && method === 'POST') {
    const body = await parseBody(req);
    const nonce = randomBytes(16).toString('hex');
    const message = `Sign this message to authenticate with Purple Squirrel Media.\n\nNonce: ${nonce}`;
    nonces.set(nonce, { publicKey: body.publicKey, expiresAt: Date.now() + 300000 });
    return jsonResponse(res, { nonce, message });
  }

  // AUTH: POST /v1/auth/verify
  if (path === '/v1/auth/verify' && method === 'POST') {
    const body = await parseBody(req);
    const { publicKey, signature, nonce } = body;

    // In dev mode, accept any signature
    const storedNonce = nonces.get(nonce);
    if (!storedNonce || storedNonce.publicKey !== publicKey) {
      return jsonResponse(res, { error: 'Invalid or expired nonce' }, 401);
    }
    nonces.delete(nonce);

    // Find or create user
    let user = [...users.values()].find((u) => u.walletAddress === publicKey);
    if (!user) {
      user = {
        id: `user_${randomBytes(6).toString('hex')}`,
        walletAddress: publicKey,
        username: `user_${publicKey.slice(0, 8)}`,
        avatar: null,
        bio: null,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      users.set(user.id, user);
    }

    const token = generateToken();
    tokens.set(token, user.id);

    return jsonResponse(res, { token, user });
  }

  // AUTH: GET /v1/auth/me
  if (path === '/v1/auth/me' && method === 'GET') {
    const user = getUserFromToken(req);
    if (!user) return jsonResponse(res, { error: 'Unauthorized' }, 401);
    return jsonResponse(res, user);
  }

  // VIDEOS: GET /v1/videos
  if (path === '/v1/videos' && method === 'GET') {
    const allVideos = [...videos.values()]
      .filter((v) => v.visibility === 'public' && v.status === 'ready')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const start = (page - 1) * limit;
    const items = allVideos.slice(start, start + limit);

    return jsonResponse(res, {
      data: items,
      pagination: { page, limit, total: allVideos.length, totalPages: Math.ceil(allVideos.length / limit) },
    });
  }

  // VIDEOS: GET /v1/videos/:id
  const videoMatch = path.match(/^\/v1\/videos\/([^/]+)$/);
  if (videoMatch && method === 'GET') {
    const video = videos.get(videoMatch[1]);
    if (!video) return jsonResponse(res, { error: 'Video not found' }, 404);
    return jsonResponse(res, video);
  }

  // UPLOADS: POST /v1/uploads
  if (path === '/v1/uploads' && method === 'POST') {
    const user = getUserFromToken(req);
    if (!user) return jsonResponse(res, { error: 'Unauthorized' }, 401);

    const body = await parseBody(req);
    const videoId = randomUUID();

    // Return a mock presigned URL (in real backend this would be S3)
    return jsonResponse(res, {
      uploadUrl: `http://localhost:${PORT}/mock-s3/${videoId}`,
      videoId,
      expiresIn: 3600,
    });
  }

  // UPLOADS: PUT /mock-s3/:id (fake S3 presigned URL target)
  const s3Match = path.match(/^\/mock-s3\/([^/]+)$/);
  if (s3Match && method === 'PUT') {
    // Consume the upload data
    await new Promise((resolve) => {
      req.on('data', () => {});
      req.on('end', resolve);
    });
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }

  // UPLOADS: POST /v1/uploads/complete
  if (path === '/v1/uploads/complete' && method === 'POST') {
    const user = getUserFromToken(req);
    if (!user) return jsonResponse(res, { error: 'Unauthorized' }, 401);

    const body = await parseBody(req);
    const { videoId, title, description, visibility } = body;

    // Create the video entry
    const video = {
      id: videoId,
      title: title || 'Untitled Video',
      description: description || '',
      status: 'ready', // Skip processing in dev
      visibility: visibility || 'public',
      duration: 60,
      views: 0,
      likes: 0,
      thumbnailUrl: `https://picsum.photos/seed/${videoId}/640/360`,
      hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      creatorId: user.id,
      creator: { id: user.id, username: user.username, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    videos.set(videoId, video);

    return jsonResponse(res, { videoId, status: 'ready' });
  }

  // UPLOADS: GET /v1/uploads/:id/status
  const statusMatch = path.match(/^\/v1\/uploads\/([^/]+)\/status$/);
  if (statusMatch && method === 'GET') {
    const video = videos.get(statusMatch[1]);
    return jsonResponse(res, {
      videoId: statusMatch[1],
      status: video ? 'ready' : 'processing',
      progress: video ? 100 : 50,
    });
  }

  // USERS: GET /v1/users/:id
  const userMatch = path.match(/^\/v1\/users\/([^/]+)$/);
  if (userMatch && method === 'GET') {
    const user = users.get(userMatch[1]);
    if (!user) return jsonResponse(res, { error: 'User not found' }, 404);
    const userVideos = [...videos.values()].filter((v) => v.creatorId === user.id);
    return jsonResponse(res, { ...user, videoCount: userVideos.length });
  }

  // 404
  jsonResponse(res, { error: 'Not found', path }, 404);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  PSM Dev Server running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Videos: http://localhost:${PORT}/v1/videos`);
  console.log(`  Docs: Mock API — accepts any wallet signature in dev mode\n`);
});
