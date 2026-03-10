import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

// Admin Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const admin = await prisma.adminUser.findFirst({ where: { email, isActive: true } });
        if (!admin || !await bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
        if (!process.env.SETUP_KEY || setupKey !== process.env.SETUP_KEY) {
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
            data: { name, email, password: hashed, restaurantId: restaurant.id, role: 'owner' }
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

// Reset credentials (re-seed admin + waiter passwords)
router.post('/reset-credentials', async (req: Request, res: Response) => {
    try {
        const { setupKey, restaurantSlug } = req.body;
        if (!process.env.SETUP_KEY || setupKey !== process.env.SETUP_KEY) {
            return res.status(403).json({ error: 'Invalid setup key' });
        }
        const slug = restaurantSlug || 'demo';
        const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
        if (!restaurant) return res.status(404).json({ error: `Restaurant with slug '${slug}' not found` });

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

        res.json({
            message: 'Credentials reset successfully',
            admin: { email: updatedAdmin.email, role: updatedAdmin.role, password: 'admin123' },
            waiter: { email: updatedWaiter.email, role: updatedWaiter.role, password: 'waiter123' }
        });
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
