import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const item = await prisma.menuItem.findUnique({ where: { id } });
        if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
        const updated = await prisma.menuItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
        return Response.json(updated);
    } catch (err: any) {
        return serverError(err);
    }
}
