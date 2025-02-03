import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { connection } from "../config/connection.js";

export const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        connection.query("SELECT * FROM person WHERE USERNAME = ?", [username], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (results.length === 0) return res.status(404).json({ error: "User not found" });
            const user = results[0];
            const userData = {
                username: user.USERNAME,
                role: user.ROLE,
                id: user.PERSON_ID
            }
            bcrypt.compare(password, user.PASSWORD, (err, isMatch) => {
                if (err) return res.status(500).json({ error: "Password verification failed" });
                if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
                const token = jwt.sign({ id: user.ID, role: user.ROLE }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
                return res.cookie("access_token", token).status(200).json({ message: "Login successful", userData});
            });
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Error logging in" });
    }
};
