import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const body = await req.json();
        const data = { ...body, restaurantId: payload.restaurantId, price: parseFloat(body.price), originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null };
        const item = await prisma.menuItem.create({ data });
        return Response.json(item);
    } catch (err: any) {
        return serverError(err);
    }
}
