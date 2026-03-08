import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Create reservation (public)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { restaurantId, customerId, customerName, customerPhone, customerEmail, date, time, guests, notes } = req.body;
        const reservation = await prisma.reservation.create({
            data: { restaurantId, customerId, customerName, customerPhone, customerEmail, date, time, guests: parseInt(guests), notes }
        });
        res.json(reservation);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get reservation by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
    const res_ = await prisma.reservation.findUnique({ where: { id: (req.params.id as string) }, include: { restaurant: { select: { name: true, phone: true, address: true } } } });
    if (!res_) return res.status(404).json({ error: 'Not found' });
    res.json(res_);
});

// Admin: Get all reservations
router.get('/admin/all', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { status, date, month } = req.query;
        const where: any = { restaurantId: req.restaurantId };
        if (status) where.status = status;
        if (date) where.date = date;
        if (month) where.date = { startsWith: month as string }; // month = "2024-03"
        const reservations = await prisma.reservation.findMany({
            where, orderBy: [{ date: 'asc' }, { time: 'asc' }]
        });
        res.json(reservations);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: Update reservation status
router.patch('/:id/status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { status, tableNumber } = req.body;
        const rsv = await prisma.reservation.update({ where: { id: (req.params.id as string) }, data: { status, tableNumber } });
        res.json(rsv);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: Delete reservation
router.delete('/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        await prisma.reservation.delete({ where: { id: (req.params.id as string) } });
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
