import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../lib/prisma';

const router = Router();

// Create Razorpay order
router.post('/create-order', async (req: Request, res: Response) => {
    try {
        const { amount, currency, orderId, restaurantId } = req.body;
        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId } });
        const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
        const keySecret = settings?.razorpaySecret || process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) return res.status(400).json({ error: 'Razorpay not configured' });

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: currency || 'INR',
            receipt: orderId,
            notes: { orderId }
        });

        // Update order with Razorpay order ID
        await prisma.order.update({ where: { id: orderId }, data: { razorpayOrderId: order.id } });
        res.json({ razorpayOrderId: order.id, keyId });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Verify payment
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, restaurantId } = req.body;
        const settings = await prisma.restaurantSettings.findUnique({ where: { restaurantId } });
        const keySecret = settings?.razorpaySecret || process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) return res.status(400).json({ error: 'Not configured' });

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', keySecret).update(sign).digest('hex');
        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id, status: 'confirmed' }
        });
        res.json({ success: true, message: 'Payment verified' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
