import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import adminModel from "./src/models/adminModel.js";
import 'dotenv/config';

const resetAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            console.error("❌ MONGODB_URI not found in environment variables");
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
        
        // Delete existing admin
        await adminModel.deleteOne({ username: "sushan" });
        console.log("Deleted existing admin");
        
        // Create new admin with password: q1w2##22
        const hashedPassword = await bcrypt.hash("q1w2##22", 10);
        const admin = new adminModel({
            username: "sushan",
            password: hashedPassword
        });
        await admin.save();
        console.log("✅ Admin created successfully with password: q1w2##22");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

resetAdmin();
