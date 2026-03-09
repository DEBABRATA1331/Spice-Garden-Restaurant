import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const reviews = await prisma.review.findMany({ where: { restaurantId: payload.restaurantId }, orderBy: { createdAt: 'desc' } });
        return Response.json(reviews);
    } catch (err: any) { return serverError(err); }
}
