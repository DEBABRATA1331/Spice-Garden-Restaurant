import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';
import { createCoupon } from '../../shared';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const coupons = await prisma.coupon.findMany({ where: { restaurantId: payload.restaurantId }, orderBy: { createdAt: 'desc' } });
        return Response.json(coupons);
    } catch (err: any) { return serverError(err); }
}

// Use shared helper — no duplicate parsing logic
export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const body = await req.json();
        const coupon = await createCoupon(payload, body);
        return Response.json(coupon);
    } catch (err: any) { return serverError(err); }
}
