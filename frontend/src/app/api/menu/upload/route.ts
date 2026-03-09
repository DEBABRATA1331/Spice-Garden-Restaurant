import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();

        const formData = await req.formData();
        const file = formData.get('image') as File;
        if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

        // Convert to base64 data URL (works on Vercel without filesystem)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return Response.json({ url: dataUrl });
    } catch (err: any) {
        return serverError(err);
    }
}
