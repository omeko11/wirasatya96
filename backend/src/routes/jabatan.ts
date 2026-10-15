import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/jabatan (Riwayat Jabatan & Penugasan Alumni Wira Satya 96)
router.get('/', async (req: Request, res: Response) => {
  const { fungsi, polda, search } = req.query;

  try {
    let sql = `
      SELECT r.id, r.user_id, r.nama_perwira, r.pangkat, r.jabatan, r.satker,
             r.polda, r.polda_id, r.fungsi, r.periode, r.dasar_tr, r.deskripsi,
             r.pencapaian, r.is_current, r.created_at,
             p.foto_url
      FROM riwayat_jabatan r
      LEFT JOIN profiles p ON r.user_id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (fungsi && fungsi !== 'SEMUA') {
      params.push(fungsi);
      sql += ` AND r.fungsi = $${params.length}`;
    }

    if (polda && polda !== 'SEMUA') {
      params.push(`%${polda}%`);
      sql += ` AND (r.polda ILIKE $${params.length} OR r.polda_id ILIKE $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (r.nama_perwira ILIKE $${params.length} OR r.jabatan ILIKE $${params.length} OR r.dasar_tr ILIKE $${params.length} OR r.satker ILIKE $${params.length})`;
    }

    sql += ` ORDER BY r.is_current DESC, r.created_at DESC`;

    const result = await query(sql, params);
    return res.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('[JABATAN-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat jabatan leting' });
  }
});

// POST /api/jabatan (Tambah Mutasi / Promosi Baru TR Kapolri)
router.post('/', async (req: Request, res: Response) => {
  const {
    userId,
    namaPerwira,
    pangkat,
    jabatan,
    satker,
    polda,
    poldaId,
    fungsi,
    periode,
    dasarTr,
    deskripsi,
    pencapaian,
    isCurrent,
  } = req.body;

  if (!namaPerwira || !jabatan || !dasarTr) {
    return res.status(400).json({
      success: false,
      message: 'Nama perwira, jabatan, dan nomor dasar TR Kapolri wajib diisi',
    });
  }

  try {
    const result = await query(
      `INSERT INTO riwayat_jabatan (
        user_id, nama_perwira, pangkat, jabatan, satker, polda, polda_id,
        fungsi, periode, dasar_tr, deskripsi, pencapaian, is_current
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        userId || null,
        namaPerwira,
        pangkat || 'Kombes Pol',
        jabatan,
        satker,
        polda,
        poldaId || 'bareskrim-mabes',
        fungsi || 'RESERSE',
        periode || '2026 - Sekarang',
        dasarTr,
        deskripsi || '',
        pencapaian || '',
        isCurrent ?? true,
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[JABATAN-POST-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan riwayat jabatan' });
  }
});

export default router;
