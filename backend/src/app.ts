import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth';
import adminAuthRoutes from './routes/adminAuth';
import restaurantRoutes from './routes/restaurant';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import reservationRoutes from './routes/reservations';
import billingRoutes from './routes/billing';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payment';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import qrRoutes from './routes/qr';
import loyaltyRoutes from './routes/loyalty';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/loyalty', loyaltyRoutes);

if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    app.listen(PORT, () => {
        console.log(`🚀 Restaurant API running on port ${PORT}`);
    });
}

export default app;
