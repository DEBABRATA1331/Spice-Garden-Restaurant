import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { name, phone, restaurantId } = await req.json();
        if (!name || !phone || !restaurantId)
            return Response.json({ error: 'Name, phone, and restaurantId are required' }, { status: 400 });

        const dummyEmail = `${phone.replace(/\D/g, '')}@guest.local`;
        let customer = await prisma.customer.findFirst({ where: { phone, restaurantId } });

        if (!customer) {
            const hashed = await bcrypt.hash(phone, 10);
            customer = await prisma.customer.create({
                data: { name, email: dummyEmail, phone, password: hashed, restaurantId }
            });
        }

        const token = jwt.sign(
            { customerId: customer.id, restaurantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        return Response.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints } });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
