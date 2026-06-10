import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import{ connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors({
  
    origin: [
  "https://meetnestfrontend-mfxw.onrender.com",
  "https://meetnestfrontend-149v.onrender.com",
  "https://meetnestfrontend-b2hc.onrender.com"
],

  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "40kb" }));

app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {

        console.log("Starting server...");

        const connectionDb = await mongoose.connect(process.env.MONGO_URL);

        console.log(`MONGO Connected DB Host : ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

    }
};

start();