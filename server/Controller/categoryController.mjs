import category from "../Model/category.mjs";

const canManage = (item, req) => req.user.role === "admin" || item.createdBy.toString() === req.user.userId.toString();

export const getCategories = async (req, res) => {
    try {
        const filter = { deletionRequested: false };
        if (req.query.kind === "category") {
            filter.$or = [{ kind: "category" }, { kind: { $exists: false } }];
        } else if (req.query.kind) {
            filter.kind = req.query.kind;
        }
        const categories = await category.find(filter).sort({ name: 1 });
        res.status(200).send({ count: categories.length, categories });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const getCategoriesAdmin = async (req, res) => {
    try {
        const filter = req.query.kind === "category"
            ? { $or: [{ kind: "category" }, { kind: { $exists: false } }] }
            : req.query.kind
                ? { kind: req.query.kind }
                : {};
        const categories = await category.find(filter).sort({ name: 1 });
        res.status(200).send({ count: categories.length, categories });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        if (!name) return res.status(400).send({ message: "Category name is required" });
        const kind = ["category", "department", "eventType"].includes(req.body.kind)
            ? req.body.kind
            : "category";
        const created = await category.create({ name, kind, createdBy: req.user.userId });
        res.status(201).send({ message: "Category created successfully", category: created });
    } catch (error) {
        if (error.code === 11000) return res.status(409).send({ message: "Category already exists" });
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const item = await category.findById(req.params.id);
        if (!item) return res.status(404).send({ message: "Category not found" });
        if (!canManage(item, req)) return res.status(403).send({ message: "You can only edit your own categories" });
        item.name = req.body.name?.trim() || item.name;
        item.deletionRequested = false;
        await item.save();
        res.status(200).send({ message: "Category updated successfully", category: item });
    } catch (error) {
        if (error.code === 11000) return res.status(409).send({ message: "Category already exists" });
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const requestCategoryDeletion = async (req, res) => {
    try {
        const item = await category.findById(req.params.id);
        if (!item) return res.status(404).send({ message: "Category not found" });
        if (!canManage(item, req)) return res.status(403).send({ message: "You can only delete your own categories" });
        item.deletionRequested = true;
        await item.save();
        res.status(200).send({ message: "Category deletion sent for admin approval", category: item });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const adminDeleteCategory = async (req, res) => {
    try {
        const deleted = await category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).send({ message: "Category not found" });
        res.status(200).send({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};
