import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [inventoryItems, customers, vendors, orders, purchases] = await Promise.all([
      prisma.inventoryItem.findMany(),
      prisma.customer.findMany({
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.vendor.findMany({
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.order.findMany(),
      prisma.purchase.findMany(),
    ]);

    const totalStockValue = 0;

    const totalOutstandingCredits = customers.reduce((sum, customer) => {
      const balance = customer.transactions[0]?.balance || 0;
      return sum + Math.max(0, balance);
    }, 0);

    const totalVendorDues = vendors.reduce((sum, vendor) => {
      const balance = vendor.transactions[0]?.balance || 0;
      return sum + Math.max(0, balance);
    }, 0);

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.lowStockThreshold);

    return NextResponse.json({
      totalStockValue,
      totalOutstandingCredits,
      totalVendorDues,
      totalSales,
      totalPurchases,
      totalInventoryItems: inventoryItems.length,
      totalCustomers: customers.length,
      totalVendors: vendors.length,
      totalOrders: orders.length,
      lowStockItems,
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
