import mongoose from "mongoose";
import adminModel from "./src/models/adminModel.js";
import 'dotenv/config';

const listAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        console.log("Database:", mongoose.connection.name);
        
        const admins = await adminModel.find({});
        console.log(`Found ${admins.length} admin(s):`);
        
        admins.forEach((admin, index) => {
            console.log(`\n${index + 1}. Username: ${admin.username}`);
            console.log(`   ID: ${admin._id}`);
            console.log(`   Password hash: ${admin.password.substring(0, 20)}...`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

listAdmins();
