import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";

const round = (value: number) => Number(value.toFixed(2));

const app = express();
app.use(cors());
app.use(express.json());

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
