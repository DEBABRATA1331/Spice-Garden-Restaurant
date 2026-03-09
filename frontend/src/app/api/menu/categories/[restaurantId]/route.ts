import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
    const { restaurantId } = await params;
    const categories = await prisma.category.findMany({
        where: { restaurantId, isActive: true },
        orderBy: { sortOrder: 'asc' }
    });
    return Response.json(categories);
}
