import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_FALLBACK_SECRET = "insecure-test-secret";
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
    return jwt.sign({ id, role }, secret, { expiresIn: "30d" });
};
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) return res.status(409).json({ message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password.trim(), salt);

        const newUser = new User({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role || "user", // default role is "user"
        });
        await newUser.save();
        const token = generateToken(newUser._id, newUser.role);
        return res.status(201).json({
            message: `User registered successfully as ${newUser.role}`,
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: "Registration failed" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        
        const isPasswordValid = user && await bcrypt.compare(password.trim(), user.password);
        
        if (!user || !isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user._id, user.role);
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: "Login failed" });
    }
};