import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Universal Input Sanitizer
 * Recursively removes potential script injections and trims strings
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitizeValue = (value: any): any => {
        if (typeof value === 'string') {
            // Remove common script patterns and HTML tags
            // Trimming to prevent whitespace manipulation
            return value
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "[REMOVED_SCRIPT]")
                .replace(/on\w+="[^"]*"/gmi, "[REMOVED_EVENT]")
                .replace(/javascript:[^"]*/gmi, "[REMOVED_JS]")
                .trim();
        } else if (Array.isArray(value)) {
            return value.map(sanitizeValue);
        } else if (value !== null && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
            );
        }
        return value;
    };

    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) (req as any).query = sanitizeValue(req.query);
    if (req.params) (req as any).params = sanitizeValue(req.params);

    next();
};

/**
 * API Rate Limiter
 * Limits requests to 100 per 1 minute per IP (Optimal for Heartbeat + Dashboard loading)
 */
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        message: "Your device is sending requests too quickly. Please wait 1 minute."
    }
});

/**
 * Strict Auth Limiter
 * Limits login/auth attempts to 3 per 30 seconds to prevent brute-force
 */
export const authLimiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 3, // 3 attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many login attempts. Please wait 30 seconds before trying again."
    }
});
