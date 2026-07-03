import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes); // ← this means full path is /ai/get-review
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});
export default app;