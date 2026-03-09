import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, password, restaurantId } = await req.json();
        const customer = await prisma.customer.findFirst({ where: { email, restaurantId } });
        if (!customer || !await bcrypt.compare(password, customer.password)) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const token = jwt.sign(
            { customerId: customer.id, restaurantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        return Response.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, loyaltyPoints: customer.loyaltyPoints } });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
