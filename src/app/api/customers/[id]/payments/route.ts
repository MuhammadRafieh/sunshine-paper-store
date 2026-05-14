import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, paymentMode, reference, description } = body;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const lastBalance = customer.transactions[0]?.balance || 0;
    const newBalance = lastBalance - parseFloat(amount);

    const transaction = await prisma.customerTransaction.create({
      data: {
        customerId: id,
        type: 'credit',
        amount: parseFloat(amount),
        description: description || `Payment received`,
        paymentMode: paymentMode || null,
        reference: reference || null,
        balance: newBalance,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to add payment' }, { status: 500 });
  }
}
