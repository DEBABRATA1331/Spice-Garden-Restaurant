import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const body = await req.json();
        const cat = await prisma.category.update({ where: { id, restaurantId: payload.restaurantId }, data: body });
        return Response.json(cat);
    } catch (err: any) {
        return serverError(err);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        await prisma.category.delete({ where: { id, restaurantId: payload.restaurantId } });
        return Response.json({ success: true });
    } catch (err: any) {
        return serverError(err);
    }
}
