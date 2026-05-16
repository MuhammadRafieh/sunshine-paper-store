import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const currentOrder = await prisma.order.findUnique({ 
      where: { id },
      include: { items: true }
    });
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (body.cancelOrder === true) {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const customer = await tx.customer.findUnique({
          where: { id: currentOrder.customerId },
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        const lastBalance = customer?.transactions[0]?.balance || 0;

        await tx.customerTransaction.create({
          data: {
            customerId: currentOrder.customerId,
            type: 'credit',
            amount: currentOrder.totalAmount,
            description: `Order #${id.slice(-6)} Cancelled`,
            balance: lastBalance - currentOrder.totalAmount,
          },
        });

        if (currentOrder.paidAmount > 0) {
          await tx.customerTransaction.create({
            data: {
              customerId: currentOrder.customerId,
              type: 'debit',
              amount: currentOrder.paidAmount,
              description: `Payment Refund for Cancelled Order #${id.slice(-6)}`,
              balance: lastBalance,
            },
          });
        }

        for (const item of currentOrder.items) {
          if (item.inventoryItemId) {
            await tx.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return await tx.order.update({
          where: { id },
          data: {
            isCancelled: true,
            status: 'cancelled',
            paymentStatus: 'refunded',
          },
        });
      });
      return NextResponse.json(result);
    }

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paidAmount !== undefined) {
      updateData.paidAmount = parseFloat(body.paidAmount);
      updateData.paymentStatus = parseFloat(body.paidAmount) >= currentOrder.totalAmount ? 'paid' : 'unpaid';
    }
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    if (body.addPayment === true && parseFloat(body.paymentAmount) > 0) {
      const customer = await prisma.customer.findUnique({
        where: { id: currentOrder.customerId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastBalance = customer?.transactions[0]?.balance || 0;
      const newPaidAmount = currentOrder.paidAmount + parseFloat(body.paymentAmount);
      const newBalance = lastBalance - parseFloat(body.paymentAmount);
      const newPaymentStatus = newPaidAmount >= currentOrder.totalAmount ? 'paid' : 'unpaid';

      await prisma.customerTransaction.create({
        data: {
          customerId: currentOrder.customerId,
          type: 'credit',
          amount: parseFloat(body.paymentAmount),
          description: `Payment for Order #${id.slice(-6)}`,
          paymentMode: body.paymentMode || null,
          reference: body.reference || null,
          balance: newBalance,
        },
      });

      await prisma.order.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        },
      });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        customer: true,
        items: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.findUnique({
        where: { id: order.customerId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastBalance = customer?.transactions[0]?.balance || 0;

      if (order.paidAmount > 0) {
        const newBalanceAfterDebit = lastBalance - order.totalAmount;
        await tx.customerTransaction.create({
          data: {
            customerId: order.customerId,
            type: 'credit',
            amount: order.totalAmount,
            description: `Order #${id.slice(-6)} Cancelled`,
            balance: newBalanceAfterDebit,
          },
        });

        if (order.paidAmount > 0) {
          await tx.customerTransaction.create({
            data: {
              customerId: order.customerId,
              type: 'debit',
              amount: order.paidAmount,
              description: `Payment Refund for Cancelled Order #${id.slice(-6)}`,
              balance: lastBalance,
            },
          });
        }
      } else {
        await tx.customerTransaction.create({
          data: {
            customerId: order.customerId,
            type: 'credit',
            amount: order.totalAmount,
            description: `Order #${id.slice(-6)} Cancelled`,
            balance: lastBalance - order.totalAmount,
          },
        });
      }

      for (const item of order.items) {
        if (item.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              quantity: {
                increment: parseInt(String(item.quantity)),
              },
            },
          });
        }
      }

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });
      
      await tx.order.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
