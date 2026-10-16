import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { withRedisCache, cacheInvalidatePrefix } from '@/lib/redisCache';

export async function GET() {
  const { data: posts, cacheMeta } = await withRedisCache(
    'ws96:posts:all',
    45,
    () => serverStore.getPosts()
  );

  return NextResponse.json(
    {
      success: true,
      count: posts.length,
      posts,
      cache: cacheMeta,
    },
    {
      headers: {
        'X-WS96-Cache': cacheMeta.status,
        'X-WS96-Cache-Layer': cacheMeta.layer,
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'LIKE' && body.postId) {
      const updated = serverStore.toggleLikePost(body.postId);
      await cacheInvalidatePrefix('ws96:posts:');
      return NextResponse.json({ success: true, post: updated, posts: serverStore.getPosts() });
    }

    if (action === 'REPOST' && body.postId) {
      const updated = serverStore.toggleRepost(body.postId);
      await cacheInvalidatePrefix('ws96:posts:');
      return NextResponse.json({ success: true, post: updated, posts: serverStore.getPosts() });
    }

    if (action === 'COMMENT' && body.postId && body.comment) {
      const updated = serverStore.addCommentToPost(body.postId, body.comment);
      await cacheInvalidatePrefix('ws96:posts:');
      return NextResponse.json({ success: true, post: updated, posts: serverStore.getPosts() });
    }

    // Default: CREATE post
    if (!body.content?.trim()) {
      return NextResponse.json({ success: false, message: 'Konten postingan wajib diisi' }, { status: 400 });
    }

    const created = serverStore.addPost({
      authorName: body.authorName || 'Perwira Wira Satya 96',
      authorPangkat: body.authorPangkat || 'Kombes Pol',
      authorJabatan: body.authorJabatan || 'Alumni Akpol 1996',
      authorSatker: body.authorSatker || 'Mabes Polri',
      authorPolda: body.authorPolda || 'MABES POLRI',
      authorAvatar: body.authorAvatar || '/default-avatar.png',
      authorNrp: body.authorNrp || '',
      category: body.category || 'MOTIVASI',
      content: body.content.trim(),
      imageUrl: body.imageUrl,
    });

    await cacheInvalidatePrefix('ws96:posts:');
    return NextResponse.json({
      success: true,
      post: created,
      posts: serverStore.getPosts(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses postingan beranda', error: String(error) },
      { status: 500 }
    );
  }
}
