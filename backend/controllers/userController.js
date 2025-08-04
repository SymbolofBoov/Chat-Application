import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    console.log("🔔 Register route hit");

    try {
        console.log("📥 Incoming Request Body:", req.body);

        const { fullName, username, password, confirmPassword, gender } = req.body;

        // Check for missing fields
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            console.log("❌ Missing fields in request body");
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            console.log("❌ Passwords do not match");
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("⚠️ Username already exists:", username);
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔐 Password hashed");

        // Profile photo selection
        const profilePhoto = gender === "male"
            ? `https://avatar.iran.liara.run/public/boy?username=${username}`
            : `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Create user in DB
        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto,
            gender,
        });

        console.log("✅ User registered successfully:", username);

        return res.status(201).json({
            message: "Account created successfully",
            success: true,
        });

    } catch (error) {
        console.error("🔥 Error in register controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        console.log("📥 Login called");
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

return res.status(200).cookie("token", token, {
  maxAge: 1 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'strict'
}).json({
  success: true,
  user: {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    profilePhoto: user.profilePhoto
  }
});

    } catch (error) {
        console.log("❌ Login error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}
export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
    }
}