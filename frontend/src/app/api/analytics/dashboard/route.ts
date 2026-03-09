import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();
        const restaurantId = payload.restaurantId;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [todayOrders, totalOrders, pendingOrders, totalRevenue, todayRevenue, totalCustomers, recentOrders, rawDailyRevenue] = await Promise.all([
            prisma.order.count({ where: { restaurantId, createdAt: { gte: today, lte: todayEnd } } }),
            prisma.order.count({ where: { restaurantId } }),
            prisma.order.count({ where: { restaurantId, status: { in: ['pending', 'confirmed', 'preparing'] } } }),
            prisma.order.aggregate({ where: { restaurantId, paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
            prisma.order.aggregate({ where: { restaurantId, paymentStatus: 'paid', createdAt: { gte: today, lte: todayEnd } }, _sum: { totalAmount: true } }),
            prisma.customer.count({ where: { restaurantId } }),
            prisma.order.findMany({ where: { restaurantId }, include: { orderItems: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
            prisma.order.findMany({
                where: { restaurantId, paymentStatus: 'paid', createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true, totalAmount: true },
                orderBy: { createdAt: 'asc' }
            })
        ]);

        const dailyRevenue = rawDailyRevenue.reduce<Record<string, number>>((acc: Record<string, number>, order: { createdAt: Date, totalAmount: any }) => {
            const dayKey = order.createdAt.toISOString().slice(0, 10);
            const amount = Number(order.totalAmount);
            acc[dayKey] = (acc[dayKey] ?? 0) + amount;
            return acc;
        }, {});

        const popularDishes = await prisma.orderItem.groupBy({
            by: ['menuItemId', 'name'],
            where: { order: { restaurantId, createdAt: { gte: thirtyDaysAgo } } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const orderStatusBreakdown = await prisma.order.groupBy({
            by: ['status'],
            where: { restaurantId, createdAt: { gte: thirtyDaysAgo } },
            _count: { status: true }
        });

        return Response.json({ todayOrders, totalOrders, pendingOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, todayRevenue: todayRevenue._sum.totalAmount || 0, totalCustomers, recentOrders, dailyRevenue, popularDishes, orderStatusBreakdown });
    } catch (err: any) {
        return serverError(err);
    }
}
