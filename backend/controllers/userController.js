import User from "../models/userModel.js";
// GET ALL USERS (Admin Only)
// The function must be defined and EXPORTED using 'export const'
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users. We explicitly select fields, keeping the password for testing.
        const users = await User.find().select('-__v');
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch users" });
    }
};