import express from "express";
import { signup, login, adminLogin, forgotPassword, resetPassword, adminResetUserPassword, getMyProfile, updateMyProfile, getAllUsersAdmin, updateUserAdmin, updateUserStatusAdmin, deleteUserAdmin } from "../Controller/userController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const userRoutes = express.Router();

userRoutes.post("/register", signup);
userRoutes.post("/login", login);
userRoutes.post("/admin-login", adminLogin);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password/:token", resetPassword);
userRoutes.patch("/admin/:id/password", authMiddleware, roleMiddleware("admin"), adminResetUserPassword);
userRoutes.get("/me", authMiddleware, roleMiddleware("participant", "organizer", "admin"), getMyProfile);
userRoutes.patch("/me", authMiddleware, roleMiddleware("participant", "organizer", "admin"), updateMyProfile);
userRoutes.get("/admin/all", authMiddleware, roleMiddleware("admin"), getAllUsersAdmin);
userRoutes.put("/admin/:id", authMiddleware, roleMiddleware("admin"), updateUserAdmin);
userRoutes.patch("/admin/:id/status", authMiddleware, roleMiddleware("admin"), updateUserStatusAdmin);
userRoutes.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), deleteUserAdmin);

userRoutes.get("/test-auth", authMiddleware, (req, res) => {
    res.send({
        message: "Authentication successful",
        user: req.user
    });
});

export default userRoutes;