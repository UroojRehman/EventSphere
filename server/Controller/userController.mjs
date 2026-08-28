import user from "../Model/user.mjs";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.mjs";
import speakeasy from "speakeasy";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/mailer.mjs";


//http://localhost:3000/api/auth/register
export const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            username,
            contactNumber,
            department,
            enrollmentNumber,
            password
        } = req.body;
        if (!name || !email || !username || !contactNumber || !department || !enrollmentNumber || !password) {
            return res.status(400).send({
                message: "All fields are required"
            });
        }
        const emailExist = await user.findOne({ email });

        if (emailExist) {
            return res.status(409).send({
                message: "Email already exists"
            });
        }
        const usernameExist = await user.findOne({ username });
        if (usernameExist) {
            return res.status(409).send({
                message: "Username already exists"
            });
        }
        const enrollmentExist = await user.findOne({ enrollmentNumber });
        if (enrollmentExist) {
            return res.status(409).send({ message: "Enrollment number already exists" });
        }
        const newUser = new user({
            name,
            email,
            username,
            contactNumber,
            department,
            enrollmentNumber,
            password: await bcrypt.hash(password, 10),
            role: "participant"
        });
        await newUser.save();

        res.status(201).send({
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

//http://localhost:3000/api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: "Email and password are required"
            });
        }
        const loginUser = await user.findOne({ email });

        if (!loginUser) {
            return res.status(404).send({
                message: "Email not found"
            });
        }
        if (loginUser.status === "suspended") {
            return res.status(403).send({ message: "This account is suspended. Contact an administrator." });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            loginUser.password
        );
        if (!passwordMatch) {
            return res.status(401).send({
                message: "Incorrect password"
            });
        }
        const token = generateToken(
            loginUser._id,
            loginUser.role
        );
        res.status(200).send({
            message: "Login successful",
            token,
            user: {
                id: loginUser._id,
                name: loginUser.name,
                email: loginUser.email,
                username: loginUser.username,
                role: loginUser.role
            }
        });
    } catch (error) {
        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const profile = await user.findById(req.user.userId)
            .select("name email username contactNumber department enrollmentNumber role preferences");

        if (!profile) {
            return res.status(404).send({ message: "Profile not found" });
        }

        res.status(200).send({ user: profile });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const allowedFields = ["name", "contactNumber", "department"];
        const updates = Object.fromEntries(
            allowedFields
                .filter((field) => typeof req.body[field] === "string")
                .map((field) => [field, req.body[field].trim()])
        );

        if (req.body.preferences && typeof req.body.preferences === "object") {
            for (const field of ["eventUpdates", "registrationReminders", "announcements"]) {
                if (typeof req.body.preferences[field] === "boolean") updates[`preferences.${field}`] = req.body.preferences[field];
            }
        }

        if (["name", "contactNumber", "department"].some((field) => field in updates && !updates[field])) {
            return res.status(400).send({ message: "Profile fields cannot be empty" });
        }

        const profile = await user.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("name email username contactNumber department enrollmentNumber role preferences");

        res.status(200).send({ message: "Profile updated successfully", user: profile });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const getAllUsersAdmin = async (req, res) => {
    try {
        const users = await user.find()
            .select("name email username role status department contactNumber enrollmentNumber createdAt")
            .sort({ createdAt: -1 });

        res.status(200).send({ count: users.length, users });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password, twoFactorCode } = req.body;
        if (!email || !password) return res.status(400).send({ message: "Admin email and password are required" });

        const loginUser = await user.findOne({ email, role: "admin" }).select("+twoFactorSecret");
        if (!loginUser) return res.status(401).send({ message: "Invalid administrator credentials" });
        if (loginUser.status === "suspended") return res.status(403).send({ message: "This administrator account is suspended" });

        const passwordMatch = await bcrypt.compare(password, loginUser.password);
        if (!passwordMatch) return res.status(401).send({ message: "Invalid administrator credentials" });

        if (!loginUser.twoFactorSecret) {
            loginUser.twoFactorSecret = speakeasy.generateSecret({ length: 20 }).base32;
            await loginUser.save();
            return res.status(200).send({
                message: "Set up two-factor authentication in your authenticator app",
                requiresTwoFactor: true,
                requiresSetup: true,
                twoFactorSecret: loginUser.twoFactorSecret
            });
        }

        if (!/^\d{6}$/.test(String(twoFactorCode || ""))) {
            return res.status(200).send({
                message: "Enter the 6-digit authenticator code",
                requiresTwoFactor: true
            });
        }

        const verified = speakeasy.totp.verify({
            secret: loginUser.twoFactorSecret,
            encoding: "base32",
            token: String(twoFactorCode),
            window: 1
        });
        if (!verified) return res.status(401).send({ message: "Invalid or expired authenticator code" });

        if (!loginUser.twoFactorEnabled) {
            loginUser.twoFactorEnabled = true;
            await loginUser.save();
        }

        const token = generateToken(loginUser._id, loginUser.role);
        res.status(200).send({
            message: "Administrator login successful",
            token,
            user: {
                id: loginUser._id,
                name: loginUser.name,
                email: loginUser.email,
                username: loginUser.username,
                role: loginUser.role
            }
        });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const updateUserAdmin = async (req, res) => {
    try {
        const allowedFields = ["name", "username", "email", "contactNumber", "department", "enrollmentNumber", "role"];
        const updates = Object.fromEntries(allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field]]));
        if (req.params.id === req.user.userId && updates.role && updates.role !== "admin") return res.status(400).send({ message: "You cannot remove your own admin role" });
        const updated = await user.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).select("name email username role status department contactNumber enrollmentNumber createdAt");
        if (!updated) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ message: "User updated successfully", user: updated });
    } catch (error) {
        if (error.code === 11000) return res.status(409).send({ message: "Email, username, or enrollment number already exists" });
        res.status(500).send({ message: error.message });
    }
};

