import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest, authenticateCustomer, AuthRequest } from '../middleware/auth';

const router = Router();

// Create order (public / customer)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { restaurantId, customerId, customerName, customerPhone, customerEmail, orderType,
            items, couponCode, address, tableNumber, notes, loyaltyPointsUsed, paymentMethod } = req.body;

        if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });

        // Validate items and calculate totals
        let subtotal = 0;
        const orderItems: any[] = [];
        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem || !menuItem.isAvailable) return res.status(400).json({ error: `Item not available: ${item.menuItemId}` });
            const itemTotal = menuItem.price * item.quantity;
            subtotal += itemTotal;
            orderItems.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, subtotal: itemTotal, notes: item.notes });
        }

        // Apply coupon
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, restaurantId, isActive: true } });
            if (coupon) {
                const now = new Date();
                if (!coupon.expiresAt || coupon.expiresAt > now) {
                    if (subtotal >= coupon.minOrder) {
                        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
                            discountAmount = coupon.type === 'percent' ? (subtotal * coupon.value / 100) : coupon.value;
                            if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                            await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
                        }
                    }
                }
            }
        }

        // Get tax
        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId } });
        const taxPercent = settings?.taxPercent || 5;
        const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
        const loyaltyDiscount = loyaltyPointsUsed ? (loyaltyPointsUsed * (settings?.pointsValue || 0.01)) : 0;
        const totalAmount = subtotal + taxAmount - discountAmount - loyaltyDiscount;

        // Calculate loyalty points to earn
        const pointsPerRupee = settings?.pointsPerRupee || 0.1;
        const loyaltyPointsEarned = Math.floor(totalAmount * pointsPerRupee);

        const order = await prisma.order.create({
            data: {
                restaurantId, customerId, customerName, customerPhone, customerEmail,
                orderType: orderType || 'delivery', paymentMethod: paymentMethod || 'razorpay',
                subtotal, taxAmount, discountAmount: discountAmount + loyaltyDiscount, totalAmount,
                couponCode, notes, address, tableNumber, loyaltyPointsEarned, loyaltyPointsUsed: loyaltyPointsUsed || 0,
                orderItems: { create: orderItems }
            },
            include: { orderItems: true }
        });

        // Deduct loyalty points used
        if (customerId && loyaltyPointsUsed > 0) {
            await prisma.customer.update({ where: { id: customerId }, data: { loyaltyPoints: { decrement: loyaltyPointsUsed } } });
        }

        res.json(order);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get order by ID (public with order ID)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: (req.params.id as string) },
            include: { orderItems: { include: { menuItem: { select: { name: true, image: true } } } }, restaurant: { select: { name: true, phone: true } } }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get customer orders
router.get('/customer/:customerId', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { customerId: (req.params.customerId as string), restaurantId: req.restaurantId },
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────────

// Get all orders (admin)
router.get('/admin/all', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { status, date, page = '1', limit = '20' } = req.query;
        const where: any = { restaurantId: req.restaurantId };
        if (status) where.status = status;
        if (date) {
            const start = new Date(date as string); start.setHours(0, 0, 0, 0);
            const end = new Date(date as string); end.setHours(23, 59, 59, 999);
            where.createdAt = { gte: start, lte: end };
        }
        const [orders, total] = await Promise.all([
            prisma.order.findMany({ where, include: { orderItems: true, invoice: true }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
            prisma.order.count({ where })
        ]);
        res.json({ orders, total, page: parseInt(page as string), limit: parseInt(limit as string) });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update order status (admin)
router.patch('/:id/status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.update({ where: { id: (req.params.id as string) }, data: { status } });

        // Award loyalty points on delivery
        if (status === 'delivered' && order.customerId && order.loyaltyPointsEarned > 0) {
            await prisma.customer.update({ where: { id: order.customerId }, data: { loyaltyPoints: { increment: order.loyaltyPointsEarned } } });
        }

        // Create invoice on delivery
        if (status === 'delivered') {
            const count = await prisma.invoice.count({ where: { restaurantId: req.restaurantId! } });
            const invoiceNo = `INV-${Date.now()}-${count + 1}`;
            const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
            if (!existing) {
                await prisma.invoice.create({
                    data: { restaurantId: req.restaurantId!, orderId: order.id, invoiceNo, subtotal: order.subtotal, taxAmount: order.taxAmount, discountAmount: order.discountAmount, totalAmount: order.totalAmount, isPaid: order.paymentStatus === 'paid', paidAt: order.paymentStatus === 'paid' ? new Date() : null }
                });
            }
        }
        res.json(order);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Manual Invoice Generation
router.post('/:id/invoice', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const order = await prisma.order.findUnique({ where: { id: (req.params.id as string) } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
        if (existing) return res.json(existing);

        const count = await prisma.invoice.count({ where: { restaurantId: req.restaurantId! } });
        const invoiceNo = `INV-${Date.now()}-${count + 1}`;
        const invoice = await prisma.invoice.create({
            data: {
                restaurantId: req.restaurantId!,
                orderId: order.id,
                invoiceNo,
                subtotal: order.subtotal,
                taxAmount: order.taxAmount,
                discountAmount: order.discountAmount,
                totalAmount: order.totalAmount,
                isPaid: order.paymentStatus === 'paid',
                paidAt: order.paymentStatus === 'paid' ? new Date() : null
            },
            include: { order: { include: { orderItems: true } } }
        });
        res.json(invoice);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
