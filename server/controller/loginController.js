import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { connection } from "../config/connection.js";

export const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        connection.query("SELECT * FROM person WHERE USERNAME = ?", [username], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
              }
            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
              }
            const user = results[0];
            const userData = {
                username: user.USERNAME,
                role: user.ROLE,
                userId: user.PERSON_ID
            }
            bcrypt.compare(password, user.PASSWORD, (err, isMatch) => {
                if (err) return res.status(500).json({ error: "Password verification failed" });
                if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
                const token = jwt.sign({ id: user.ID, role: user.ROLE }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
                return res.cookie("access_token", token).status(200).json({ message: "Login successful", userData});
                
                const accessToken = jwt.sign(
                    { userId: user.PERSON_ID, role: user.ROLE },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '6h' } 
                  );
            
                  const refreshToken = jwt.sign(
                    { userId: user.PERSON_ID, role: user.ROLE },
                    process.env.REFRESH_TOKEN,
                    { expiresIn: '24h' }
                  );
            
                  res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Strict',
                    maxAge: 24 * 60 * 60 * 1000, 
                  });

                return res.status(200).json({
                    message: "Login successful",
                    userData,
                    accessToken,
                    refreshToken
                });
            });
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Error logging in" });
    }
};
