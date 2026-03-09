import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        if (payload.restaurantId !== id) return Response.json({ error: 'Forbidden' }, { status: 403 });
        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId: id } });
        return Response.json(settings);
    } catch (err: any) {
        return serverError(err);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        if (payload.restaurantId !== id) return Response.json({ error: 'Forbidden' }, { status: 403 });
        const body = await req.json();
        const settings = await prisma.restaurantSettings.upsert({
            where: { restaurantId: id },
            update: body,
            create: { restaurantId: id, ...body }
        });
        return Response.json(settings);
    } catch (err: any) {
        return serverError(err);
    }
}
