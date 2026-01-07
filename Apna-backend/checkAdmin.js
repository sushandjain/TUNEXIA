import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import adminModel from "./src/models/adminModel.js";
import 'dotenv/config';

const checkAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        
        const admin = await adminModel.findOne({ username: "sushan" });
        
        if (admin) {
            console.log("✅ Admin found:", admin.username);
            console.log("Password hash:", admin.password);
            
            // Test password comparison
            const testPassword = "q1w2##22";
            const isMatch = await bcrypt.compare(testPassword, admin.password);
            console.log(`Password '${testPassword}' matches:`, isMatch);
            
            // Try all common passwords
            const passwords = ["q1w2##22", "admin", "password", "123456"];
            for (const pwd of passwords) {
                const match = await bcrypt.compare(pwd, admin.password);
                if (match) {
                    console.log(`✅ CORRECT PASSWORD FOUND: '${pwd}'`);
                }
            }
        } else {
            console.log("❌ No admin found with username 'sushan'");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

checkAdmin();
