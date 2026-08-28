import mongoose from 'mongoose';
import 'dotenv/config';

const url = process.env.Db_Connection;
export async function main() {
    try {
        await mongoose.connect(url);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed:");
        console.log(error.message);
    }
}
main();