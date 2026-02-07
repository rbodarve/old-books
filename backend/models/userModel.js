import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true }, // plaintext for dev/testing
    role: { type: String, enum: ['user', 'manager', 'admin'], default: "user" },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;