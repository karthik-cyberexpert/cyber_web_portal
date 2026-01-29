import { Request, Response } from 'express';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    console.log(`[LOGIN DEBUG] Request Body:`, req.body);
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log(`[LOGIN DEBUG] DB Query result length: ${rows.length}`);
    
    if (rows.length === 0) {
      console.log(`[LOGIN DEBUG] User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log(`[LOGIN DEBUG] User found: ${user.email}, Hash: ${user.password_hash}`);

    // Verify password
    console.log(`[LOGIN DEBUG] Comparing password: '${password}' with hash...`);
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`[LOGIN DEBUG] Password match result: ${validPassword}`);
    
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

    // Check if password needs to be changed (first-time login)
    const requiresPasswordChange = user.password_changed === 0 || user.password_changed === false;
    console.log(`[AUTH] Password changed status: ${user.password_changed}, requires change: ${requiresPasswordChange}`);

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
      },
      requiresPasswordChange
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Set Password (First-time login or password reset)
export const setPassword = async (req: Request | any, res: Response) => {
  const userId = req.user?.id;
  const { newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark as changed
    await pool.query(
      'UPDATE users SET password_hash = ?, password_changed = TRUE WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log(`[AUTH] Password updated for user ID: ${userId}`);
    res.json({ message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Set Password error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

// Update Password (with old password verification)
export const updatePassword = async (req: Request | any, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    // Get current user
    const [users]: any = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const validOldPassword = await bcrypt.compare(oldPassword, users[0].password_hash);
    if (!validOldPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ?, password_changed = TRUE WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log(`[AUTH] Password updated for user ID: ${userId}`);
    res.json({ message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Update Password error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};



// Google Login
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!googleClientId) {
    console.error('[AUTH] GOOGLE_CLIENT_ID is not defined in server environment variables.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    console.log('[AUTH] Verifying Google Token...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    
    const payload = ticket.getPayload();
    const email = payload?.email;
    
    if (!email) {
      return res.status(400).json({ message: 'Invalid Google Token: Email missing' });
    }

    console.log(`[AUTH] Google User Email: ${email}`);

    // Check if user exists (Whitelist Check)
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log(`[AUTH] Login denied. Email not registered: ${email}`);
      return res.status(403).json({ message: 'Login not registered' });
    }

    const user = rows[0];
    
    // Role Elevation logic (same as standard login)
    let effectiveRole = user.role;
    if (user.role === 'faculty') {
        const [tutors]: any = await pool.query(
            'SELECT id FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [user.id]
        );
        if (tutors.length > 0) {
            effectiveRole = 'tutor';
        }
    }

    // Generate Token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: effectiveRole, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        avatar: user.avatar_url,
        google_login: true
      },
      requiresPasswordChange: false // Google login doesn't need password change
    });

  } catch (error: any) {
    console.error('Google Login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};
