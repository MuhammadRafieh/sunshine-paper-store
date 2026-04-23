import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, paymentMode, reference, description } = body;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const lastBalance = vendor.transactions[0]?.balance || 0;
    const newBalance = lastBalance - parseFloat(amount);

    const transaction = await prisma.vendorTransaction.create({
      data: {
        vendorId: id,
        type: 'credit',
        amount: parseFloat(amount),
        description: description || `Payment made`,
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
