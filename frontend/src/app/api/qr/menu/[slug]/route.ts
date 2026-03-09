import { NextRequest } from 'next/server';
import QRCode from 'qrcode';
import { serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/${slug}/menu`;
        const qr = await QRCode.toDataURL(url);
        return Response.json({ qr, url });
    } catch (err: any) { return serverError(err); }
}
