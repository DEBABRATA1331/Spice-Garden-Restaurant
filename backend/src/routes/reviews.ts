import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Get approved reviews (public)
router.get('/:restaurantId', async (req: Request, res: Response) => {
    const reviews = await prisma.review.findMany({ where: { restaurantId: (req.params.restaurantId as string), isApproved: true }, orderBy: { createdAt: 'desc' } });
    res.json(reviews);
});

// Post review
router.post('/', async (req: Request, res: Response) => {
    try {
        const review = await prisma.review.create({ data: { ...req.body, rating: parseInt(req.body.rating) } });
        res.json(review);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get all reviews (admin - including unapproved)
router.get('/admin/all', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    const reviews = await prisma.review.findMany({ where: { restaurantId: req.restaurantId }, orderBy: { createdAt: 'desc' } });
    res.json(reviews);
});

// Approve/reject review
router.patch('/:id/approve', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const review = await prisma.review.update({ where: { id: (req.params.id as string) }, data: { isApproved: req.body.isApproved } });
        res.json(review);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete review
router.delete('/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        await prisma.review.delete({ where: { id: (req.params.id as string) } });
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
