import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function branchPruning() {
  const navigate = useNavigate();
  // Configuración inicial
  const [numItems, setNumItems] = useState(5);
  const [items, setItems] = useState([]);
  const [capacity, setCapacity] = useState(10);
  
  // Estados de ejecución
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [speed, setSpeed] = useState(500);
  
  // Estado Visual
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [bestValue, setBestValue] = useState(0);
  const [path, setPath] = useState([]); 
  
  // Referencias para lógica síncrona
  const isRunningRef = useRef(false);
  const bestValueRef = useRef(0); 

  useEffect(() => {
    generateItems();
  }, [numItems]);

  const generateItems = () => {
    const newItems = Array.from({ length: numItems }, (_, i) => {
      const w = Math.floor(Math.random() * 6) + 2; // Pesos entre 2 y 8
      const v = Math.floor(Math.random() * 80) + 20; // Valores entre 20 y 100
      return { id: i + 1, w, v, ratio: (v / w).toFixed(2) };
    });
    // Ordenar por densidad (Valor/Peso)
    newItems.sort((a, b) => (b.v / b.w) - (a.v / a.w));
    setItems(newItems);
    reset();
  };

  const reset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    bestValueRef.current = 0;
    setBestValue(0);
    setLogs([]);
    setCurrentIdx(-1);
    setCurrentWeight(0);
    setCurrentValue(0);
    setPath([]);
  };

  const addLog = (message, type = "info") => {
    setLogs((prev) => [{ message, type }, ...prev]);
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const getBound = (idx, cw, cv, currentItems) => {
    // Rama invalida si el peso excede la capacidad
    if (cw > capacity) return 0;
    
    let bound = cv;
    let totalWeight = cw;
    let j = idx;
    
    // Greedy fraccionario
    while (j < currentItems.length && totalWeight + currentItems[j].w <= capacity) {
      totalWeight += currentItems[j].w;
      bound += currentItems[j].v;
      j++;
    }
    
    if (j < currentItems.length) {
      bound += (capacity - totalWeight) * (currentItems[j].v / currentItems[j].w);
    }
    
    return bound;
  };

  const solve = async () => {
    if (isRunningRef.current) return;
    
    // Capturar snapshot de objetos para asegurar integridad durante la recursión
    const currentItems = [...items];
    if (currentItems.length === 0) return;

    setIsRunning(true);
    isRunningRef.current = true;
    bestValueRef.current = 0;
    setBestValue(0);
    setLogs([]);
    addLog("Iniciando Branch & Bound...", "start");
    
    // Pasamos currentItems a la recursión
    await knapsackDFS(0, 0, 0, [], currentItems);
    
    addLog(`Finalizado. Mejor Valor Global: ${bestValueRef.current}`, "success");
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const knapsackDFS = async (idx, cw, cv, currentPath, currentItems) => {
    if (!isRunningRef.current) return;

    // Actualizar UI
    setCurrentIdx(idx);
    setCurrentWeight(cw);
    setCurrentValue(cv);
    setPath(currentPath);
    await delay(speed);

    // Caso base: se acabaron los objetos o se llegó al final
    if (idx === currentItems.length) {
      if (cv > bestValueRef.current) {
        bestValueRef.current = cv; 
        setBestValue(cv);          
        addLog(`¡Nueva mejor solución: ${cv}!`, "success");
      }
      return;
    }

    // Calcular Cota usando los items capturados
    const bound = getBound(idx, cw, cv, currentItems);
    
    // Poda
    if (bound <= bestValueRef.current) {
      addLog(`PODA en nodo ${idx}: Cota ${bound.toFixed(1)} no supera ${bestValueRef.current}`, "warn");
      return; 
    }

    // Rama Izquierda: Incluir Objeto
    if (cw + currentItems[idx].w <= capacity) {
      await knapsackDFS(idx + 1, cw + currentItems[idx].w, cv + currentItems[idx].v, [...currentPath, 1], currentItems);
    }

    // Rama Derecha: Excluir Objeto
    const boundWithout = getBound(idx + 1, cw, cv, currentItems);
    
    if (boundWithout > bestValueRef.current) {
      await knapsackDFS(idx + 1, cw, cv, [...currentPath, 0], currentItems);
    } else {
       addLog(`PODA Derecha en nodo ${idx}`, "warn");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
        fontFamily: "sans-serif"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Botón Atrás */}
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            zIndex: 60,
            padding: "0.4rem 0.8rem",
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.9)",
            color: "#374151",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          ← Atrás
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem", color: "white" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Branch & Bound con Poda</h1>
          <p style={{ opacity: 0.9, fontSize: "1.1rem" }}>Optimización inteligente mediante poda de ramas</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
          
          {/* SIDEBAR */}
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1.5rem", height: "fit-content", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#1f2937", fontWeight: "bold", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>Controles</h3>
            
            <button onClick={generateItems} disabled={isRunning} style={{ width: "100%", padding: "0.6rem", background: "#3b82f6", border: "none", borderRadius: 8, color: "white", fontWeight: 700, cursor: "pointer", marginBottom: "1.5rem" }}>
                Regenerar Objetos
            </button>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: 6, color: "#555", fontWeight: 600 }}>Cantidad de Objetos: {numItems}</label>
              <input type="range" min="3" max="10" value={numItems} onChange={(e) => !isRunning && setNumItems(Number(e.target.value))} disabled={isRunning} style={{ width: "100%", accentColor: "#4f46e5" }} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: 6, color: "#555", fontWeight: 600 }}>Capacidad Mochila: {capacity}kg</label>
              <input type="range" min="5" max="30" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} disabled={isRunning} style={{ width: "100%", accentColor: "#4f46e5" }} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: 6, color: "#555", fontWeight: 600 }}>Velocidad: {speed}ms</label>
              <input type="range" min="50" max="1000" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%", accentColor: "#4f46e5" }} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                onClick={solve}
                disabled={isRunning}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: isRunning ? "#94a3b8" : "#10b981", color: "white", fontWeight: 700, cursor: isRunning ? "wait" : "pointer" }}
              >
                {isRunning ? "Calculando..." : "Iniciar"}
              </button>
              <button
                onClick={reset}
                disabled={isRunning}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid #d1d5db", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer" }}
              >
                Reset
              </button>
            </div>
            
            <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                <span style={{ display: "block", color: "#666", fontSize: "0.8rem", marginBottom: "4px" }}>Mejor Valor Encontrado</span>
                <strong style={{ color: "#166534", fontSize: "1.5rem" }}>${bestValue}</strong>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Lista Items Visual */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333", fontWeight: "bold" }}>Objetos Disponibles (Ordenados por Densidad)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.8rem" }}>
                    {items.map((item, idx) => {
                        let borderColor = "transparent";
                        let bgColor = "white";
                        let opacity = 1;
                        let statusText = null;
                        
                        if (idx === currentIdx) {
                            borderColor = "#3b82f6";
                            bgColor = "#eff6ff";
                        } else if (idx < currentIdx) {
                            opacity = 0.6;
                            if (path[idx] === 1) { 
                                bgColor = "#dcfce7"; borderColor = "#22c55e"; statusText = "✓";
                            }
                            else if (path[idx] === 0) { 
                                bgColor = "#fee2e2"; borderColor = "#ef4444"; statusText = "✗";
                            }
                        }

                        return (
                            <div key={item.id} style={{ padding: "0.75rem", borderRadius: 8, border: `2px solid ${borderColor}`, background: bgColor, opacity: opacity, transition: "all 0.3s", position: "relative" }}>
                                <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", display: "flex", justifyContent: "space-between" }}>
                                    <span>#{item.id}</span>
                                    <span style={{ fontSize: "0.7rem", background: "#e5e7eb", padding: "1px 4px", borderRadius: "4px" }}>R:{item.ratio}</span>
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>Peso: {item.w}</div>
                                <div style={{ fontSize: "0.8rem", color: "#555" }}>Valor: {item.v}</div>
                                {statusText && (
                                    <div style={{ position: "absolute", bottom: "5px", right: "5px", fontWeight: "bold", color: path[idx]===1 ? "#166534" : "#991b1b" }}>{statusText}</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Mochila Visual */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "bold", color: "#555" }}>
                    <span>Capacidad: {currentWeight} / {capacity} kg</span>
                    <span>Valor Rama Actual: ${currentValue}</span>
                 </div>
                 <div style={{ height: "40px", width: "100%", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                    {path.map((taken, idx) => {
                        if(taken === 1 && idx < items.length) {
                            const widthPct = (items[idx].w / capacity) * 100;
                            return (
                                <div key={idx} style={{ width: `${widthPct}%`, background: "#6366f1", borderRight: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.7rem", fontWeight: "bold", overflow: "hidden", whiteSpace: "nowrap" }}>
                                    #{items[idx].id}
                                </div>
                            )
                        }
                        return null;
                    })}
                 </div>
            </div>

            {/* Log Panel */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1rem", maxHeight: 200, overflowY: "auto" }}>
              <h3 style={{ marginTop: 0, color: "#333", fontSize: "1rem" }}>Decisiones</h3>
              {logs.map((log, idx) => (
                  <div key={idx} style={{ padding: 6, marginBottom: 4, borderRadius: 4, background: "#f8fafc", fontSize: "0.85rem", borderLeft: `3px solid ${log.type === 'warn' ? '#f59e0b' : '#3b82f6'}` }}>
                      {log.message}
                  </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}