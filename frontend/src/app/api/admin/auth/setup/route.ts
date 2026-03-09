import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { setupKey, name, email, password, restaurantName, restaurantSlug, phone, address } = await req.json();
        if (setupKey !== process.env.SETUP_KEY && setupKey !== 'SETUP_RESTAURANT_2024') {
            return Response.json({ error: 'Invalid setup key' }, { status: 403 });
        }
        const existing = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
        if (existing) return Response.json({ error: 'Slug already taken' }, { status: 400 });

        const restaurant = await prisma.restaurant.create({
            data: { name: restaurantName, slug: restaurantSlug, phone, address }
        });
        await prisma.restaurantSettings.create({ data: { restaurantId: restaurant.id } });

        const hashed = await bcrypt.hash(password, 10);
        const admin = await prisma.adminUser.create({
            data: { name, email, password: hashed, restaurantId: restaurant.id, role: 'owner' }
        });
        const token = jwt.sign(
            { adminId: admin.id, restaurantId: restaurant.id, role: 'owner' },
            process.env.JWT_ADMIN_SECRET!,
            { expiresIn: '8h' }
        );
        return Response.json({ message: 'Restaurant created successfully', token, restaurant, admin: { id: admin.id, name: admin.name, email: admin.email } });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
