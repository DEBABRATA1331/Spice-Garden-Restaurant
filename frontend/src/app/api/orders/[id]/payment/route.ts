import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const body = await req.json();
        const order = await prisma.order.update({ where: { id }, data: body });
        return Response.json(order);
    } catch (err: any) {
        return serverError(err);
    }
}
