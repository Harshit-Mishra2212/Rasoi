/**
 * db.js
 * 
 * @description MongoDB Connection Helper.
 * @usage Called sequentially before starting the Express server.
 * @details Utilizes mongoose.connect wrapper with connection retry or error logging logic.
 */

import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        let uri = process.env.MONGO_URI;

        // If no MONGO_URI is provided, spin up a temporary in-memory MongoDB database
        if (!uri) {
            console.log("⚠️ No MONGO_URI found in environment variables.");
            console.log("⚠️ Booting up a temporary In-Memory MongoDB for local development...");
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 100, // Handle up to 100 concurrent DB operations
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        if (!process.env.MONGO_URI) {
            console.log("👉 NOTE: You are using an In-Memory database. All data will be lost when the server is stopped.");
        }
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        console.error("👉 Please check if your IP is whitelisted in MongoDB Atlas (Network Access).");
        process.exit(1);
    }
};

export default connectDB;
