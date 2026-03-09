import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCustomerToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
    try {
        const payload = verifyCustomerToken(req);
        if (!payload) return unauthorized();
        const { customerId } = await params;
        const orders = await prisma.order.findMany({
            where: { customerId, restaurantId: payload.restaurantId },
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' }
        });
        return Response.json(orders);
    } catch (err: any) {
        return serverError(err);
    }
}
