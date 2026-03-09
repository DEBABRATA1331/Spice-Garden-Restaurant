import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, verifyCustomerToken, serverError } from '@/lib/auth-helpers';

// Create order (public)
export async function POST(req: NextRequest) {
    try {
        const { restaurantId, customerId, customerName, customerPhone, customerEmail, orderType,
            items, couponCode, address, tableNumber, notes, loyaltyPointsUsed, paymentMethod } = await req.json();

        if (!items || !items.length) return Response.json({ error: 'No items in order' }, { status: 400 });

        let subtotal = 0;
        const orderItems: any[] = [];
        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem || !menuItem.isAvailable) return Response.json({ error: `Item not available: ${item.menuItemId}` }, { status: 400 });
            const itemTotal = menuItem.price * item.quantity;
            subtotal += itemTotal;
            orderItems.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, subtotal: itemTotal, notes: item.notes });
        }

        let discountAmount = 0;
        if (couponCode) {
            const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, restaurantId, isActive: true } });
            if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrder && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
                discountAmount = coupon.type === 'percent' ? (subtotal * coupon.value / 100) : coupon.value;
                if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
            }
        }

        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId } });
        const taxPercent = settings?.taxPercent || 5;
        const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
        const loyaltyDiscount = loyaltyPointsUsed ? (loyaltyPointsUsed * (settings?.pointsValue || 0.01)) : 0;
        const totalAmount = subtotal + taxAmount - discountAmount - loyaltyDiscount;
        const pointsPerRupee = settings?.pointsPerRupee || 0.1;
        const loyaltyPointsEarned = Math.floor(totalAmount * pointsPerRupee);

        const order = await prisma.order.create({
            data: {
                restaurantId, customerId, customerName, customerPhone, customerEmail,
                orderType: orderType || 'delivery', paymentMethod: paymentMethod || 'razorpay',
                subtotal, taxAmount, discountAmount: discountAmount + loyaltyDiscount, totalAmount,
                couponCode, notes, address, tableNumber, loyaltyPointsEarned, loyaltyPointsUsed: loyaltyPointsUsed || 0,
                orderItems: { create: orderItems }
            },
            include: { orderItems: true }
        });

        if (customerId && loyaltyPointsUsed > 0) {
            await prisma.customer.update({ where: { id: customerId }, data: { loyaltyPoints: { decrement: loyaltyPointsUsed } } });
        }

        return Response.json(order);
    } catch (err: any) {
        return serverError(err);
    }
}
