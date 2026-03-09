import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
    try {
        const { restaurantId } = await params;
        const reviews = await prisma.review.findMany({ where: { restaurantId, isApproved: true }, orderBy: { createdAt: 'desc' } });
        return Response.json(reviews);
    } catch (err: any) { return serverError(err); }
}
