import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

//  
import { register , login ,logout , getOtherUsers } from "../controllers/userController.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/").get(isAuthenticated,getOtherUsers);

export default router;