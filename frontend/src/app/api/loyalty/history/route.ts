import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCustomerToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyCustomerToken(req);
        if (!payload) return unauthorized();
        const orders = await prisma.order.findMany({
            where: { customerId: payload.customerId, loyaltyPointsEarned: { gt: 0 } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, loyaltyPointsEarned: true, loyaltyPointsUsed: true, createdAt: true }
        });
        return Response.json(orders);
    } catch (err: any) { return serverError(err); }
}
