import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const { status, tableNumber } = await req.json();
        const rsv = await prisma.reservation.update({ where: { id, restaurantId: payload.restaurantId }, data: { status, tableNumber } });
        return Response.json(rsv);
    } catch (err: any) {
        return serverError(err);
    }
}
