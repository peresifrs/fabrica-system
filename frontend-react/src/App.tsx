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

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Sistema de Valoração Patrimonial FabLab</h1>

      <h2>Upload de G-code</h2>
      <input type="file" multiple onChange={handleFiles} />

      {files.map((file, index) => (
        <div key={index}>
          {file.name}
          <input
            type="number"
            value={quantidades[index]}
            onChange={(e) => handleQuantidade(index, Number(e.target.value))}
          />
        </div>
      ))}

      <h2>Parâmetros</h2>

      {Object.keys(form).map((key) => (
        <div key={key}>
          <input
            placeholder={key}
            value={(form as any)[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Calcular</button>

      {resultado && (
        <div style={{ marginTop: 20 }}>
          <h2>Resultado</h2>

          <p>Tempo (h): {resultado.tempo.toFixed(2)}</p>
          <p>CHM: {resultado.chm.toFixed(2)}</p>
          <p>Custo Máquina: {resultado.custoMaquina.toFixed(2)}</p>
          <p>Custo Mão: {resultado.custoMao.toFixed(2)}</p>
          <p><strong>Total: {resultado.total.toFixed(2)}</strong></p>

          <h3>Detalhes</h3>

          {resultado.detalhes.map((d: any, i: number) => (
            <div key={i} style={{ border: "1px solid #ccc", margin: 5, padding: 5 }}>
              <strong>{d.arquivo}</strong>
              <p>Tempo: {d.tempoMin.toFixed(2)} min</p>
              <p>Qtd: {d.quantidade}</p>
              <p>Subtotal: {d.subtotalMin.toFixed(2)} min</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}