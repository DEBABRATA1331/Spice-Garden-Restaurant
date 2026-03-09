import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const isPaid = searchParams.get('isPaid');
        const where: any = { restaurantId: payload.restaurantId };
        if (isPaid !== null) where.isPaid = isPaid === 'true';
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({ where, include: { order: { include: { orderItems: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            prisma.invoice.count({ where })
        ]);
        return Response.json({ invoices, total });
    } catch (err: any) {
        return serverError(err);
    }
}
