import jwt from 'jsonwebtoken';

export const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(403).json({ error: 'No refresh token, authorization denied' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN,
            { expiresIn: '24h' }
        );

        res.json({ accessToken: newAccessToken });
    });
};
