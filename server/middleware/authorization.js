import jwt from 'jsonwebtoken'

export const authorization = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log("Authorization header received:", req.headers['authorization']);
    console.log("Token received on the server:", token);
    
    if (!token) {
        return res.status(403).json({ error: 'No token, authorization denied' });
    }

    try {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            
            if (err) {

                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token has expired' });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({ error: 'Invalid token' });
                }
                return res.status(500).json({ error: 'Failed to verify token' });
            }
            req.user = user; 
            return next();
        });
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ error: 'Token verification failed' });
    }
};
