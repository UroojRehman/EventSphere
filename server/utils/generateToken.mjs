import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export const generateToken = (userId, role) => {

    if (!SECRET_KEY) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    const token = jwt.sign(
        {
            userId,
            role
        },
        SECRET_KEY,
        {
            expiresIn: "1d"
        }
    );

    return token;
};