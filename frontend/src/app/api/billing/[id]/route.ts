import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const invoice = await prisma.invoice.findUnique({ where: { id }, include: { order: { include: { orderItems: true } }, restaurant: { select: { name: true, address: true, phone: true, email: true } } } });
        if (!invoice) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json(invoice);
    } catch (err: any) { return serverError(err); }
}
