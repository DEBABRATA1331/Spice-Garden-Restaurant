import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug, isActive: true },
            include: { settings: { select: { loyaltyEnabled: true, taxPercent: true, pointsPerRupee: true } } }
        });
        if (!restaurant) return Response.json({ error: 'Restaurant not found' }, { status: 404 });
        return Response.json(restaurant);
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
