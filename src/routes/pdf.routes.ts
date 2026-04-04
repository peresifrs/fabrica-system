// ===============================
// 📄 routes/pdf.routes.ts
// ===============================
import { Router } from "express";
import multer from "multer";
import { gerarPDFController } from "../controllers/pdf.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/gerar-pdf", upload.array("fotos"), gerarPDFController);

export default router;