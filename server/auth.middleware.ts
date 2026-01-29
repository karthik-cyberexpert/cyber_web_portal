import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

import { pool } from './db.js';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      console.log('Auth Middleware: No token provided');
      return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) {
        console.error(`Auth Middleware: JWT Verify Error: [${err.name}] ${err.message}`);
        console.log('Received Token:', token.substring(0, 20) + '...');
        return res.sendStatus(403);
    }
    
    // Safety Check: Ensure user still exists in DB
    try {
        const [rows]: any = await pool.query('SELECT id, role FROM users WHERE id = ?', [user.id]);
        if (rows.length === 0) {
             console.log('Token valid but User ID not found in DB (Stale Token). Rejecting.');
             return res.sendStatus(401); 
        }
        (req as any).user = user;
        next();
    } catch(dbErr) {
        console.error('Auth DB check failed:', dbErr);
        res.sendStatus(500);
    }
  });
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request | any, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
