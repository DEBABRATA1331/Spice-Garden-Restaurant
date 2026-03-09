import { NextRequest, NextResponse } from 'next/server';

const resolveBackendBase = () => {
    const explicit = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!explicit) return null;
    return explicit.replace(/\/$/, '');
};

const buildTargetUrl = (req: NextRequest, path: string[]) => {
    const base = resolveBackendBase();
    if (!base) return null;

    const query = req.nextUrl.search || '';
    return `${base}/${path.join('/')}${query}`;
};

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    const targetUrl = buildTargetUrl(req, path);

    if (!targetUrl) {
        return NextResponse.json(
            {
                error:
                    'Backend API is not configured. Set BACKEND_API_URL (preferred) or NEXT_PUBLIC_API_URL in frontend environment variables.',
            },
            { status: 500 }
        );
    }

    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('content-length');

    const init: RequestInit = {
        method: req.method,
        headers,
        redirect: 'manual',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        init.body = await req.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
export async function OPTIONS(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxy(req, context);
}
