import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/messages?user1=...&user2=... or ?userNrp=...
router.get('/', async (req: Request, res: Response) => {
  const { user1, user2, userNrp } = req.query;
  const targetUser = (user1 || userNrp) as string;

  try {
    let sql = `
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.attachment_url, m.is_read, m.created_at,
             sp.nama_lengkap as sender_name, sp.pangkat as sender_pangkat, sp.nrp as sender_nrp, sp.foto_url as sender_avatar,
             rp.nama_lengkap as receiver_name, rp.pangkat as receiver_pangkat, rp.nrp as receiver_nrp, rp.foto_url as receiver_avatar
      FROM messages m
      LEFT JOIN profiles sp ON m.sender_id = sp.user_id
      LEFT JOIN profiles rp ON m.receiver_id = rp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (targetUser && user2) {
      params.push(targetUser, user2 as string);
      sql += ` AND ((sp.nrp = $1 AND rp.nrp = $2) OR (sp.nrp = $2 AND rp.nrp = $1))`;
    } else if (targetUser) {
      params.push(targetUser);
      sql += ` AND (sp.nrp = $1 OR rp.nrp = $1)`;
    }

    sql += ` ORDER BY m.created_at ASC`;

    const result = await query(sql, params);
    return res.json({
      success: true,
      count: result.rowCount,
      messages: result.rows.map((row: any) => ({
        id: row.id,
        senderNrp: row.sender_nrp,
        senderName: row.sender_name,
        senderPangkat: row.sender_pangkat,
        senderAvatar: row.sender_avatar,
        receiverNrp: row.receiver_nrp,
        receiverName: row.receiver_name,
        text: row.content,
        attachmentUrl: row.attachment_url,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: row.created_at,
        isRead: row.is_read,
      })),
    });
  } catch (error) {
    console.error('[MESSAGES-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pesan' });
  }
});

// POST /api/messages (Send new message)
router.post('/', async (req: Request, res: Response) => {
  const { senderNrp, receiverNrp, text, attachmentUrl } = req.body;

  if (!senderNrp || !receiverNrp || !text?.trim()) {
    return res.status(400).json({ success: false, message: 'Data pengirim, penerima, dan pesan wajib diisi' });
  }

  try {
    // Resolve user IDs from NRPs
    const senderRes = await query('SELECT user_id FROM profiles WHERE nrp = $1 LIMIT 1', [senderNrp]);
    const receiverRes = await query('SELECT user_id FROM profiles WHERE nrp = $1 LIMIT 1', [receiverNrp]);

    const senderId = senderRes.rows[0]?.user_id;
    const receiverId = receiverRes.rows[0]?.user_id;

    if (!senderId || !receiverId) {
      return res.status(404).json({ success: false, message: 'Profil pengirim atau penerima tidak ditemukan di database' });
    }

    const insertRes = await query(
      `INSERT INTO messages (sender_id, receiver_id, content, attachment_url, is_read)
       VALUES ($1, $2, $3, $4, FALSE)
       RETURNING *`,
      [senderId, receiverId, text.trim(), attachmentUrl || null]
    );

    const row = insertRes.rows[0];
    return res.status(201).json({
      success: true,
      message: {
        id: row.id,
        senderNrp,
        receiverNrp,
        text: row.content,
        attachmentUrl: row.attachment_url,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: row.created_at,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('[MESSAGES-POST-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim pesan ke database' });
  }
});

export default router;
