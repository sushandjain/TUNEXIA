import adminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginId = (username || email || "").trim();

        if (!loginId || !password) {
            return res.status(400).json({ success: false, message: "Username/email and password are required" });
        }

        const admin = await adminModel.findOne({
            $or: [
                { username: loginId },
                { email: loginId.toLowerCase() }
            ]
        });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "12h" });

        res.json({ success: true, token, admin: { username: admin.username } });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { loginAdmin };
