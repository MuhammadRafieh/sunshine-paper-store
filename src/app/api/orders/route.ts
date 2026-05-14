import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, items, totalAmount, paidAmount, status, paymentMode, reference } = body;

    const order = await prisma.$transaction(async (tx) => {
      const paymentStatus = parseFloat(paidAmount) >= parseFloat(totalAmount) ? 'paid' : 'unpaid';
      
      const newOrder = await tx.order.create({
        data: {
          customerId,
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(paidAmount) || 0,
          status: status || 'pending',
          paymentStatus,
        },
      });

      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            inventoryItemId: item.inventoryItemId || null,
            name: item.name || '',
            category: item.category || '',
            length: parseFloat(item.length) || 0,
            width: parseFloat(item.width) || 0,
            gsm: parseInt(item.gsm) || 0,
            unit: item.unit || '',
            quantity: parseInt(item.quantity),
            rate: parseFloat(item.rate),
            total: parseFloat(item.total),
          },
        });

        if (item.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              quantity: {
                decrement: parseInt(item.quantity),
              },
            },
          });
        }
      }

      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastBalance = customer?.transactions[0]?.balance || 0;
      const balanceAfterOrder = lastBalance + parseFloat(totalAmount);

      await tx.customerTransaction.create({
        data: {
          customerId,
          type: 'debit',
          amount: parseFloat(totalAmount),
          description: `Order #${newOrder.id.slice(-6)}`,
          balance: balanceAfterOrder,
        },
      });

      if (parseFloat(paidAmount) > 0) {
        const finalBalance = balanceAfterOrder - parseFloat(paidAmount);
        await tx.customerTransaction.create({
          data: {
            customerId,
            type: 'credit',
            amount: parseFloat(paidAmount),
            description: `Payment received for Order #${newOrder.id.slice(-6)}`,
            paymentMode: paymentMode || null,
            reference: reference || null,
            balance: finalBalance,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
