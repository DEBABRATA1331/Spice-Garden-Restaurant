import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateCustomer, AuthRequest } from '../middleware/auth';

const router = Router();

// Get loyalty points balance
router.get('/balance', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.customerId }, select: { loyaltyPoints: true } });
    res.json({ points: customer?.loyaltyPoints || 0 });
});

// Get loyalty transactions (from orders)
router.get('/history', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    const orders = await prisma.order.findMany({
        where: { customerId: req.customerId, restaurantId: req.restaurantId },
        select: { id: true, createdAt: true, loyaltyPointsEarned: true, loyaltyPointsUsed: true, totalAmount: true, status: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
});

export default router;
