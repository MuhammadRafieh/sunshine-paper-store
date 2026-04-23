import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vendorTransaction.deleteMany({
      where: { vendorId: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear vendor ledger error:', error);
    return NextResponse.json({ error: 'Failed to clear ledger' }, { status: 500 });
  }
}
