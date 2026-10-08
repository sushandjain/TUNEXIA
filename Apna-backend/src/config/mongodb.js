import mongoose from 'mongoose';

let cachedConnection = null;

const connectdb = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Reuse connection if already established
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (cachedConnection) {
            return cachedConnection;
        }

        cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        console.log("✅ MongoDB connected successfully");
        return cachedConnection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

export default connectdb;