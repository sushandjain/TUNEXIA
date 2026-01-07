import express from 'express';
import adminModel from '../models/adminModel.js';

const debugRouter = express.Router();

// Debug endpoint to check admin exists
debugRouter.get('/check-admin', async (req, res) => {
    try {
        const admins = await adminModel.find({});
        res.json({
            success: true,
            count: admins.length,
            admins: admins.map(a => ({ username: a.username, id: a._id }))
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

export default debugRouter;
