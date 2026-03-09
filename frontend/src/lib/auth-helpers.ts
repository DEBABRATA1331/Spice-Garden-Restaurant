import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AdminPayload {
    adminId: string;
    restaurantId: string;
    role: string;
}

export interface CustomerPayload {
    customerId: string;
    restaurantId: string;
}

export function verifyAdminToken(req: NextRequest): AdminPayload | null {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as AdminPayload;
        return decoded;
    } catch {
        return null;
    }
}

export function verifyCustomerToken(req: NextRequest): CustomerPayload | null {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomerPayload;
        return decoded;
    } catch {
        return null;
    }
}

export function unauthorized() {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

export function serverError(err: any) {
    return Response.json({ error: err?.message || 'Internal server error' }, { status: 500 });
}
