import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/members (List alumni with filters)
router.get('/', async (req: Request, res: Response) => {
  const { polda, satker, search, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  try {
    let sql = `
      SELECT p.id, p.user_id, p.nama_lengkap, p.pangkat, p.nrp, p.jabatan,
             p.satker, p.polda, p.polda_id, p.angkatan, p.batalyon, p.sub_batalyon,
             p.no_hp, p.alamat, p.foto_url, p.bio, p.status_iuran_2026, p.total_rekan_leting,
             u.role, u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (polda && polda !== 'SEMUA') {
      params.push(`%${polda}%`);
      sql += ` AND (p.polda ILIKE $${params.length} OR p.polda_id ILIKE $${params.length})`;
    }

    if (satker && satker !== 'SEMUA') {
      params.push(`%${satker}%`);
      sql += ` AND p.satker ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.nama_lengkap ILIKE $${params.length} OR p.jabatan ILIKE $${params.length} OR p.nrp ILIKE $${params.length})`;
    }

    sql += ` ORDER BY p.pangkat DESC, p.nama_lengkap ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string, 10), offset);

    const result = await query(sql, params);
    return res.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('[MEMBERS-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data direktori perwira' });
  }
});

// GET /api/members/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(
      `SELECT p.*, u.email, u.role
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 OR p.user_id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data perwira tidak ditemukan' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memuat profil perwira' });
  }
});

export default router;
