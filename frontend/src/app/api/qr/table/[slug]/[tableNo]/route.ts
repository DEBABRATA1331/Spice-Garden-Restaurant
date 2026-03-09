import { NextRequest } from 'next/server';
import QRCode from 'qrcode';
import { serverError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; tableNo: string }> }) {
    try {
        const { slug, tableNo } = await params;
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/${slug}/menu?table=${tableNo}`;
        const qr = await QRCode.toDataURL(url);
        return Response.json({ qr, url });
    } catch (err: any) { return serverError(err); }
}
