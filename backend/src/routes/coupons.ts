import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Get coupons (admin)
router.get('/admin/all', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    const coupons = await prisma.coupon.findMany({ where: { restaurantId: req.restaurantId }, orderBy: { createdAt: 'desc' } });
    res.json(coupons);
});

// Create coupon
router.post('/', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const coupon = await prisma.coupon.create({ data: { ...req.body, restaurantId: req.restaurantId, value: parseFloat(req.body.value), minOrder: parseFloat(req.body.minOrder || '0') } });
        res.json(coupon);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update coupon
router.put('/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const coupon = await prisma.coupon.update({ where: { id: (req.params.id as string) }, data: req.body });
        res.json(coupon);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete coupon
router.delete('/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        await prisma.coupon.delete({ where: { id: (req.params.id as string) } });
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Validate coupon (public)
router.post('/validate', async (req: Request, res: Response) => {
    try {
        const { code, restaurantId, orderAmount } = req.body;
        const coupon = await prisma.coupon.findFirst({ where: { code, restaurantId, isActive: true } });
        if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) return res.status(400).json({ error: 'Coupon expired' });
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ error: 'Coupon usage limit reached' });
        if (orderAmount < coupon.minOrder) return res.status(400).json({ error: `Minimum order ₹${coupon.minOrder} required` });
        let discount = coupon.type === 'percent' ? (orderAmount * coupon.value / 100) : coupon.value;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        res.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
