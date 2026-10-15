import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/kesehatan (Daftar atensi rekan / keluarga yang dirawat)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT k.*, p.nama_lengkap as pelapor_nama, p.pangkat as pelapor_pangkat, p.no_hp as pelapor_hp
      FROM atensi_kesehatan k
      LEFT JOIN profiles p ON k.user_id = p.user_id
      ORDER BY 
        CASE 
          WHEN k.kondisi = 'KRITIS' THEN 1
          WHEN k.kondisi = 'DIRAWAT' THEN 2
          WHEN k.kondisi = 'PEMULIHAN' THEN 3
          ELSE 4
        END,
        k.created_at DESC
    `);

    return res.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('[KESEHATAN-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat atensi kesehatan' });
  }
});

// POST /api/kesehatan (Buat laporan rekan / keluarga sakit)
router.post('/', async (req: Request, res: Response) => {
  const {
    userId,
    namaPasien,
    hubungan,
    diagnosa,
    rumahSakit,
    kota,
    kondisi,
    kontakPendamping,
    kebutuhanKhusus,
    keterangan,
  } = req.body;

  if (!namaPasien || !rumahSakit || !diagnosa) {
    return res.status(400).json({ success: false, message: 'Nama pasien, diagnosa, dan RS wajib diisi' });
  }

  try {
    const result = await query(
      `INSERT INTO atensi_kesehatan (
        user_id, nama_pasien, hubungan, diagnosa, rumah_sakit, kota,
        kondisi, kontak_pendamping, kebutuhan_khusus, keterangan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId || '11111111-1111-1111-1111-111111111111',
        namaPasien,
        hubungan || 'PERWIRA',
        diagnosa,
        rumahSakit,
        kota || 'Jakarta',
        kondisi || 'DIRAWAT',
        kontakPendamping || '',
        kebutuhanKhusus || '',
        keterangan || '',
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[KESEHATAN-POST-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data atensi kesehatan' });
  }
});

export default router;
