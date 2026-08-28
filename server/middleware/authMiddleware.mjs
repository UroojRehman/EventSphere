import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = headerToken || req.query.token;
        if (!token) {
            return res.status(401).send({
                message: "Authentication token required"
            });
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({
            message: "Invalid or expired token"
        });
    }
};