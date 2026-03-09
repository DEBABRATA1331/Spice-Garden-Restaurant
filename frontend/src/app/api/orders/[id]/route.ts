import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: { orderItems: { include: { menuItem: { select: { name: true, image: true } } } }, restaurant: { select: { name: true, phone: true } } }
        });
        if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
        return Response.json(order);
    } catch (err: any) {
        return serverError(err);
    }
}
