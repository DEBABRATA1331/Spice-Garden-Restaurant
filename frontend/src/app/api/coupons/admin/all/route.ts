import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const coupons = await prisma.coupon.findMany({ where: { restaurantId: payload.restaurantId }, orderBy: { createdAt: 'desc' } });
        return Response.json(coupons);
    } catch (err: any) { return serverError(err); }
}

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const body = await req.json();
        const coupon = await prisma.coupon.create({ data: { ...body, restaurantId: payload.restaurantId, value: parseFloat(body.value), minOrder: parseFloat(body.minOrder || '0') } });
        return Response.json(coupon);
    } catch (err: any) { return serverError(err); }
}
