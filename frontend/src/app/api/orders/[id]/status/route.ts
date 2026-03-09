import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const { status } = await req.json();
        const order = await prisma.order.update({ where: { id, restaurantId: payload.restaurantId }, data: { status } });

        if (status === 'delivered' && order.customerId && order.loyaltyPointsEarned > 0) {
            await prisma.customer.update({ where: { id: order.customerId }, data: { loyaltyPoints: { increment: order.loyaltyPointsEarned } } });
        }

        if (status === 'delivered') {
            const count = await prisma.invoice.count({ where: { restaurantId: payload.restaurantId } });
            const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
            if (!existing) {
                await prisma.invoice.create({
                    data: { restaurantId: payload.restaurantId, orderId: order.id, invoiceNo: `INV-${Date.now()}-${count + 1}`, subtotal: order.subtotal, taxAmount: order.taxAmount, discountAmount: order.discountAmount, totalAmount: order.totalAmount, isPaid: order.paymentStatus === 'paid', paidAt: order.paymentStatus === 'paid' ? new Date() : null }
                });
            }
        }
        return Response.json(order);
    } catch (err: any) {
        return serverError(err);
    }
}
