import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    customerId?: string;
    restaurantId?: string;
}

export interface AdminRequest extends Request {
    adminId?: string;
    restaurantId?: string;
    role?: string;
}

export const authenticateCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        req.customerId = decoded.customerId;
        req.restaurantId = decoded.restaurantId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const authenticateAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_ADMIN_SECRET!);
        req.adminId = decoded.adminId;
        req.restaurantId = decoded.restaurantId;
        req.role = decoded.role;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireOwner = (req: AdminRequest, res: Response, next: NextFunction) => {
    if (req.role !== 'owner') return res.status(403).json({ error: 'Owner access required' });
    next();
};
