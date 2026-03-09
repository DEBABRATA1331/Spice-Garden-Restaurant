import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const where: any = { restaurantId: payload.restaurantId, paymentStatus: 'paid' };
        if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
        if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
        const revenue = await prisma.order.aggregate({ where, _sum: { totalAmount: true }, _count: { id: true } });
        return Response.json(revenue);
    } catch (err: any) {
        return serverError(err);
    }
}
