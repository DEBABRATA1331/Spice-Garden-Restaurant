import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { verifyCustomerToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyCustomerToken(req);
        if (!payload) return unauthorized();
        const customer = await prisma.customer.findUnique({ where: { id: payload.customerId } });
        if (!customer) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints });
    } catch (err: any) {
        return serverError(err);
    }
}
