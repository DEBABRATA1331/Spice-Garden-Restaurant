import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { authenticateAdmin, AdminRequest } from '../middleware/auth';

const router = Router();

// Generate QR code for menu
router.get('/menu/:restaurantSlug', async (req: Request, res: Response) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${(req.params.restaurantSlug as string)}/menu`;
        const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
        res.json({ qrCode: qr, url });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Generate QR code for specific table
router.get('/table/:restaurantSlug/:tableNo', authenticateAdmin, async (req: AdminRequest, res: Response) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${(req.params.restaurantSlug as string)}/menu?table=${(req.params.tableNo as string)}`;
        const qr = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        res.json({ qrCode: qr, url, tableNo: (req.params.tableNo as string) });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
