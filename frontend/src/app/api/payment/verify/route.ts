import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
        const keySecret = process.env.RAZORPAY_KEY_SECRET!;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        const isValid = expectedSignature === razorpay_signature;
        return Response.json({ verified: isValid });
    } catch (err: any) { return serverError(err); }
}
