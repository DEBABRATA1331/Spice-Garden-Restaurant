import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, password, restaurantId } = await req.json();
        const existing = await prisma.customer.findFirst({ where: { email, restaurantId } });
        if (existing) return Response.json({ error: 'Email already registered' }, { status: 400 });
        const hashed = await bcrypt.hash(password, 10);
        const customer = await prisma.customer.create({
            data: { name, email, phone, password: hashed, restaurantId }
        });
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
