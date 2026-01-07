import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import adminModel from "./src/models/adminModel.js";
import 'dotenv/config';
import connectdb from "./src/config/mongodb.js";

const createAdmin = async () => {
    try {
        await connectdb();
        const hashedPassword = await bcrypt.hash("q1w2##22", 10);
        const admin = new adminModel({
            username: "sushan",
            password: hashedPassword
        });
        await admin.save();
        console.log("Admin created successfully");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

createAdmin();