import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        if (payload.restaurantId !== id) return Response.json({ error: 'Forbidden' }, { status: 403 });
        const { name, description, logo, coverImage, address, phone, email, website, mapLink } = await req.json();
        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: { name, description, logo, coverImage, address, phone, email, website, mapLink }
        });
        return Response.json(restaurant);
    } catch (err: any) {
        return serverError(err);
    }
}
