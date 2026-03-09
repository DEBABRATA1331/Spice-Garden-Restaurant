import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        const body = await req.json();
        const coupon = await prisma.coupon.update({ where: { id }, data: body });
        return Response.json(coupon);
    } catch (err: any) { return serverError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { id } = await params;
        await prisma.coupon.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (err: any) { return serverError(err); }
}
