import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const review = await prisma.review.create({ data: { ...body, rating: parseInt(body.rating) } });
        return Response.json(review);
    } catch (err: any) { return serverError(err); }
}
