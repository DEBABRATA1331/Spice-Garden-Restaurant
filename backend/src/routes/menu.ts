import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import prisma from '../lib/prisma';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

// Get all categories (public)
router.get('/categories/:restaurantId', async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
        where: { restaurantId: (req.params.restaurantId as string), isActive: true },
        orderBy: { sortOrder: 'asc' }
    });
    res.json(categories);
});

// Create category (admin)
router.post('/categories', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const { name, description, image, sortOrder } = req.body;
        const cat = await prisma.category.create({
            data: { name, description, image, sortOrder: sortOrder || 0, restaurantId: req.restaurantId! }
        });
        res.json(cat);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update category
router.put('/categories/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.restaurantId !== req.restaurantId) return res.status(403).json({ error: 'Unauthorized' });
        const cat = await prisma.category.update({ where: { id }, data: req.body });
        res.json(cat);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete category
router.delete('/categories/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.restaurantId !== req.restaurantId) return res.status(403).json({ error: 'Unauthorized' });
        await prisma.category.delete({ where: { id } });
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── MENU ITEMS ────────────────────────────────────────────────────────────────

// Get all menu items (public)
router.get('/items/:restaurantId', async (req: Request, res: Response) => {
    const { categoryId, available } = req.query;
    const where: any = { restaurantId: (req.params.restaurantId as string) };
    if (categoryId) where.categoryId = categoryId;
    if (available === 'true') where.isAvailable = true;
    const items = await prisma.menuItem.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }]
    });
    res.json(items);
});

// Get single item
router.get('/items/single/:id', async (req: Request, res: Response) => {
    const item = await prisma.menuItem.findUnique({ where: { id: (req.params.id as string) }, include: { category: true } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

// Create menu item (admin)
router.post('/items', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const data = { ...req.body, restaurantId: req.restaurantId, price: parseFloat(req.body.price), originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null };
        const item = await prisma.menuItem.create({ data });
        res.json(item);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update menu item
router.put('/items/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const existing = await prisma.menuItem.findUnique({ where: { id } });
        if (!existing || existing.restaurantId !== req.restaurantId) return res.status(403).json({ error: 'Unauthorized' });
        const data = { ...req.body };
        if (data.price) data.price = parseFloat(data.price);
        if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);
        const item = await prisma.menuItem.update({ where: { id }, data });
        res.json(item);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete menu item
router.delete('/items/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const existing = await prisma.menuItem.findUnique({ where: { id } });
        if (!existing || existing.restaurantId !== req.restaurantId) return res.status(403).json({ error: 'Unauthorized' });
        await prisma.menuItem.delete({ where: { id } });
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Toggle availability
router.patch('/items/:id/toggle', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const item = await prisma.menuItem.findUnique({ where: { id } });
        if (!item || item.restaurantId !== req.restaurantId) return res.status(404).json({ error: 'Not found or unauthorized' });
        const updated = await prisma.menuItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
        res.json(updated);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Image upload
router.post('/upload', authenticateAdmin, upload.single('image'), async (req: AdminRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
});

export default router;
