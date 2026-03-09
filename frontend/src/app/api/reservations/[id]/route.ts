import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const res_ = await prisma.reservation.findUnique({ where: { id }, include: { restaurant: { select: { name: true, phone: true, address: true } } } });
        if (!res_) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json(res_);
    } catch (err: any) {
        return serverError(err);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        await prisma.reservation.delete({ where: { id, restaurantId: payload.restaurantId } });
        return Response.json({ success: true });
    } catch (err: any) {
        return serverError(err);
    }
}
