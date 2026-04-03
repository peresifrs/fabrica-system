import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [quantidades, setQuantidades] = useState<number[]>([]);
  const [resultado, setResultado] = useState<any>(null);

  // ===============================
  // 🔬 PARÂMETROS ATUALIZADOS
  // ===============================
  const [inputs, setInputs] = useState({
    // Máquina
    valorRouter: 27000,
    vidaRouterHoras: 5000,

    // Ferramenta (Vonder 6mm)
    valorFresa: 20,
    vidaFresaHoras: 15,

    // Energia
    potenciaKw: 1.5,
    tarifaEnergia: 0.85,

    // Manutenção
    alfaManutencao: 0.3,

    // Mão de obra
    salarioMensal: 700,
    horasSemana: 16,
    horasTrabalho: 6,

    // Material
    custoChapa: 342.75,
    partesPorChapa: 4,
    partesUsadas: 6,
    outrosCustos: 25,
  });

  // ===============================
  // ⚙️ DERIVADOS
  // ===============================
  const [form, setForm] = useState({
    custoFerramenta: 0,
    custoEnergia: 0,
    custoDepreciacao: 0,
    custoManutencao: 0,
    material: 0,
    horasTrabalho: 0,
    custoHora: 0,
  });

  useEffect(() => {
    const Cf = inputs.valorFresa / inputs.vidaFresaHoras;

    const Ce = inputs.potenciaKw * inputs.tarifaEnergia;

    const Cd = inputs.valorRouter / inputs.vidaRouterHoras;

    const Cm = inputs.alfaManutencao * Cd;

    // conversão semanas → mês (~4 semanas)
    const horasMes = inputs.horasSemana * 4;
    const custoHora = inputs.salarioMensal / horasMes;

    const custoMaterial =
      (inputs.custoChapa / inputs.partesPorChapa) *
        inputs.partesUsadas +
      inputs.outrosCustos;

    setForm({
      custoFerramenta: Cf,
      custoEnergia: Ce,
      custoDepreciacao: Cd,
      custoManutencao: Cm,
      material: custoMaterial,
      horasTrabalho: inputs.horasTrabalho,
      custoHora: custoHora,
    });
  }, [inputs]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);
    setFiles(selected);
    setQuantidades(selected.map(() => 1));
  };

  const handleQuantidade = (index: number, value: number) => {
    const novas = [...quantidades];
    novas[index] = value;
    setQuantidades(novas);
  };

  const handleSubmit = async () => {
    const data = new FormData();

    files.forEach((file) => data.append("files", file));
    quantidades.forEach((q) => data.append("quantidades", String(q)));

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    const res = await axios.post(
      "http://localhost:3000/calcular-com-gcode",
      data
    );

    setResultado(res.data);
  };

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const input = (key: string, label: React.ReactNode) => (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type="number"
        className="w-full border rounded px-3 py-2"
        value={(inputs as any)[key]}
        onChange={(e) =>
          setInputs({ ...inputs, [key]: Number(e.target.value) })
        }
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
          <img src="/logo-ifrs.png" className="h-12" />
          <div>
            <h1 className="font-bold text-lg">Sistema de Valoração – CHM</h1>
            <p className="text-sm text-gray-500">
              Versão 2026-04a (POALAB)
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Upload */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">G-code</h2>

          <input type="file" multiple onChange={handleFiles} />

          {files.map((f, i) => (
            <div key={i} className="flex justify-between mt-2">
              <span>{f.name}</span>
              <input
                type="number"
                value={quantidades[i]}
                onChange={(e) =>
                  handleQuantidade(i, Number(e.target.value))
                }
                className="w-20 border"
              />
            </div>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-6">

          {/* Custos com router */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="font-semibold">Custos com router</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {input("valorRouter", "Valor da Router CNC (R$)")}
              {input("vidaRouterHoras", "Vida útil da Router CNC (h)")}
              {input("potenciaKw", "Potência (kW)")}
              {input(
                "tarifaEnergia",
                <>
                  Tarifa energia (R$/kWh) —{" "}
                  <a href="https://ceee.equatorialenergia.com.br/valor-de-tarifas-e-servicos/#residencial-normal" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    CEEE Equatorial
                  </a>
                </>
              )}
              {input("alfaManutencao", "Alfa manutenção (entre 0,2 e 0,4)")}

              {/* Fresa agora incluída aqui */}
              {input(
                "valorFresa",
                <>
                  Valor da Fresa (R$) —{" "}
                  <a href="https://www.google.com/search?q=fresa+6mm+vonder" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    EX. Vonder 6mm corte duplo
                  </a>
                </>
              )}
              {input("vidaFresaHoras", "Vida útil da Fresa (h)")}
            </div>
          </div>

          {/* Custos Mão-de-Obra */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="font-semibold">Custos Mão-de-Obra</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {input("salarioMensal", "Salário/bolsa mensal do operador")}
              {input("horasSemana", "Horas de trabalho por semana do operador")}
              {input(
                "horasTrabalho",
                <>
                  <b>Horas do operador envolvidas no projeto</b>
                </>
              )}
            </div>
          </div>

          {/* Custos Material */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="font-semibold">Custos Material</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {input("custoChapa", "Custo da uma chapa (ex: compensado naval)")}
              {input("partesPorChapa", "Partes por chapa")}
              {input("partesUsadas", "Partes usadas no projeto")}
              {input(
                "outrosCustos",
                <>
                  <b>Outros custos (rodízios, cola, parafusos...)</b>
                </>
              )}
            </div>
          </div>

          
        </div>

        {/* Preview */}
        <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono">
          Cf: {form.custoFerramenta.toFixed(2)} | Ce: {form.custoEnergia.toFixed(2)} | Cd: {form.custoDepreciacao.toFixed(2)} | Cm: {form.custoManutencao.toFixed(2)}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Calcular
        </button>

        {/* Resultado */}
        {resultado && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold">Resultado</h2>

            <div>Tempo: {resultado.tempo.toFixed(2)} h</div>
            <div>CHM: {money(resultado.chm)}</div>
            <div>Total: {money(resultado.total)}</div>
          </div>
        )}
      </main>
    </div>
  );
}
