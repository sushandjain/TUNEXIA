import adminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt:", username);

        if (!username || !password) {
            return res.json({ success: false, message: "Username and password are required" });
        }

        const admin = await adminModel.findOne({ username });
        console.log("Admin found:", admin ? "Yes" : "No");

        if (!admin) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        console.log("Comparing password...");
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });

        res.json({ success: true, token });

    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { loginAdmin };