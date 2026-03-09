import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';
import { createCoupon } from './shared';

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const body = await req.json();
        const coupon = await createCoupon(payload, body);
        return Response.json(coupon);
    } catch (err: any) { return serverError(err); }
}
