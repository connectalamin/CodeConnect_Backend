import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./DB/db.config.js"; // Import existing Prisma Client
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import deleteUserRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import savedPostRoutes from "./routes/savedPostRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { setupChatSocket } from "./utils/chatSocket.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT;

const allowedOrigins = [process.env.FRONTEND_LOCAL];
app.use(cors({
  origin: true, // Allow all origins during development
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Setup Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_LOCAL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pass prisma to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Setup chat socket handlers
setupChatSocket(io, prisma);

app.use("/auth", authRoutes);
app.use("/api", postRoutes);
app.use("/api/post", commentRoutes);
app.use("/api/", voteRoutes);
app.use('/api', profileRoutes);
app.use('/admin/users', deleteUserRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api', savedPostRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Test database connection
    res.json({ status: "healthy", message: "Database connection successful" });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ status: "unhealthy", message: "Database connection failed" });
  }
});

app.get("/", (req, res) => res.send("Hello World!"));

const server = httpServer.listen(port, () => console.log(`Server running on port ${port}!`));
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    io.close(() => {
      console.log('Socket.IO server closed');
      prisma.$disconnect().then(() => {
        console.log('Prisma Client disconnected');
        process.exit(0);
      });
    });
  });
});
