import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

import prisma from "./lib/prisma";
import { calcularTempoGcode } from "./utils/gcode.parser";
import { calcularCustos } from "./services/calculo.service";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });


// ===============================
app.get("/", (req, res) => {
  res.send("API Fabrica funcionando");
});


// ===============================
// 📦 Upload único (debug)
// ===============================
app.post("/upload-gcode", upload.single("file"), (req, res) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const tempoMin = calcularTempoGcode(filePath);

    res.json({
      tempoMin,
      tempoHoras: tempoMin / 60,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar G-code" });
  }
});


// ===============================
// 🧮 Cálculo manual
// ===============================
app.post("/calcular", async (req, res) => {
  try {
    const {
      tempo,
      custoFerramenta,
      custoEnergia,
      custoDepreciacao,
      custoManutencao,
      material,
      horasTrabalho,
      custoHora,
    } = req.body;

    const resultado = calcularCustos({
      tempo: Number(tempo),
      custoFerramenta: Number(custoFerramenta),
      custoEnergia: Number(custoEnergia),
      custoDepreciacao: Number(custoDepreciacao),
      custoManutencao: Number(custoManutencao),
      material: Number(material),
      horasTrabalho: Number(horasTrabalho),
      custoHora: Number(custoHora),
    });

    const calculo = await prisma.calculo.create({
      data: {
        tempo: Number(tempo),
        custoFerramenta: Number(custoFerramenta),
        custoEnergia: Number(custoEnergia),
        custoDepreciacao: Number(custoDepreciacao),
        custoManutencao: Number(custoManutencao),
        material: Number(material),
        horasTrabalho: Number(horasTrabalho),
        custoHora: Number(custoHora),
        ...resultado,
      },
    });

    res.json(calculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no cálculo" });
  }
});


// ===============================
// 🤖 Cálculo com múltiplos G-code
// ===============================
app.post("/calcular-com-gcode", upload.array("files"), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Arquivos não enviados" });
    }

    let { quantidades } = req.body;

    if (!quantidades) {
      return res.status(400).json({ error: "Quantidades não informadas" });
    }

    if (!Array.isArray(quantidades)) {
      quantidades = [quantidades];
    }

    if (quantidades.length !== files.length) {
      return res.status(400).json({
        error: "Número de arquivos e quantidades não coincide",
      });
    }

    let tempoTotalMin = 0;

    const detalhes: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const quantidade = Number(quantidades[i]);

      const tempoMin = calcularTempoGcode(file.path);

      const subtotal = tempoMin * quantidade;

      tempoTotalMin += subtotal;

      detalhes.push({
        arquivo: file.originalname,
        tempoMin,
        quantidade,
        subtotalMin: subtotal,
      });
    }

    const tempoHoras = tempoTotalMin / 60;

    const {
      custoFerramenta,
      custoEnergia,
      custoDepreciacao,
      custoManutencao,
      material,
      horasTrabalho,
      custoHora,
    } = req.body;

    const resultado = calcularCustos({
      tempo: tempoHoras,
      custoFerramenta: Number(custoFerramenta),
      custoEnergia: Number(custoEnergia),
      custoDepreciacao: Number(custoDepreciacao),
      custoManutencao: Number(custoManutencao),
      material: Number(material),
      horasTrabalho: Number(horasTrabalho),
      custoHora: Number(custoHora),
    });

    const calculo = await prisma.calculo.create({
      data: {
        tempo: tempoHoras,
        custoFerramenta: Number(custoFerramenta),
        custoEnergia: Number(custoEnergia),
        custoDepreciacao: Number(custoDepreciacao),
        custoManutencao: Number(custoManutencao),
        material: Number(material),
        horasTrabalho: Number(horasTrabalho),
        custoHora: Number(custoHora),
        ...resultado,
      },
    });

    res.json({
      ...calculo,
      tempoTotalMin,
      detalhes,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no cálculo com múltiplos G-code" });
  }
});


// ===============================
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});