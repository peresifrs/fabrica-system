import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";

// imports para parte de upload de gcode
import multer from "multer";
import fs from "fs";
const round = (value: number) => Number(value.toFixed(2));

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
// rota
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

// funcao
function calcularTempoGcode(path: string) {
  const linhas = fs.readFileSync(path, "utf-8").split("\n");

  let x = 0;
  let y = 0;
  let feedRate = 1000; // mm/min padrão
  let distanciaTotal = 0;

  for (const linha of linhas) {
    // Atualiza feed rate
    const matchF = linha.match(/F(\d+\.?\d*)/);
    if (matchF) {
      feedRate = parseFloat(matchF[1]);
    }

    // Movimentos lineares
    if (linha.startsWith("G0") || linha.startsWith("G1")) {
      let novoX = x;
      let novoY = y;

      const matchX = linha.match(/X(-?\d+\.?\d*)/);
      const matchY = linha.match(/Y(-?\d+\.?\d*)/);

      if (matchX) novoX = parseFloat(matchX[1]);
      if (matchY) novoY = parseFloat(matchY[1]);

      const dx = novoX - x;
      const dy = novoY - y;

      const dist = Math.sqrt(dx * dx + dy * dy);
      distanciaTotal += dist;

      x = novoX;
      y = novoY;
    }
  }

  const tempoMin = distanciaTotal / feedRate;
  return tempoMin;
}



app.get("/", (req, res) => {
  res.send("API Fabrica funcionando");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

app.post("/calcular", async (req, res) => {
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

  const chm = round(
    custoFerramenta + custoEnergia + custoDepreciacao + custoManutencao,
  );

  const custoMaquina = round(tempo * chm);
  const custoMao = round(horasTrabalho * custoHora);
  const total = round(material + custoMaquina + custoMao);

  const calculo = await prisma.calculo.create({
    data: {
      tempo,
      custoFerramenta,
      custoEnergia,
      custoDepreciacao,
      custoManutencao,
      material,
      horasTrabalho,
      custoHora,
      chm,
      custoMaquina,
      custoMao,
      total,
    },
  });

  res.json(calculo);
});

app.post("/calcular-com-gcode", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    // 1️⃣ calcula tempo
    const tempoMin = calcularTempoGcode(filePath);
    const tempoHoras = tempoMin / 60;

    // 2️⃣ pega parâmetros do body
    const {
      custoFerramenta,
      custoEnergia,
      custoDepreciacao,
      custoManutencao,
      material,
      horasTrabalho,
      custoHora,
    } = req.body;

    // 3️⃣ cálculo CHM
    const chm =
      Number(custoFerramenta) +
      Number(custoEnergia) +
      Number(custoDepreciacao) +
      Number(custoManutencao);

    const custoMaquina = tempoHoras * chm;
    const custoMao = Number(horasTrabalho) * Number(custoHora);
    const total = Number(material) + custoMaquina + custoMao;

    // 4️⃣ salva no banco
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
        chm,
        custoMaquina,
        custoMao,
        total,
      },
    });

    res.json(calculo);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no cálculo com G-code" });
  }
});