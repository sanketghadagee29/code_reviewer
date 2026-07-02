import express from "express";
import aiController from "../controllers/ai.controller.js"; // default import

const router = express.Router();

router.post("/get-review", aiController.getReview); // access via object

export default router;