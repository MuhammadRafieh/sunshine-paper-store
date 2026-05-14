import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customerTransaction.deleteMany({
      where: { customerId: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear customer ledger error:', error);
    return NextResponse.json({ error: 'Failed to clear ledger' }, { status: 500 });
  }
}
