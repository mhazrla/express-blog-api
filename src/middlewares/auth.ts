import type {Request, Response, NextFunction} from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId? :string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({message: "Unauthorized"})
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET as string;
        
        if (!secret) return res.status(500).json({message: "JWT secret missing"});

        const payload = jwt.verify(token, secret) as { userId: string };
        req.userId = payload.userId;
        next(); // pass to next middleware or route handler

    } catch (error) {
        return res.status(401).json({message: "Unauthorized"})        
    }
    
}

export default requireAuth;