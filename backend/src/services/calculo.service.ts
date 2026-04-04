export function calcularCustos(data: {
  tempo: number;
  custoFerramenta: number;
  custoEnergia: number;
  custoDepreciacao: number;
  custoManutencao: number;
  material: number;
  horasTrabalho: number;
  custoHora: number;
}) {
  const chm =
    data.custoFerramenta +
    data.custoEnergia +
    data.custoDepreciacao +
    data.custoManutencao;

  const custoMaquina = data.tempo * chm;
  const custoMao = data.horasTrabalho * data.custoHora;
  const total = data.material + custoMaquina + custoMao;

  return {
    chm,
    custoMaquina,
    custoMao,
    total,
  };
}