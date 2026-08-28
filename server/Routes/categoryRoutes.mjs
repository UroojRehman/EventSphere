import express from "express";
import {
    getCategories,
    getCategoriesAdmin,
    createCategory,
    updateCategory,
    requestCategoryDeletion,
    adminDeleteCategory
} from "../Controller/categoryController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.get("/admin/all", authMiddleware, roleMiddleware("admin"), getCategoriesAdmin);
categoryRoutes.post("/", authMiddleware, roleMiddleware("organizer", "admin"), createCategory);
categoryRoutes.put("/:id", authMiddleware, roleMiddleware("organizer", "admin"), updateCategory);
categoryRoutes.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), adminDeleteCategory);
categoryRoutes.delete("/:id", authMiddleware, roleMiddleware("organizer", "admin"), requestCategoryDeletion);

export default categoryRoutes;
