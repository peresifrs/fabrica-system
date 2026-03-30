import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    tempo: 0,
    custoFerramenta: 0,
    custoEnergia: 0,
    custoDepreciacao: 0,
    custoManutencao: 0,
    material: 0,
    horasTrabalho: 0,
    custoHora: 0,
  });

  const [resultado, setResultado] = useState<any>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.id]: Number(e.target.value),
    });
  }

  async function calcular() {
    const response = await fetch("http://localhost:3000/calcular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setResultado(data);
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="container">
      <h1>Calculadora CHM</h1>

      <div className="grid">
        <div className="section">⏱️ Tempo</div>

        <div>
          <label>Tempo de usinagem (h)</label>
          <input id="tempo" type="number" step="0.01" onChange={handleChange} />
        </div>

        <div></div>

        <div className="section">⚙️ Custos da Máquina</div>

        <div>
          <label>Ferramenta</label>
          <input
            id="custoFerramenta"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Energia</label>
          <input
            id="custoEnergia"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Depreciação</label>
          <input
            id="custoDepreciacao"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Manutenção</label>
          <input
            id="custoManutencao"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div className="section">📦 Outros Custos</div>

        <div>
          <label>Material</label>
          <input
            id="material"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Horas de trabalho</label>
          <input
            id="horasTrabalho"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Custo por hora</label>
          <input
            id="custoHora"
            type="number"
            step="0.01"
            onChange={handleChange}
          />
        </div>
      </div>

      <button onClick={calcular}>Calcular</button>

      {resultado && (
        <div className="resultado">
          <p>CHM: {formatar(resultado.chm)}</p>
          <p>Custo Máquina: {formatar(resultado.custoMaquina)}</p>
          <p>Custo Mão de Obra: {formatar(resultado.custoMao)}</p>
          <p className="total">Total: {formatar(resultado.total)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
