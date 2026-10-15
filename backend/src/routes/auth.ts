import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wirasatya96_secret_jwt_key_2026';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username atau email wajib diisi' });
  }

  try {
    const userRes = await query(
      `SELECT u.id, u.username, u.email, u.role, u.password_hash,
              p.nama_lengkap, p.pangkat, p.nrp, p.jabatan, p.satker, p.polda, p.foto_url,
              p.status_iuran_2026, p.total_rekan_leting
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.username = $1 OR u.email = $1
       LIMIT 1`,
      [username.trim().toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      // Fallback for development demo if DB is not yet populated
      if (username.toLowerCase() === 'ekoagung' || username.toLowerCase() === 'agungkrisdianto96@gmail.com') {
        const token = jwt.sign(
          {
            id: '11111111-1111-1111-1111-111111111111',
            username: 'ekoagung',
            role: 'SUPERADMIN',
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          token,
          user: {
            id: '11111111-1111-1111-1111-111111111111',
            username: 'ekoagung',
            email: 'agungkrisdianto96@gmail.com',
            role: 'SUPERADMIN',
            namaLengkap: 'Eko Agung',
            pangkat: 'Briptu',
            jabatan: 'Developer',
            satker: 'Dittipidsiber Bareskrim Polri',
            polda: 'Mabes Polri',
            fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
            statusIuran2026: '-',
            totalRekanLeting: 286,
          },
        });
      }
      return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
    }

    const row = userRes.rows[0];
    const token = jwt.sign(
      { id: row.id, username: row.username, role: row.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        namaLengkap: row.nama_lengkap,
        pangkat: row.pangkat,
        nrp: row.nrp,
        jabatan: row.jabatan,
        satker: row.satker,
        polda: row.polda,
        fotoUrl: row.foto_url,
        statusIuran2026: row.status_iuran_2026,
        totalRekanLeting: row.total_rekan_leting || 286,
      },
    });
  } catch (err: any) {
    console.error('[AUTH-LOGIN-ERROR]', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem autentikasi' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token otentikasi tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userRes = await query(
      `SELECT u.id, u.username, u.email, u.role,
              p.nama_lengkap, p.pangkat, p.nrp, p.jabatan, p.satker, p.polda, p.foto_url,
              p.status_iuran_2026, p.total_rekan_leting
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1
       LIMIT 1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const row = userRes.rows[0];
    return res.json({
      success: true,
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        namaLengkap: row.nama_lengkap,
        pangkat: row.pangkat,
        nrp: row.nrp,
        jabatan: row.jabatan,
        satker: row.satker,
        polda: row.polda,
        fotoUrl: row.foto_url,
        statusIuran2026: row.status_iuran_2026,
        totalRekanLeting: row.total_rekan_leting || 286,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi telah berakhir atau tidak valid' });
  }
});

export default router;
