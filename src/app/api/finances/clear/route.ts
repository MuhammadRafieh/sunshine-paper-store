import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'customers') {
      await prisma.customerTransaction.deleteMany({});
    } else if (type === 'vendors') {
      await prisma.vendorTransaction.deleteMany({});
    } else {
      await prisma.customerTransaction.deleteMany({});
      await prisma.vendorTransaction.deleteMany({});
    }

    return NextResponse.json({ success: true, message: 'Ledger cleared successfully' });
  } catch (error) {
    console.error('Clear ledger error:', error);
    return NextResponse.json({ error: 'Failed to clear ledger' }, { status: 500 });
  }
}
