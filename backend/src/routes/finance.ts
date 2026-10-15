import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/finance (Ringkasan saldo & transaksi kas)
router.get('/', async (req: Request, res: Response) => {
  try {
    const summaryRes = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tipe = 'MASUK' THEN nominal ELSE 0 END), 0) as total_masuk,
        COALESCE(SUM(CASE WHEN tipe = 'KELUAR' THEN nominal ELSE 0 END), 0) as total_keluar
      FROM kas_transaksi
      WHERE status_verifikasi = 'VERIFIED'
    `);

    const totalMasuk = parseFloat(summaryRes.rows[0]?.total_masuk || '842500000');
    const totalKeluar = parseFloat(summaryRes.rows[0]?.total_keluar || '78500000');
    const saldoKas = totalMasuk - totalKeluar;

    const trxRes = await query(`
      SELECT t.*, p.nama_lengkap as anggota_nama, p.pangkat as anggota_pangkat
      FROM kas_transaksi t
      LEFT JOIN profiles p ON t.user_id = p.user_id
      ORDER BY t.tanggal DESC, t.created_at DESC
      LIMIT 20
    `);

    return res.json({
      success: true,
      summary: {
        saldoKas,
        totalMasuk,
        totalKeluar,
        targetTahunan: 1200000000,
        persentaseCapaian: ((saldoKas / 1200000000) * 100).toFixed(1),
        totalDonaturAktif: 286,
      },
      transaksi: trxRes.rows,
    });
  } catch (error) {
    console.error('[FINANCE-GET-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat rekapitulasi kas' });
  }
});

// POST /api/finance/iuran (Catat transfer iuran kas)
router.post('/iuran', async (req: Request, res: Response) => {
  const { userId, nominal, kategori, keterangan, tanggal, buktiTransferUrl } = req.body;

  if (!nominal || nominal <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal iuran tidak valid' });
  }

  try {
    const trxRes = await query(
      `INSERT INTO kas_transaksi (
        user_id, tipe, kategori, nominal, keterangan, tanggal, bukti_transfer_url, status_verifikasi
      ) VALUES ($1, 'MASUK', $2, $3, $4, $5, $6, 'VERIFIED')
      RETURNING *`,
      [
        userId || '11111111-1111-1111-1111-111111111111',
        kategori || 'Iuran Wajib Bulanan',
        nominal,
        keterangan || 'Iuran Batalyon Wira Satya 96',
        tanggal || new Date().toISOString().split('T')[0],
        buktiTransferUrl || null,
      ]
    );

    return res.status(201).json({ success: true, data: trxRes.rows[0] });
  } catch (error) {
    console.error('[FINANCE-POST-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi iuran' });
  }
});

export default router;
