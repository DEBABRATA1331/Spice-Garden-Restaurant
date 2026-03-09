import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { setupKey, restaurantSlug } = await req.json();
        if (!process.env.SETUP_KEY || setupKey !== process.env.SETUP_KEY) {
            return Response.json({ error: 'Invalid setup key' }, { status: 403 });
        }
        const slug = restaurantSlug || 'demo';
        const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
        if (!restaurant) return Response.json({ error: `Restaurant '${slug}' not found` }, { status: 404 });

        const adminPassword = await bcrypt.hash('admin123', 10);
        const updatedAdmin = await prisma.adminUser.upsert({
            where: { email: 'admin@spicegarden.com' },
            update: { password: adminPassword, isActive: true },
            create: { name: 'Restaurant Owner', email: 'admin@spicegarden.com', password: adminPassword, restaurantId: restaurant.id, role: 'owner' }
        });

        const waiterPassword = await bcrypt.hash('waiter123', 10);
        const updatedWaiter = await prisma.adminUser.upsert({
            where: { email: 'waiter@spicegarden.com' },
            update: { password: waiterPassword, isActive: true },
            create: { name: 'Demo Waiter', email: 'waiter@spicegarden.com', password: waiterPassword, restaurantId: restaurant.id, role: 'waiter' }
        });

        return Response.json({
            message: 'Credentials reset successfully',
            admin: { email: updatedAdmin.email, role: updatedAdmin.role, password: 'admin123' },
            waiter: { email: updatedWaiter.email, role: updatedWaiter.role, password: 'waiter123' }
        });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
