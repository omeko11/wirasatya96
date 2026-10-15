import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const financeData = serverStore.getFinance();
  return NextResponse.json({ success: true, data: financeData });
}

export async function POST(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    // Verification: only BENDAHARA, KETUA, and SUPERADMIN can record transactions
    if (session && session.role === 'ANGGOTA') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Bendahara, Ketua, dan Superadmin yang dapat mengelola kas.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'PAY_IURAN') {
      const { nrp, nominal } = body;
      const updated = serverStore.recordIuranPayment(nrp, Number(nominal));
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Data iuran perwira tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Pembayaran iuran berhasil dicatat', data: updated });
    }

    // Default: Add cash transaction
    const { jenis, kategori, nominal, keterangan, pihakTerkait, nrpTerkait, nomorReferensi } = body;
    if (!jenis || !nominal || !keterangan) {
      return NextResponse.json({ success: false, message: 'Jenis, nominal, dan keterangan wajib diisi' }, { status: 400 });
    }

    const newTrx = serverStore.addTransaction({
      nomorReferensi: nomorReferensi || 'WS96-KAS-' + Date.now().toString().slice(-4),
      tanggal: new Date().toISOString().split('T')[0],
      jenis,
      kategori: kategori || 'OPERASIONAL_PAGUYUBAN',
      nominal: Number(nominal),
      keterangan,
      pihakTerkait: pihakTerkait || '-',
      nrpTerkait: nrpTerkait || '',
      dicatatOleh: session?.nama || 'Bendahara Paguyuban',
    });

    return NextResponse.json({ success: true, message: 'Transaksi kas berhasil dicatat', data: newTrx });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mencatat transaksi kas', error }, { status: 500 });
  }
}
