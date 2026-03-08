import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Get restaurant by slug (public)
router.get('/slug/:slug', async (req: Request, res: Response) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: (req.params.slug as string), isActive: true },
            include: { settings: { select: { loyaltyEnabled: true, taxPercent: true, pointsPerRupee: true } } }
        });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(restaurant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update restaurant profile (admin only)
router.put('/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { name, description, logo, coverImage, address, phone, email, website, mapLink } = req.body;
        if (req.restaurantId !== (req.params.id as string)) return res.status(403).json({ error: 'Forbidden' });
        const restaurant = await prisma.restaurant.update({
            where: { id: (req.params.id as string) },
            data: { name, description, logo, coverImage, address, phone, email, website, mapLink }
        });
        res.json(restaurant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update settings
router.put('/:id/settings', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        if (req.restaurantId !== (req.params.id as string)) return res.status(403).json({ error: 'Forbidden' });
        const settings = await prisma.restaurantSettings.upsert({
            where: { restaurantId: (req.params.id as string) },
            update: req.body,
            create: { restaurantId: (req.params.id as string), ...req.body }
        });
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get settings (admin)
router.get('/:id/settings', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        if (req.restaurantId !== (req.params.id as string)) return res.status(403).json({ error: 'Forbidden' });
        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId: (req.params.id as string) } });
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
