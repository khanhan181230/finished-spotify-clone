import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'node:path';

import { connectDB } from './lib/db.js';
import { clerkMiddleware} from '@clerk/express'

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import songRoutes from './routes/song.route.js';
import albumRoutes from './routes/album.route.js';
import statsRoutes from './routes/stat.route.js';
import { createServer } from 'node:http';
import { initializeSocket } from './lib/socket.js';
import cron from 'node-cron';
// import { create } from 'zustand';
// Load environment variables from .env file
dotenv.config();

const __dirname = path.resolve(); 
const app = express();
const PORT = process.env.PORT || 5001;

//Initialize Socket.io
const httpServer = createServer(app);
initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: "http://localhost:3000", //allow requests from this origin
  credentials: true, //allow cookies and auth headers
})); //to allow cross-origin requests
app.use(express.json()); //to parse JSON request bodies (req.body)
app.use(clerkMiddleware()); //to add auth to req obj => e.g. req.auth 
app.use(fileUpload({
  useTempFiles: true,//use temporary files instead of memory for file uploads
  tempFileDir: path.join(  //specify temp file directory
    __dirname,
    '../tmp'
  ),
  createParentPath: true, //create parent directory if it doesn't exist
  limits: { fileSize: 10 * 1024 * 1024}, //max file size 10MB
})); //to handle file uploads

//cron jobs
const tempDir = path.join(process.cwd(), "tmp")
cron.schedule("0 * * * *", () => {
  if(fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if(err) {
        console.error("Error reading temp directory:", err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {});
      }
  });
}
})

//delete temp files older than 1 hour every day at midnight

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statsRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  })
}

//Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message});
})


// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});

//todo: socket.io implementation for real-time features like chat, notifications, etc.