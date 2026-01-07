import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import adminModel from "./src/models/adminModel.js";
import 'dotenv/config';

const createSimpleAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        
        // Delete all existing admins
        await adminModel.deleteMany({});
        console.log("Deleted all existing admins");
        
        // Create new admin with simple password
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new adminModel({
            username: "admin",
            password: hashedPassword
        });
        await admin.save();
        console.log("✅ Admin created successfully!");
        console.log("Username: admin");
        console.log("Password: admin123");
        
        // Verify it works
        const testAdmin = await adminModel.findOne({ username: "admin" });
        const isMatch = await bcrypt.compare(password, testAdmin.password);
        console.log("✅ Password verification:", isMatch ? "SUCCESS" : "FAILED");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

createSimpleAdmin();
