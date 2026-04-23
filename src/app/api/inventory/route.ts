import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        category: body.category,
        length: parseFloat(body.length),
        width: parseFloat(body.width),
        gsm: parseInt(body.gsm),
        quantity: parseInt(body.quantity),
        unit: body.unit,
        lowStockThreshold: parseInt(body.lowStockThreshold) || 10,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
