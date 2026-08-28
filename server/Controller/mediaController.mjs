import media from "../Model/media.mjs";
import event from "../Model/event.mjs";
import fs from "fs";
import path from "path";


// ======================================================
// ORGANIZER - UPLOAD MEDIA
// POST /api/media/upload
// ======================================================

export const uploadMedia = async (req, res) => {
    try {

        const {
            eventId,
            title,
            description
        } = req.body;

        if (!eventId || !title) {
            return res.status(400).send({
                message: "Event ID and title are required"
            });
        }

        if (!req.file) {
            return res.status(400).send({
                message: "Media file is required"
            });
        }

        const foundEvent = req.user.role === "admin"
            ? await event.findById(eventId)
            : await event.findOne({ _id: eventId, organizer: req.user.userId });

        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found or you are not the organizer"
            });
        }

        const mediaType = req.file.mimetype.startsWith("image/")
            ? "image"
            : "video";

        const fileUrl =
            `/uploads/gallery/${req.file.filename}`;

        const newMedia = new media({
            event: eventId,
            uploadedBy: req.user.userId,
            title,
            description: description || "",
            mediaType,
            fileUrl,
            originalName: req.file.originalname,
            category: foundEvent.category,
            eventType: foundEvent.eventType,
            department: foundEvent.department,
            status: "pending"
        });

        await newMedia.save();

        if (mediaType === "image" && !foundEvent.banner) {
            foundEvent.banner = fileUrl;
            await foundEvent.save();
        }

        const populatedMedia = await media
            .findById(newMedia._id)
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name email username"
            );

        res.status(201).send({
            message: "Media uploaded successfully and sent for approval",
            media: populatedMedia
        });

    } catch (error) {

        if (req.file) {
            const filePath = path.join(
                "uploads",
                "gallery",
                req.file.filename
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PUBLIC - GET APPROVED MEDIA
// GET /api/media
// ======================================================

export const getMedia = async (req, res) => {
    try {

        const {
            search,
            eventId,
            category,
            eventType,
            department,
            mediaType
        } = req.query;

        const filter = {
            status: "approved"
        };

        if (eventId) {
            filter.event = eventId;
        }

        if (category) {
            filter.category = category;
        }

        if (eventType) {
            filter.eventType = eventType;
        }

        if (department) {
            filter.department = department;
        }

        if (mediaType) {
            filter.mediaType = mediaType;
        }

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    eventType: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    department: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const mediaList = await media
            .find(filter)
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name username"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PUBLIC - GET MEDIA BY EVENT
// GET /api/media/event/:eventId
// ======================================================

export const getMediaByEvent = async (req, res) => {
    try {

        const mediaList = await media
            .find({
                event: req.params.eventId,
                status: "approved"
            })
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name username"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - MY MEDIA
// GET /api/media/organizer/my
// ======================================================

export const getMyMedia = async (req, res) => {
    try {

        const mediaList = await media
            .find({
                uploadedBy: req.user.userId
            })
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - DELETE OWN MEDIA
// DELETE /api/media/:id
// ======================================================

export const deleteMedia = async (req, res) => {
    try {

        const foundMedia = await media.findOne({
            _id: req.params.id,
            uploadedBy: req.user.userId
        });

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        foundMedia.status = "deletion_requested";
        foundMedia.adminComment = "Deletion requested by organizer";
        await foundMedia.save();

        res.status(200).send({
            message: "Deletion request sent to admin"
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET ALL MEDIA
// GET /api/media/admin/all
// ======================================================

export const getAllMediaAdmin = async (req, res) => {
    try {

        const mediaList = await media
            .find()
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name email username"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET PENDING MEDIA
// GET /api/media/admin/pending
// ======================================================

export const getPendingMedia = async (req, res) => {
    try {

        const mediaList = await media
            .find({
                status: {
                    $in: ["pending", "deletion_requested"]
                }
            })
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name email username"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - APPROVE MEDIA
// PUT /api/media/:id/approve
// ======================================================

export const approveMedia = async (req, res) => {
    try {

        const foundMedia = await media.findById(
            req.params.id
        );

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        foundMedia.status = "approved";
        foundMedia.adminComment = "";

        await foundMedia.save();

        res.status(200).send({
            message: "Media approved successfully",
            media: foundMedia
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - REJECT MEDIA
// PUT /api/media/:id/reject
// ======================================================

export const rejectMedia = async (req, res) => {
    try {

        const { comment } = req.body;

        const foundMedia = await media.findById(
            req.params.id
        );

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        foundMedia.status = "rejected";
        foundMedia.adminComment = comment || "";

        await foundMedia.save();

        res.status(200).send({
            message: "Media rejected successfully",
            media: foundMedia
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - SAVE MEDIA
// POST /api/media/:id/save
// ======================================================

export const saveMedia = async (req, res) => {
    try {

        const foundMedia = await media.findOne({
            _id: req.params.id,
            status: "approved"
        });

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        const userId = req.user.userId;

        if (foundMedia.savedBy.includes(userId)) {
            return res.status(409).send({
                message: "Media is already saved"
            });
        }

        foundMedia.savedBy.push(userId);

        await foundMedia.save();

        res.status(200).send({
            message: "Media saved successfully",
            media: foundMedia
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - REMOVE SAVED MEDIA
// DELETE /api/media/:id/save
// ======================================================

export const removeSavedMedia = async (req, res) => {
    try {

        const foundMedia = await media.findOne({
            _id: req.params.id,
            status: "approved"
        });

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        foundMedia.savedBy =
            foundMedia.savedBy.filter(
                id =>
                    id.toString() !==
                    req.user.userId.toString()
            );

        await foundMedia.save();

        res.status(200).send({
            message: "Media removed from saved list"
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - MY SAVED MEDIA
// GET /api/media/saved/my
// ======================================================

export const getMySavedMedia = async (req, res) => {
    try {

        const mediaList = await media
            .find({
                savedBy: req.user.userId,
                status: "approved"
            })
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .populate(
                "uploadedBy",
                "name username"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).send({
            count: mediaList.length,
            media: mediaList
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - DELETE MEDIA
// DELETE /api/media/admin/:id
// ======================================================

export const adminDeleteMedia = async (req, res) => {
    try {

        const foundMedia = await media.findById(
            req.params.id
        );

        if (!foundMedia) {
            return res.status(404).send({
                message: "Media not found"
            });
        }

        const filePath = path.join(
            "uploads",
            "gallery",
            path.basename(foundMedia.fileUrl)
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await media.findByIdAndDelete(
            req.params.id
        );

        res.status(200).send({
            message: "Media deleted successfully by admin"
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};