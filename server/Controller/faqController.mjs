import faq from "../Model/faq.mjs";

export const getFaqs = async (req, res) => {
    try {
        const filter = req.query.status === "all" ? {} : { status: "published" };
        const faqs = await faq.find(filter).sort({ sortOrder: 1, createdAt: 1 });
        res.status(200).send({ count: faqs.length, faqs });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const createFaq = async (req, res) => {
    try {
        const { question, answer, category, status, sortOrder } = req.body;
        if (!question || !answer) return res.status(400).send({ message: "Question and answer are required" });
        const created = await faq.create({ question, answer, category, status, sortOrder, createdBy: req.user.userId });
        res.status(201).send({ message: "FAQ created successfully", faq: created });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const updateFaq = async (req, res) => {
    try {
        const updated = await faq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).send({ message: "FAQ not found" });
        res.status(200).send({ message: "FAQ updated successfully", faq: updated });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const deleteFaq = async (req, res) => {
    try {
        const deleted = await faq.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).send({ message: "FAQ not found" });
        res.status(200).send({ message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
