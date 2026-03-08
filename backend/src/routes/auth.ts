import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

// Customer Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, restaurantId } = req.body;
        const existing = await prisma.customer.findFirst({ where: { email, restaurantId } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 10);
        const customer = await prisma.customer.create({
            data: { name, email, phone, password: hashed, restaurantId }
        });
        const token = jwt.sign(
            { customerId: customer.id, restaurantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, loyaltyPoints: customer.loyaltyPoints } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password, restaurantId } = req.body;
        const customer = await prisma.customer.findFirst({ where: { email, restaurantId } });
        if (!customer || !await bcrypt.compare(password, customer.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { customerId: customer.id, restaurantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, loyaltyPoints: customer.loyaltyPoints } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Simple Login (Phone + Name)
router.post('/login-simple', async (req: Request, res: Response) => {
    try {
        const { name, phone, restaurantId } = req.body;
        if (!name || !phone || !restaurantId) return res.status(400).json({ error: 'Name, phone, and restaurantId are required' });

        // Generate a dummy email to satisfy the schema's unique constraint
        const dummyEmail = `${phone.replace(/\D/g, '')}@guest.local`;

        let customer = await prisma.customer.findFirst({ where: { phone, restaurantId } });

        if (!customer) {
            // Auto-register if not found
            const hashed = await bcrypt.hash(phone, 10); // use phone as dummy password
            customer = await prisma.customer.create({
                data: { name, email: dummyEmail, phone, password: hashed, restaurantId }
            });
        }

        const token = jwt.sign(
            { customerId: customer.id, restaurantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get profile
router.get('/me', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const customer = await prisma.customer.findUnique({ where: { id: decoded.customerId } });
        if (!customer) return res.status(404).json({ error: 'Not found' });
        res.json({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
