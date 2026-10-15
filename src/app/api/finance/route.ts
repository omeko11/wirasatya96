import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const financeData = serverStore.getFinance();
  return NextResponse.json({ success: true, data: financeData });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = serverStore.getSession();
    const effectiveRole = body.actorRole || session?.role;

    // Penginputan data Kas, Iuran, & Aset murni hanya boleh dilakukan oleh BENDAHARA
    if (effectiveRole !== 'BENDAHARA') {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses Ditolak: Penginputan data Kas, Iuran, & Aset hanya dapat dilakukan oleh Bendahara.',
        },
        { status: 403 }
      );
    }

    const { action } = body;

    if (action === 'PAY_IURAN') {
      const { nrp, nominal, dicatatOleh } = body;
      const updated = serverStore.recordIuranPayment(nrp, Number(nominal), dicatatOleh);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Data iuran perwira tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Pembayaran iuran berhasil dicatat oleh Bendahara', data: updated });
    }

    if (action === 'ADD_ASSET') {
      const {
        kodeAset,
        namaAset,
        kategori,
        satuan,
        jumlahUnit,
        nilaiPerolehanIdr,
        estimasiNilaiIdr,
        kustodianLokasi,
        nomorSeriAtauWallet,
        tanggalPerolehan,
        keterangan,
        dicatatOleh,
      } = body;

      if (!namaAset || !kategori || !estimasiNilaiIdr) {
        return NextResponse.json(
          { success: false, message: 'Nama aset, kategori, dan estimasi nilai IDR wajib diisi.' },
          { status: 400 }
        );
      }

      const newAsset = serverStore.addAsset({
        kodeAset: kodeAset || 'WS96-AST-' + Date.now().toString().slice(-4),
        namaAset,
        kategori,
        satuan: satuan || 'Unit',
        jumlahUnit: Number(jumlahUnit) || 1,
        nilaiPerolehanIdr: Number(nilaiPerolehanIdr) || Number(estimasiNilaiIdr),
        estimasiNilaiIdr: Number(estimasiNilaiIdr),
        kustodianLokasi: kustodianLokasi || 'Bendahara Paguyuban',
        nomorSeriAtauWallet: nomorSeriAtauWallet || '-',
        tanggalPerolehan: tanggalPerolehan || new Date().toISOString().split('T')[0],
        keterangan: keterangan || '',
        dicatatOleh: dicatatOleh || session?.nama || 'Bendahara',
      });

      return NextResponse.json({
        success: true,
        message: 'Aset portofolio berhasil dicatat oleh Bendahara',
        data: newAsset,
      });
    }

    if (action === 'DELETE_ASSET') {
      const { id } = body;
      const deleted = serverStore.deleteAsset(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Data aset tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Data aset berhasil dihapus' });
    }

    // Default: Add cash transaction
    const { jenis, kategori, nominal, keterangan, pihakTerkait, nrpTerkait, nomorReferensi, dicatatOleh } = body;
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
      dicatatOleh: dicatatOleh || session?.nama || 'Bendahara',
    });

    return NextResponse.json({ success: true, message: 'Transaksi kas berhasil dicatat oleh Bendahara', data: newTrx });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memproses data kebendaharaan', error }, { status: 500 });
  }
}
