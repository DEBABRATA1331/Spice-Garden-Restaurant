import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Dashboard analytics
router.get('/dashboard', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const restaurantId = req.restaurantId!;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [todayOrders, totalOrders, pendingOrders, totalRevenue, todayRevenue, totalCustomers, recentOrders] = await Promise.all([
            prisma.order.count({ where: { restaurantId, createdAt: { gte: today, lte: todayEnd } } }),
            prisma.order.count({ where: { restaurantId } }),
            prisma.order.count({ where: { restaurantId, status: { in: ['pending', 'confirmed', 'preparing'] } } }),
            prisma.order.aggregate({ where: { restaurantId, paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
            prisma.order.aggregate({ where: { restaurantId, paymentStatus: 'paid', createdAt: { gte: today, lte: todayEnd } }, _sum: { totalAmount: true } }),
            prisma.customer.count({ where: { restaurantId } }),
            prisma.order.findMany({ where: { restaurantId }, include: { orderItems: true }, orderBy: { createdAt: 'desc' }, take: 10 })
        ]);

        // Revenue last 30 days
        const recentPaidOrders = await prisma.order.findMany({
            where: { restaurantId, paymentStatus: 'paid', createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true, totalAmount: true }
        });
        const dailyRevenueMap = recentPaidOrders.reduce((acc: any, order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + (order.totalAmount || 0);
            return acc;
        }, {});
        const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, total]) => ({ date, total }));

        // Popular dishes
        const popularDishes = await prisma.orderItem.groupBy({
            by: ['menuItemId', 'name'],
            where: { order: { restaurantId, createdAt: { gte: thirtyDaysAgo } } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // Order status breakdown
        const orderStatusBreakdown = await prisma.order.groupBy({
            by: ['status'],
            where: { restaurantId, createdAt: { gte: thirtyDaysAgo } },
            _count: { status: true }
        });

        res.json({
            todayOrders, totalOrders, pendingOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            todayRevenue: todayRevenue._sum.totalAmount || 0,
            totalCustomers,
            recentOrders,
            dailyRevenue,
            popularDishes,
            orderStatusBreakdown
        });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Revenue by date range
router.get('/revenue', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { from, to } = req.query;
        const where: any = { restaurantId: req.restaurantId!, paymentStatus: 'paid' };
        if (from) where.createdAt = { ...where.createdAt, gte: new Date(from as string) };
        if (to) where.createdAt = { ...where.createdAt, lte: new Date(to as string) };
        const revenue = await prisma.order.aggregate({ where, _sum: { totalAmount: true }, _count: { id: true } });
        res.json(revenue);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
