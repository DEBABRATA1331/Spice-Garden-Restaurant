import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const where: any = { restaurantId: payload.restaurantId };
        if (status) where.status = status;
        if (date) where.date = date;
        if (month) where.date = { startsWith: month };
        const reservations = await prisma.reservation.findMany({ where, orderBy: [{ date: 'asc' }, { time: 'asc' }] });
        return Response.json(reservations);
    } catch (err: any) {
        return serverError(err);
    }
}
