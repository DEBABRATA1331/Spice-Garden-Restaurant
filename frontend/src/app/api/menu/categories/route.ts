import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { name, description, image, sortOrder } = await req.json();
        const cat = await prisma.category.create({
            data: { name, description, image, sortOrder: sortOrder || 0, restaurantId: payload.restaurantId }
        });
        return Response.json(cat);
    } catch (err: any) {
        return serverError(err);
    }
}
