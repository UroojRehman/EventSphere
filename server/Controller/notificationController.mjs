import notification from "../Model/notification.mjs";


// ======================================================
// GET MY NOTIFICATIONS
// GET /api/notifications/my
// ======================================================

export const getMyNotifications = async (req, res) => {
    try {

        const notifications = await notification
            .find({
                recipient: req.user.userId
            })
            .populate(
                "event",
                "title category eventType venue date time status"
            )
            .populate(
                "registration",
                "status event participant"
            )
            .sort({
                createdAt: -1
            });


        const unreadCount = await notification.countDocuments({
            recipient: req.user.userId,
            isRead: false
        });


        res.status(200).send({
            count: notifications.length,
            unread: unreadCount,
            notifications
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// GET UNREAD NOTIFICATIONS
// GET /api/notifications/unread
// ======================================================

export const getUnreadNotifications = async (req, res) => {
    try {

        const notifications = await notification
            .find({
                recipient: req.user.userId,
                isRead: false
            })
            .populate(
                "event",
                "title category eventType venue date time status"
            )
            .populate(
                "registration",
                "status event participant"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).send({
            count: notifications.length,
            notifications
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ======================================================

export const getUnreadCount = async (req, res) => {
    try {

        const unread = await notification.countDocuments({
            recipient: req.user.userId,
            isRead: false
        });


        res.status(200).send({
            unread
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// GET NOTIFICATION BY ID
// GET /api/notifications/:id
// ======================================================

export const getNotificationById = async (req, res) => {
    try {

        const foundNotification = await notification
            .findOne({
                _id: req.params.id,
                recipient: req.user.userId
            })
            .populate(
                "event",
                "title category eventType department description venue date time maxParticipants seatsBooked registrationDeadline status"
            )
            .populate(
                "registration",
                "event participant status createdAt cancelledOn cancellationReason"
            );


        if (!foundNotification) {
            return res.status(404).send({
                message: "Notification not found"
            });
        }


        res.status(200).send({
            notification: foundNotification
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// MARK NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ======================================================

export const markAsRead = async (req, res) => {
    try {

        const foundNotification = await notification.findOne({
            _id: req.params.id,
            recipient: req.user.userId
        });


        if (!foundNotification) {
            return res.status(404).send({
                message: "Notification not found"
            });
        }


        if (foundNotification.isRead) {
            return res.status(200).send({
                message: "Notification is already marked as read",
                notification: foundNotification
            });
        }


        foundNotification.isRead = true;
        foundNotification.readAt = new Date();


        await foundNotification.save();


        res.status(200).send({
            message: "Notification marked as read",
            notification: foundNotification
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// ======================================================

export const markAllAsRead = async (req, res) => {
    try {

        const result = await notification.updateMany(
            {
                recipient: req.user.userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );


        res.status(200).send({
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ======================================================

export const deleteNotification = async (req, res) => {
    try {

        const foundNotification = await notification.findOne({
            _id: req.params.id,
            recipient: req.user.userId
        });


        if (!foundNotification) {
            return res.status(404).send({
                message: "Notification not found"
            });
        }


        await notification.findByIdAndDelete(
            req.params.id
        );


        res.status(200).send({
            message: "Notification deleted successfully"
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// DELETE ALL READ NOTIFICATIONS
// DELETE /api/notifications/read
// ======================================================

export const deleteReadNotifications = async (req, res) => {
    try {

        const result = await notification.deleteMany({
            recipient: req.user.userId,
            isRead: true
        });


        res.status(200).send({
            message: "Read notifications deleted successfully",
            deletedCount: result.deletedCount
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};
