// ===============================
// 📄 controllers/pdf.controller.ts
// ===============================
import { Request, Response } from "express";
import { gerarPDFBuffer } from "../services/pdf.service";
import { PDFRequestData } from "../types/pdf.types";

const num = (v: any) => {
  if (Array.isArray(v)) v = v[0];
  return Number(v || 0);
};


export const gerarPDFController = async (req: Request, res: Response) => {
  try {
    console.log("BODY:", req.body);
console.log("FILES:", req.files);
const fotos = (req.files as Express.Multer.File[]) || [];
    const body = req.body;

    const data: PDFRequestData = {
      ...body,
      valorRouter: Number(body.valorRouter),
      vidaRouterHoras: Number(body.vidaRouterHoras),
      valorFresa: Number(body.valorFresa),
      vidaFresaHoras: Number(body.vidaFresaHoras),
      potenciaKw: Number(body.potenciaKw),
      tarifaEnergia: Number(body.tarifaEnergia),
      alfaManutencao: Number(body.alfaManutencao),
      salarioMensal: Number(body.salarioMensal),
      horasSemana: Number(body.horasSemana),
      horasTrabalho: Number(body.horasTrabalho),
      custoChapa: Number(body.custoChapa),
      custoHora: Number(body.custoHora),

      //resultado: body.resultado ? JSON.parse(body.resultado) : undefined,
      resultado: {
  tempo: Number(body.tempo),
  chm: Number(body.chm),
  total: Number(body.total),
},
    };

    const pdfBuffer = await gerarPDFBuffer(data, fotos);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=relatorio-patrimonio.pdf"
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
};