import jwt from 'jsonwebtoken';

export const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid token" });
            }
            req.user = decoded;
            next();
        });
        
    } 
    catch(err) {
        console.log(err)
        return res.sendStatus(403);
    }
};