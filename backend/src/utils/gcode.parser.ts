import fs from "fs";

const RAPID_FEED = 3000; // mm/min (ajustável)

export function calcularTempoGcode(path: string): number {
  const linhas = fs.readFileSync(path, "utf-8").split("\n");

  let x = 0;
  let y = 0;
  let z = 0;

  let feedRate = 1000; // mm/min padrão
  let tempoTotal = 0; // minutos

  for (const linha of linhas) {
    const linhaLimpa = linha.trim();

    if (!linhaLimpa) continue;

    // Feed rate
    const matchF = linhaLimpa.match(/F(-?\d+\.?\d*)/);
    if (matchF) {
      feedRate = parseFloat(matchF[1]);
    }

    // Detecta G0 ou G1
    const matchG = linhaLimpa.match(/G0?([01])/);
    if (!matchG) continue;

    const tipo = matchG[1]; // "0" ou "1"

    let novoX = x;
    let novoY = y;
    let novoZ = z;

    const matchX = linhaLimpa.match(/X(-?\d+\.?\d*)/);
    const matchY = linhaLimpa.match(/Y(-?\d+\.?\d*)/);
    const matchZ = linhaLimpa.match(/Z(-?\d+\.?\d*)/);

    if (matchX) novoX = parseFloat(matchX[1]);
    if (matchY) novoY = parseFloat(matchY[1]);
    if (matchZ) novoZ = parseFloat(matchZ[1]);

    const dx = novoX - x;
    const dy = novoY - y;
    const dz = novoZ - z;

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let feedAtual = feedRate;

    if (tipo === "0") {
      feedAtual = RAPID_FEED;
    }

    if (feedAtual > 0) {
      tempoTotal += dist / feedAtual;
    }

    x = novoX;
    y = novoY;
    z = novoZ;
  }

  return tempoTotal; // minutos
}