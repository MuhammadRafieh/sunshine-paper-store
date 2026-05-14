export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        vendor: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, items, totalAmount, paidAmount } = body;

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          vendorId,
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(paidAmount) || 0,
          status: 'completed',
        },
      });

      for (const item of items) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            name: item.name,
            category: item.category,
            length: parseFloat(item.length),
            width: parseFloat(item.width),
            gsm: parseInt(item.gsm),
            quantity: parseInt(item.quantity),
            unit: item.unit,
            rate: parseFloat(item.rate),
            total: parseFloat(item.total),
          },
        });

        const existingItem = await tx.inventoryItem.findFirst({
          where: {
            name: item.name,
            category: item.category,
            length: parseFloat(item.length),
            width: parseFloat(item.width),
            gsm: parseInt(item.gsm),
            unit: item.unit,
          },
        });

        if (existingItem) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: {
                increment: parseInt(item.quantity),
              },
            },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              name: item.name,
              category: item.category,
              length: parseFloat(item.length),
              width: parseFloat(item.width),
              gsm: parseInt(item.gsm),
              quantity: parseInt(item.quantity),
              unit: item.unit,
            },
          });
        }
      }

      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastBalance = vendor?.transactions[0]?.balance || 0;
      const balanceAfterPurchase = lastBalance + parseFloat(totalAmount);

      await tx.vendorTransaction.create({
        data: {
          vendorId,
          type: 'credit',
          amount: parseFloat(totalAmount),
          description: `Purchase #${newPurchase.id.slice(-6)}`,
          balance: balanceAfterPurchase,
        },
      });

      if (parseFloat(paidAmount) > 0) {
        const finalBalance = balanceAfterPurchase - parseFloat(paidAmount);
        await tx.vendorTransaction.create({
          data: {
            vendorId,
            type: 'debit',
            amount: parseFloat(paidAmount),
            description: `Payment for Purchase #${newPurchase.id.slice(-6)}`,
            balance: finalBalance,
          },
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Purchase creation error:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { 
        vendor: true,
        items: true,
      },
    });
    
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({
        where: { id: purchase.vendorId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastBalance = vendor?.transactions[0]?.balance || 0;

      await tx.vendorTransaction.create({
        data: {
          vendorId: purchase.vendorId,
          type: 'debit',
          amount: purchase.totalAmount,
          description: `Purchase #${id.slice(-6)} Cancelled`,
          balance: lastBalance + purchase.totalAmount,
        },
      });

      if (purchase.paidAmount > 0) {
        await tx.vendorTransaction.create({
          data: {
            vendorId: purchase.vendorId,
            type: 'credit',
            amount: purchase.paidAmount,
            description: `Payment Refund for Cancelled Purchase #${id.slice(-6)}`,
            balance: lastBalance,
          },
        });
      }

      for (const item of purchase.items) {
        const existingItem = await tx.inventoryItem.findFirst({
          where: {
            name: item.name,
            category: item.category,
            length: item.length,
            width: item.width,
            gsm: item.gsm,
            unit: item.unit,
          },
        });

        if (existingItem) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });
      
      await tx.purchase.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}