export const updateUserStatusAdmin = async (req, res) => {
    try {
        if (req.params.id === req.user.userId) return res.status(400).send({ message: "You cannot suspend your own admin account" });
        if (!["active", "suspended"].includes(req.body.status)) return res.status(400).send({ message: "Invalid user status" });
        const updated = await user.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select("name email username role status createdAt");
        if (!updated) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ message: `User ${req.body.status} successfully`, user: updated });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const deleteUserAdmin = async (req, res) => {
    try {
        if (req.params.id === req.user.userId) return res.status(400).send({ message: "You cannot delete your own admin account" });
        const deleted = await user.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const response = { message: "If an account exists with this email address, reset instructions have been sent." };
        if (!email) return res.status(400).send({ message: "Email is required" });
        const foundUser = await user.findOne({ email });
        if (!foundUser) return res.status(200).send(response);

        const resetToken = crypto.randomBytes(32).toString("hex");
        foundUser.passwordResetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        foundUser.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
        await foundUser.save();
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
        await sendPasswordResetEmail({ name: foundUser.name, email: foundUser.email, resetUrl });
        return res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const tokenHash = crypto.createHash("sha256").update(String(req.params.token || "")).digest("hex");
        const password = String(req.body.password || "");
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ message: "Password must be at least 8 characters and include a letter and a number." });
        }
        const foundUser = await user.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpires: { $gt: new Date() } }).select("+passwordResetTokenHash +passwordResetExpires");
        if (!foundUser) return res.status(400).send({ message: "Reset link is invalid or expired." });
        foundUser.password = await bcrypt.hash(password, 10);
        foundUser.passwordResetTokenHash = "";
        foundUser.passwordResetExpires = null;
        await foundUser.save();
        res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const adminResetUserPassword = async (req, res) => {
    try {
        const password = String(req.body.password || "");
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ message: "Password must be at least 8 characters and include a letter and a number." });
        }
        const foundUser = await user.findById(req.params.id);
        if (!foundUser) return res.status(404).send({ message: "User not found" });
        foundUser.password = await bcrypt.hash(password, 10);
        foundUser.passwordResetTokenHash = "";
        foundUser.passwordResetExpires = null;
        await foundUser.save();
        res.status(200).send({ message: "User password reset successfully" });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};