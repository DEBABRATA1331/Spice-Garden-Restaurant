import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
    const { restaurantId } = await params;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const available = searchParams.get('available');
    const where: any = { restaurantId };
    if (categoryId) where.categoryId = categoryId;
    if (available === 'true') where.isAvailable = true;
    const items = await prisma.menuItem.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }]
    });
    return Response.json(items);
}
