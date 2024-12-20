import express from "express"
import appRouter from "./routes/auth.route.js"
import messageRouter from "./routes/message.route.js"
import dotenv from 'dotenv'
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server, io } from "./lib/socket.js"

import path, { join } from "path"

dotenv.config();
const PORT = process.env.PORT
const __dirname = path.resolve();

//body Parsing Middle wear
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true,
}));


app.use("/api/auth", appRouter);
app.use("/api/messages", messageRouter);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path, join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path, join(__dirname, "../frontend", "dist", "index.html"))
    })
}

//made it just to check what the data is 
// app.use("/api/auth/signup", (req, res)=>{
//     console.log(req.body)
//     res.json(req.body)
// });

server.listen(PORT, () => {
    console.log("server is listening at port - " + PORT)
    connectDB();
})
