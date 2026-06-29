require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xssClean = require("xss-clean");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");
const { scheduleJobSync, syncGovernmentJobs } = require("./src/services/jobSync.service");

const authRoutes = require("./src/routes/auth.routes");
const memberRoutes = require("./src/routes/member.routes");
const wingRoutes = require("./src/routes/wing.routes");
const leaderRoutes = require("./src/routes/leader.routes");
const jobRoutes = require("./src/routes/job.routes");
const communityRoutes = require("./src/routes/community.routes");
const socialRoutes = require("./src/routes/social.routes");
const documentRoutes = require("./src/routes/document.routes");
const announcementRoutes = require("./src/routes/announcement.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const adminRoutes = require("./src/routes/admin.routes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000" },
});
app.set("io", io);

// ---- Security & core middleware ----
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(xssClean());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", apiLimiter);

// Serve uploaded files (profile photos, documents, attachments)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Routes ----
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/wings", wingRoutes);
app.use("/api/leaders", leaderRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

// ---- Socket.IO: realtime chat ----
io.on("connection", (socket) => {
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit("typing", { userId });
  });
});

// ---- Boot ----
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`AIAA backend running on http://localhost:${PORT}`);
  });

  scheduleJobSync();

  // Run one sync at boot so the Government Jobs page isn't empty on a fresh install.
  syncGovernmentJobs().catch((err) => console.error("Initial job sync failed:", err.message));
});

module.exports = { app, server, io };
