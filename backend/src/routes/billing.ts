import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Get all invoices (admin)
router.get('/admin/all', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { page = '1', limit = '20', isPaid } = req.query;
        const where: any = { restaurantId: req.restaurantId };
        if (isPaid !== undefined) where.isPaid = isPaid === 'true';
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({ where, include: { order: { include: { orderItems: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
            prisma.invoice.count({ where })
        ]);
        res.json({ invoices, total });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get invoice by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
    const invoice = await prisma.invoice.findUnique({
        where: { id: (req.params.id as string) },
        include: { order: { include: { orderItems: true } }, restaurant: { select: { name: true, address: true, phone: true, email: true } } }
    });
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
});

// Mark invoice as paid
router.patch('/:id/pay', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const invoice = await prisma.invoice.update({ where: { id: (req.params.id as string) }, data: { isPaid: true, paidAt: new Date() } });
        await prisma.order.update({ where: { id: invoice.orderId }, data: { paymentStatus: 'paid' } });
        res.json(invoice);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Daily sales summary
router.get('/summary/daily', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { date } = req.query;
        const d = date ? new Date(date as string) : new Date();
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setHours(23, 59, 59, 999);
        const [orders, revenue, paidRevenue] = await Promise.all([
            prisma.order.count({ where: { restaurantId: req.restaurantId!, createdAt: { gte: start, lte: end } } }),
            prisma.order.aggregate({ where: { restaurantId: req.restaurantId!, createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true } }),
            prisma.order.aggregate({ where: { restaurantId: req.restaurantId!, createdAt: { gte: start, lte: end }, paymentStatus: 'paid' }, _sum: { totalAmount: true } })
        ]);
        res.json({ date: d.toISOString().split('T')[0], totalOrders: orders, totalRevenue: revenue._sum.totalAmount || 0, paidRevenue: paidRevenue._sum.totalAmount || 0 });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
