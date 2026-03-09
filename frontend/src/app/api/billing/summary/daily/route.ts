import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');
        const d = dateStr ? new Date(dateStr) : new Date();
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setHours(23, 59, 59, 999);
        const [orders, revenue, paidRevenue] = await Promise.all([
            prisma.order.count({ where: { restaurantId: payload.restaurantId, createdAt: { gte: start, lte: end } } }),
            prisma.order.aggregate({ where: { restaurantId: payload.restaurantId, createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true } }),
            prisma.order.aggregate({ where: { restaurantId: payload.restaurantId, createdAt: { gte: start, lte: end }, paymentStatus: 'paid' }, _sum: { totalAmount: true } })
        ]);
        return Response.json({ date: d.toISOString().split('T')[0], totalOrders: orders, totalRevenue: revenue._sum.totalAmount || 0, paidRevenue: paidRevenue._sum.totalAmount || 0 });
    } catch (err: any) { return serverError(err); }
}
