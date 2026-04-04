// ===============================
// 📄 types/pdf.types.ts
// ===============================
export interface PDFRequestData {
  descricao: string;

  valorRouter: number;
  vidaRouterHoras: number;

  valorFresa: number;
  vidaFresaHoras: number;

  potenciaKw: number;
  tarifaEnergia: number;

  alfaManutencao: number;

  salarioMensal: number;
  horasSemana: number;
  horasTrabalho: number;

  custoChapa: number;

  custoHora: number;

  resultado?: {
    tempo: number;
    chm: number;
    total: number;
  };
}
