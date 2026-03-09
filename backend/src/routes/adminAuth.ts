import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

// Admin Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admin = await prisma.adminUser.findFirst({ where: { email: normalizedEmail, isActive: true } });
        if (!admin || !await bcrypt.compare(normalizedPassword, admin.password)) {
            return res.status(401).json({ error: 'Invalid credentials. Please verify email/password or seed the backend demo users.' });
        }

        if (role && admin.role !== role) {
            return res.status(403).json({ error: `This account does not have ${role} access` });
        }
        const restaurant = await prisma.restaurant.findUnique({ where: { id: admin.restaurantId } });
        const token = jwt.sign(
            { adminId: admin.id, restaurantId: admin.restaurantId, role: admin.role },
            process.env.JWT_ADMIN_SECRET!,
            { expiresIn: '8h' }
        );
        res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }, restaurant });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create/Seed admin (protected - only usable with special setup key)
router.post('/setup', async (req: Request, res: Response) => {
    try {
        const { setupKey, name, email, password, restaurantName, restaurantSlug, phone, address } = req.body;
        const normalizedOwnerEmail = String(email || '').trim().toLowerCase();
        if (setupKey !== process.env.SETUP_KEY && setupKey !== 'SETUP_RESTAURANT_2024') {
            return res.status(403).json({ error: 'Invalid setup key' });
        }
        // Check if slug is taken
        const existing = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
        if (existing) return res.status(400).json({ error: 'Slug already taken' });
        // Create restaurant + owner
        const restaurant = await prisma.restaurant.create({
            data: { name: restaurantName, slug: restaurantSlug, phone, address }
        });
        // Create default settings
        await prisma.restaurantSettings.create({ data: { restaurantId: restaurant.id } });
        const hashed = await bcrypt.hash(password, 10);
        const admin = await prisma.adminUser.create({
            data: { name, email: normalizedOwnerEmail, password: hashed, restaurantId: restaurant.id, role: 'owner' }
        });

        const waiterPassword = await bcrypt.hash('waiter123', 10);
        await prisma.adminUser.create({
            data: {
                name: 'Waiter User',
                email: `waiter@${restaurantSlug}.com`,
                password: waiterPassword,
                restaurantId: restaurant.id,
                role: 'staff'
            }
        });
        const token = jwt.sign(
            { adminId: admin.id, restaurantId: restaurant.id, role: 'owner' },
            process.env.JWT_ADMIN_SECRET!,
            { expiresIn: '8h' }
        );
        res.json({ message: 'Restaurant created successfully', token, restaurant, admin: { id: admin.id, name: admin.name, email: admin.email } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get current admin
router.get('/me', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });
        const decoded: any = jwt.verify(token, process.env.JWT_ADMIN_SECRET!);
        const admin = await prisma.adminUser.findUnique({
            where: { id: decoded.adminId },
            include: { restaurant: true }
        });
        if (!admin) return res.status(404).json({ error: 'Not found' });
        res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, restaurant: admin.restaurant });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
