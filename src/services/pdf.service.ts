import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { PDFRequestData } from "../types/pdf.types";

const brl = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const gerarPDFBuffer = (
  data: PDFRequestData,
  fotos: Express.Multer.File[]
): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // ===============================
    // HEADER IFRS
    // ===============================
    const logoPath = path.join("./public/logo-ifrs.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 60 });
    }

    doc
      .fontSize(13)
      .text("INSTITUTO FEDERAL DO RIO GRANDE DO SUL - Campus Porto Alegre", 120, 45)
      .fontSize(10)
      .text("Relatório de Valoração de Bem", 120, 62);

    doc.moveTo(50, 80).lineTo(550, 80).stroke();

    let y = 90;

    // ===============================
    // DESCRIÇÃO
    // ===============================
    doc.fontSize(11).text("Descrição do Bem:", 50, y);
    y += 15;

    doc
      .fontSize(10)
      .text(data.descricao || "Não informado", 50, y, {
        width: 500,
        align: "justify",
      });

    y += 50;

    doc
      .fontSize(12)
      .text(
        `Variáveis de entrada:`,
        50,
        y
      );

    y += 24;


    // ===============================
    // PARÂMETROS (2 COLUNAS)
    // ===============================
    const col1 = 50;
    const col2 = 300;

    const linha = (label: string, value: any, x: number, y: number) => {
      doc.fontSize(9).text(`${label}: ${value}`, x, y);
    };

    let yParams = y;

    linha("Valor Router CNC", brl(data.valorRouter), col1, yParams);
    linha("Projeção de vida útil Router (h)", data.vidaRouterHoras, col1, yParams + 12);
    linha("Valor Fresa/Ferramenta", brl(data.valorFresa), col1, yParams + 24);
    linha("Vida Útil da Fresa (h)", data.vidaFresaHoras, col1, yParams + 36);
    linha("Hora operador = salário / (horas/semana × 4)", `${data.salarioMensal} / (${data.horasSemana} × 4) = ${brl(data.custoHora)}`, col1, yParams + 48);
    linha("Horas de trabalho do operador neste projeto", `${data.horasTrabalho}`, col1, yParams + 60);

    linha("Tarifa Energia CEEE Equatorial (KWh)", brl(data.tarifaEnergia), col2, yParams);
    linha("Potência Spindle (kW)", data.potenciaKw, col2, yParams + 12);
    linha("Salário/Bolsa Operador", brl(data.salarioMensal), col2, yParams + 24);
    linha("Horas/semana Operador", data.horasSemana, col2, yParams + 36);

    y = yParams + 80;
  doc.fontSize(9).text("Custo Hora Máquina (CHM) = Cf + Ce + Cd + Cm", 50, y);
    y += 15;

    doc
      .fontSize(9)
      .text(
        `Cf [custo de desgaste de ferramenta por hora]= Valor da Fresa / Vida útil = ${data.valorFresa} / ${data.vidaFresaHoras} = ` + brl(data.valorFresa / data.vidaFresaHoras),
        100,
        y
      );

    y += 12;

    doc.text(
      `Ce [custo energético por hora] = Potência × Tarifa = ${data.potenciaKw} × ${data.tarifaEnergia} = ` + ` ${brl(data.potenciaKw * data.tarifaEnergia)}`,
      100,
      y
    );

    y += 12;

    doc.text(
      `Cd [custo de depreciação da máquina por hora] = Valor Router / Vida útil = ${data.valorRouter} / ${data.vidaRouterHoras} = ` + brl(data.valorRouter / data.vidaRouterHoras),
      100,
      y
    );

    y += 12;

    doc.text(
      `Cm [custo de manutenção por hora] = \\alpha \× Cd = ${data.alfaManutencao} × Cd = ${data.alfaManutencao} × ${brl(data.valorRouter / data.vidaRouterHoras)} = ` + brl(data.alfaManutencao * (data.valorRouter / data.vidaRouterHoras)),
      100,
      y
    );

    y += 20;


  doc
      .fontSize(12)
      .text(
        `Resultado:`,
        50,
        y
      );

    y += 24;

   doc.fontSize(9).text("Custo de material Utilizado no projeto (R$): " + brl(data.material), 50, y);
    y += 15;

    doc.fontSize(9).text("Tempo de uso de máquina no projeto (h):" + data.resultado.tempo.toFixed(2), 50, y);
    y += 15;


        doc.text(
      `CHM = ${brl(data.resultado.chm)}`,
      50,
      y
    );
    y += 15;

    doc.fontSize(9).text(
      "Custo Mão-de-obra = Horas trabalho × Hora Operador = " + `${data.horasTrabalho} × ${brl(data.custoHora)} =  ` + brl(data.horasTrabalho * data.custoHora), 50, y);
    y += 15;

    doc.fontSize(9).text(
      "Custo total = Custo do material + (Tempo × Custo Hora Máquina) + Custo Mão-de-obra:",
      50,
      y
    );
    y += 15; 
        doc.fontSize(9).text(
      "Custo total = " + brl(data.material) + " + (" + data.resultado.tempo.toFixed(2) + " x " + brl(data.resultado.chm) + ") + " + brl(data.horasTrabalho * data.custoHora) + ":" ,
      50,
      y
    );
    y += 20; 
    // ===============================
    // RESULTADO
    // ===============================
    if (data.resultado) {
      doc.fontSize(12).text("Valor de referência para registro patrimonial = " + brl(data.resultado.total), 50, y);
      y += 30;
    }


    // ===============================
    // FOTOS (GRID COMPACTO)
    // ===============================
    if (fotos && fotos.length > 0) {
      doc.fontSize(11).text("Registro Fotográfico:", 50, y);
      y += 10;

      let x = 50;
      const largura = 240;
      const altura = 180;

      let col = 0;

      for (const file of fotos.slice(0, 4)) {
        try {
          doc.image(file.path, x, y, {
            fit: [largura, altura],
          });

          col++;

          if (col === 3) {
            col = 0;
            x = 50;
            y += altura + 10;
          } else {
            x += largura + 10;
          }
        } catch {
          console.error("Erro ao carregar imagem:", file.path);
        }

        // limpa arquivo
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }

      y += altura + 10;
    }

    // ===============================
    // ASSINATURA (RODAPÉ)
    // ===============================
    doc.moveTo(300, 710).lineTo(500, 710).stroke();

    doc
      .fontSize(10)
      .text("Responsável Técnico", 350, 715)
      .text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 350, 725);

    doc.end();
  });
};