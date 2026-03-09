import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const { isApproved } = await req.json();
        const review = await prisma.review.update({ where: { id, restaurantId: payload.restaurantId }, data: { isApproved } });
        return Response.json(review);
    } catch (err: any) { return serverError(err); }
}
