import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

        const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
        if (existing) return Response.json(existing);

        const count = await prisma.invoice.count({ where: { restaurantId: payload.restaurantId } });
        const invoice = await prisma.invoice.create({
            data: { restaurantId: payload.restaurantId, orderId: order.id, invoiceNo: `INV-${Date.now()}-${count + 1}`, subtotal: order.subtotal, taxAmount: order.taxAmount, discountAmount: order.discountAmount, totalAmount: order.totalAmount, isPaid: order.paymentStatus === 'paid', paidAt: order.paymentStatus === 'paid' ? new Date() : null },
            include: { order: { include: { orderItems: true } } }
        });
        return Response.json(invoice);
    } catch (err: any) {
        return serverError(err);
    }
}
