import mongoose from 'mongoose'

const connectdb = async () => {
    try {
        // Check if MongoDB URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB (options removed as they're deprecated in Mongoose 6+)
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log("✅ MongoDB connected successfully");
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
}

export default connectdb;