import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const admin = await prisma.adminUser.findUnique({
            where: { id: payload.adminId },
            include: { restaurant: true }
        });
        if (!admin) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, restaurant: admin.restaurant });
    } catch (err: any) {
        return serverError(err);
    }
}
