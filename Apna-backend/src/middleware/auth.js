import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null;
        const token = req.headers.token || headerToken;

        if (!token) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid Token" });
    }
};

export default authAdmin;