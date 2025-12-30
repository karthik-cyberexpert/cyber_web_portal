import { Request, Response } from 'express';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify role (optional, but good security)
    if (role && user.role !== role && !(user.role === 'faculty' && role === 'tutor')) {
       return res.status(403).json({ message: 'Role mismatch' });
    }

    // Role Elevation: If role is faculty, check if they are an active tutor
    let effectiveRole = user.role;
    console.log(`[AUTH] Checking role elevation for User: ${user.email}, Current Role: ${user.role}`);
    
    if (user.role === 'faculty') {
        const [tutors]: any = await pool.query(
            'SELECT id FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [user.id]
        );
        console.log(`[AUTH] Found ${tutors.length} active tutor assignments for User ID ${user.id}`);
        if (tutors.length > 0) {
            effectiveRole = 'tutor';
            console.log(`[AUTH] Role elevated to 'tutor' for user ${user.email}`);
        }
    }

    // Generate Token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: effectiveRole, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    console.log(`[AUTH] Returning user with effective role: ${effectiveRole}`);
    res.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        avatar: user.avatar_url
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
