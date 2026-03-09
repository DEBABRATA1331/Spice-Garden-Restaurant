import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const { restaurantId, customerId, customerName, customerPhone, customerEmail, date, time, guests, notes } = await req.json();
        const reservation = await prisma.reservation.create({
            data: { restaurantId, customerId, customerName, customerPhone, customerEmail, date, time, guests: parseInt(guests), notes }
        });
        return Response.json(reservation);
    } catch (err: any) {
        return serverError(err);
    }
}
