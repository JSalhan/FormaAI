import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token from the Authorization header.
 * Attaches user payload to req.user on success.
 */
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden: Invalid token." });
            }
            req.user = user; // { id: '...', role: '...', iat: ..., exp: ... }
            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized: No token provided." });
    }
};

/**
 * Middleware factory to authorize users based on roles.
 * Must be used after authenticateJWT.
 * @param {...string} allowedRoles - A list of roles that are allowed to access the route.
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have the required role to access this resource." });
        }
        next();
    };
};
