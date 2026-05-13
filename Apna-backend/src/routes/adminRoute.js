import express from "express";
import { loginAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/", loginAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/signin", loginAdmin);

export default adminRouter;
