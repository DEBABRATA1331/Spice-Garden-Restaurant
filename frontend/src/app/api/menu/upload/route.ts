import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const payload = verifyAdminToken(req);
        if (!payload) return unauthorized();

        const formData = await req.formData();
        const file = formData.get('image') as File;
        if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

        // Convert to base64 data URL (works on Vercel without filesystem, Node or Edge)
        const bytes = await file.arrayBuffer();

        const toBase64 = (data: ArrayBuffer): string => {
            if (typeof Buffer !== 'undefined') return Buffer.from(data).toString('base64');
            let binary = '';
            const typedArr = new Uint8Array(data);
            for (let i = 0; i < typedArr.byteLength; i++) {
                binary += String.fromCharCode(typedArr[i]);
            }
            return btoa(binary);
        };

        const base64 = toBase64(bytes);
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return Response.json({ url: dataUrl });
    } catch (err: any) {
        return serverError(err);
    }
}
