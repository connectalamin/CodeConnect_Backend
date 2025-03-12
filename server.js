import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import deleteUserRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Update CORS for production
const allowedOrigins = [process.env.FRONTEND_URL || "https://victorious-glacier-06790f710.6.azurestaticapps.net"];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/api", postRoutes);
app.use("/api/post", commentRoutes);
app.use("/api/", voteRoutes);
app.use('/api', profileRoutes);
app.use('/admin/users', deleteUserRoutes);
app.use('/admin/categories', categoryRoutes);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Server running on port ${port}!`));