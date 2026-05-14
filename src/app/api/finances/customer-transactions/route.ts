import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customerTransactions = await prisma.customerTransaction.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(customerTransactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, type, amount, description, paymentMode, reference } = body;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const lastBalance = customer?.transactions[0]?.balance || 0;
    let newBalance: number;

    if (type === 'credit') {
      newBalance = lastBalance - parseFloat(amount);
    } else {
      newBalance = lastBalance + parseFloat(amount);
    }

    const transaction = await prisma.customerTransaction.create({
      data: {
        customerId,
        type,
        amount: parseFloat(amount),
        description,
        paymentMode: paymentMode || null,
        reference: reference || null,
        balance: newBalance,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
