import { useState } from "react";
import axios from "axios";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [quantidades, setQuantidades] = useState<number[]>([]);
  const [resultado, setResultado] = useState<any>(null);

  const [form, setForm] = useState({
    custoFerramenta: "",
    custoEnergia: "",
    custoDepreciacao: "",
    custoManutencao: "",
    material: "",
    horasTrabalho: "",
    custoHora: "",
  });

  const handleFiles = (e: any) => {
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
      data.append(key, value);
    });

    const res = await axios.post("http://localhost:3000/calcular-com-gcode", data);
    setResultado(res.data);
  };

  const money = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header institucional */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
          <img src="/logo-ifrs.png" className="h-12" />
          <div>
            <h1 className="font-bold text-lg text-gray-800">
              Sistema de Valoração de Bens – FabLab
            </h1>
            <p className="text-sm text-gray-500">
              Instituto Federal do Rio Grande do Sul
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Upload */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Arquivos G-code</h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:bg-blue-50 transition">
            <span className="text-blue-600 font-medium">
              Selecionar arquivos
            </span>
            <input type="file" multiple onChange={handleFiles} className="hidden" />
          </label>

          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <span>{file.name}</span>
                <input
                  type="number"
                  value={quantidades[index]}
                  onChange={(e) =>
                    handleQuantidade(index, Number(e.target.value))
                  }
                  className="w-20 border rounded px-2 py-1 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Parâmetros */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Parâmetros</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ["custoFerramenta", "Ferramenta (R$/h)"],
              ["custoEnergia", "Energia (R$/h)"],
              ["custoDepreciacao", "Depreciação"],
              ["custoManutencao", "Manutenção"],
              ["material", "Material (R$)"],
              ["horasTrabalho", "Horas"],
              ["custoHora", "Custo Hora"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow"
        >
          Calcular
        </button>

        {/* Resultado */}
        {resultado && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">Resultado</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>Tempo: {resultado.tempo.toFixed(2)} h</div>
              <div>CHM: {money(resultado.chm)}</div>
              <div>Máquina: {money(resultado.custoMaquina)}</div>
              <div>Mão: {money(resultado.custoMao)}</div>
              <div className="col-span-2 md:col-span-3 text-xl font-bold text-blue-700">
                Total: {money(resultado.total)}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mt-4">Detalhamento</h3>
              <div className="space-y-2 mt-2">
                {resultado.detalhes.map((d: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-blue-700">{d.arquivo}</div>
                    <div className="text-sm">Tempo: {d.tempoMin.toFixed(2)} min</div>
                    <div className="text-sm">Qtd: {d.quantidade}</div>
                    <div className="text-sm">Subtotal: {d.subtotalMin.toFixed(2)} min</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


<footer className="text-center text-xs text-gray-500 py-6">
  Instituto Federal do Rio Grande do Sul – IFRS Campus Porto Alegre - POALAB -
  Sistema desenvolvido para apoio à valoração patrimonial de bens produzidos em FabLabs  
</footer>

      </main>
    </div>
  );
  
}
