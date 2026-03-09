import { NextRequest } from 'next/server';
import { serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'INR', receipt } = await req.json();
        // Razorpay integration (requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars)
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            return Response.json({ error: 'Razorpay not configured' }, { status: 503 });
        }
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
            },
            body: JSON.stringify({ amount: Math.round(amount * 100), currency, receipt }),
        });
        const order = await response.json();
        return Response.json({ ...order, key: keyId });
    } catch (err: any) { return serverError(err); }
}
