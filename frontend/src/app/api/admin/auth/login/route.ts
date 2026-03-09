import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        const admin = await prisma.adminUser.findFirst({ where: { email, isActive: true } });
        if (!admin || !await bcrypt.compare(password, admin.password)) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const restaurant = await prisma.restaurant.findUnique({ where: { id: admin.restaurantId } });
        const token = jwt.sign(
            { adminId: admin.id, restaurantId: admin.restaurantId, role: admin.role },
            process.env.JWT_ADMIN_SECRET!,
            { expiresIn: '8h' }
        );
        return Response.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }, restaurant });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
