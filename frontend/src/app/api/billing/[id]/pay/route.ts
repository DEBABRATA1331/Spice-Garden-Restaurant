import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const invoice = await prisma.invoice.update({ where: { id, restaurantId: payload.restaurantId }, data: { isPaid: true, paidAt: new Date() } });
        await prisma.order.update({ where: { id: invoice.orderId }, data: { paymentStatus: 'paid' } });
        return Response.json(invoice);
    } catch (err: any) { return serverError(err); }
}
