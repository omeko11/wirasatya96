import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/posts (Get feeds with reactions & comments)
router.get('/', async (req: Request, res: Response) => {
  try {
    const postsRes = await query(`
      SELECT p.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'parentId', c.parent_id,
                   'authorId', c.author_id,
                   'authorName', c.author_name,
                   'authorPangkat', c.author_pangkat,
                   'authorAvatar', c.author_avatar,
                   'content', c.content,
                   'likesCount', c.likes_count,
                   'createdAt', c.created_at
                 ) ORDER BY c.created_at ASC
               ) FILTER (WHERE c.id IS NOT NULL),
               '[]'
             ) as comments
      FROM posts p
      LEFT JOIN post_comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    return res.json({
      success: true,
      data: postsRes.rows,
    });
  } catch (error) {
    console.error('[POSTS-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat feed linimasa alumni' });
  }
});

// POST /api/posts (Create a new post)
router.post('/', async (req: Request, res: Response) => {
  const { authorId, authorName, authorPangkat, authorJabatan, authorAvatar, content, mediaUrls } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Caption postingan tidak boleh kosong' });
  }

  try {
    const insertRes = await query(
      `INSERT INTO posts (
        author_id, author_name, author_pangkat, author_jabatan, author_avatar,
        content, media_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        authorId || '11111111-1111-1111-1111-111111111111',
        authorName || 'Eko Agung',
        authorPangkat || 'Briptu',
        authorJabatan || 'Developer Dittipidsiber Bareskrim',
        authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        content,
        JSON.stringify(mediaUrls || []),
      ]
    );

    return res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (error) {
    console.error('[POSTS-CREATE-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mempublikasikan postingan' });
  }
});

// POST /api/posts/:id/react (React with one of 6 emojis)
router.post('/:id/react', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, reaction = 'like' } = req.body;

  try {
    // Check if user already reacted
    const existing = await query(
      `SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
      [id, userId || '11111111-1111-1111-1111-111111111111']
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].reaction === reaction) {
        // Toggle off
        await query(`DELETE FROM post_reactions WHERE id = $1`, [existing.rows[0].id]);
        await query(`UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1`, [id]);
        return res.json({ success: true, action: 'removed', reaction: null });
      } else {
        // Update reaction type
        await query(`UPDATE post_reactions SET reaction = $1 WHERE id = $2`, [reaction, existing.rows[0].id]);
        return res.json({ success: true, action: 'updated', reaction });
      }
    } else {
      // New reaction
      await query(
        `INSERT INTO post_reactions (post_id, user_id, reaction) VALUES ($1, $2, $3)`,
        [id, userId || '11111111-1111-1111-1111-111111111111', reaction]
      );
      await query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [id]);
      return res.json({ success: true, action: 'added', reaction });
    }
  } catch (error) {
    console.error('[POST-REACT-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui respon reaksi' });
  }
});

// POST /api/posts/:id/comments (Add nested comment)
router.post('/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { parentId, authorId, authorName, authorPangkat, authorAvatar, content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Komentar tidak boleh kosong' });
  }

  try {
    const commentRes = await query(
      `INSERT INTO post_comments (
        post_id, parent_id, author_id, author_name, author_pangkat, author_avatar, content
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        parentId || null,
        authorId || '11111111-1111-1111-1111-111111111111',
        authorName || 'Eko Agung',
        authorPangkat || 'Briptu',
        authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        content,
      ]
    );

    await query(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`, [id]);

    return res.status(201).json({ success: true, data: commentRes.rows[0] });
  } catch (error) {
    console.error('[POST-COMMENT-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan komentar' });
  }
});

export default router;
