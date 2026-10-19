import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  try {
    const status = await serverStore.checkCloudStatus();
    if (status.tableReady && status.rowCount === 0) {
      await serverStore.ensureSynced(true);
    } else if (status.tableReady) {
      await serverStore.ensureSynced(false);
    }
    const afterStatus = await serverStore.checkCloudStatus();
    return NextResponse.json({
      success: true,
      supabase: afterStatus,
      localCounts: {
        members: serverStore.getMembers().length,
        users: serverStore.getUsers().length,
        posts: serverStore.getPosts().length,
        transactions: serverStore.getFinance().transactions.length,
        iuran: serverStore.getFinance().iuranList.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await serverStore.ensureSynced(true);
    await serverStore.flushCloud();
    const status = await serverStore.checkCloudStatus();
    return NextResponse.json({
      success: true,
      message: 'Sinkronisasi ke Supabase Cloud PostgreSQL selesai.',
      supabase: status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
