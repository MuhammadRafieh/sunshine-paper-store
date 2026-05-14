import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vendorTransactions = await prisma.vendorTransaction.findMany({
      include: { vendor: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(vendorTransactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, type, amount, description } = body;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const lastBalance = vendor?.transactions[0]?.balance || 0;
    let newBalance: number;

    if (type === 'debit') {
      newBalance = lastBalance - parseFloat(amount);
    } else {
      newBalance = lastBalance + parseFloat(amount);
    }

    const transaction = await prisma.vendorTransaction.create({
      data: {
        vendorId,
        type,
        amount: parseFloat(amount),
        description,
        balance: newBalance,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
