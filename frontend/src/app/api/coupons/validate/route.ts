import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const { code, restaurantId, orderAmount } = await req.json();
        const coupon = await prisma.coupon.findFirst({ where: { code, restaurantId, isActive: true } });
        if (!coupon) return Response.json({ error: 'Invalid coupon code' }, { status: 404 });
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) return Response.json({ error: 'Coupon expired' }, { status: 400 });
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return Response.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        if (orderAmount < coupon.minOrder) return Response.json({ error: `Minimum order ₹${coupon.minOrder} required` }, { status: 400 });
        let discount = coupon.type === 'percent' ? (orderAmount * coupon.value / 100) : coupon.value;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        return Response.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
    } catch (err: any) { return serverError(err); }
}
