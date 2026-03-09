import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = { restaurantId: payload.restaurantId };
        if (status) where.status = status;
        if (date) {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);
            where.createdAt = { gte: start, lte: end };
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({ where, include: { orderItems: true, invoice: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            prisma.order.count({ where })
        ]);
        return Response.json({ orders, total, page, limit });
    } catch (err: any) {
        return serverError(err);
    }
}
