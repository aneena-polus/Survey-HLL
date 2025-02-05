import express from "express";
import { userLogin } from "../controller/loginController.js";
import { authorization } from "../middleware/authorization.js";

const router = express();

router.post("/login", userLogin);           
router.get("/logout", (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out.." });
});

export default router;