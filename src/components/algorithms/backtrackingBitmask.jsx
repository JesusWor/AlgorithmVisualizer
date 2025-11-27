import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NQueensBitmask() {
  const navigate = useNavigate();
  const [n, setN] = useState(8);
  const [board, setBoard] = useState([]); 
  const [solutions, setSolutions] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [logs, setLogs] = useState([]);
  
  // Estados visuales internos
  const [currentMasks, setCurrentMasks] = useState({ col: 0, ld: 0, rd: 0 });
  const [currentRow, setCurrentRow] = useState(-1);
  
  // REFS
  const isRunningRef = useRef(false);
  const solutionsRef = useRef(0);

  useEffect(() => { resetBoard(); }, [n]);

  const resetBoard = () => {
    setBoard(Array(n).fill(-1));
    setSolutions(0);
    solutionsRef.current = 0; // Resetear la referencia lógica
    setLogs([]);
    setCurrentRow(-1);
    setCurrentMasks({ col: 0, ld: 0, rd: 0 });
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const addLog = (message, type = "info") => {
    setLogs((prev) => [{ message, type }, ...prev].slice(0, 50));
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const solve = async () => {
    if (isRunningRef.current) return;
    setIsRunning(true);
    isRunningRef.current = true;
    
    // Reset explícito al iniciar
    setSolutions(0);
    solutionsRef.current = 0;
    setLogs([]);
    
    addLog(`Iniciando para N=${n}...`, "start");
    
    const limit = (1 << n) - 1;
    await backtrack(0, 0, 0, 0, limit, Array(n).fill(-1));
    
    if (isRunningRef.current) addLog(`Finalizado. Total soluciones: ${solutionsRef.current}`, "success");
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const backtrack = async (row, cols, ld, rd, limit, currentBoard) => {
    if (!isRunningRef.current) return;

    setCurrentRow(row);
    setCurrentMasks({ col: cols, ld, rd });
    setBoard([...currentBoard]);
    await delay(speed);

    if (row === n) {
      solutionsRef.current += 1;
      setSolutions(solutionsRef.current); // Actualizar UI
      
      addLog(`¡Solución #${solutionsRef.current} encontrada!`, "success");
      await delay(speed * 3); // Pausa para mostrar la solución
      return;
    }

    let available = ~(cols | ld | rd) & limit;
    while (available > 0 && isRunningRef.current) {
      const p = available & -available;
      available = available - p;
      const colIndex = Math.log2(p);
      
      currentBoard[row] = colIndex;
      await backtrack(row + 1, cols | p, (ld | p) << 1, (rd | p) >> 1, limit, currentBoard);
      
      if (isRunningRef.current) {
        currentBoard[row] = -1;
        setBoard([...currentBoard]);
        setCurrentRow(row); // Regresar visualmente a esta fila
        await delay(speed / 2);
      }
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

        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: "2rem", color: "white" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Backtracking con Bitmask</h1>
          <p style={{ opacity: 0.9, fontSize: "1.1rem" }}>Backtracking optimizado con operaciones de bits</p>
        </div>

        {/* Grid Layout Principal */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
          
          {/* SIDEBAR (Izquierda) */}
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1.5rem", height: "fit-content", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#1f2937", fontWeight: "bold", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>Configuración</h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: 8, color: "#4b5563", fontWeight: 600 }}>Reinas (N): {n}</label>
              <input
                type="range"
                min="4"
                max="10"
                value={n}
                onChange={(e) => !isRunning && setN(parseInt(e.target.value))}
                disabled={isRunning}
                style={{ width: "100%", accentColor: "#4f46e5" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: 8, color: "#4b5563", fontWeight: 600 }}>Velocidad: {speed}ms</label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#4f46e5" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
              <button
                onClick={isRunning ? () => { isRunningRef.current = false; setIsRunning(false); } : solve}
                style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: isRunning ? "#ef4444" : "#4f46e5", color: "white", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
              >
                {isRunning ? "Detener" : "Iniciar"}
              </button>
              <button
                onClick={resetBoard}
                disabled={isRunning}
                style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #d1d5db", background: "white", color: "#374151", fontWeight: 700, cursor: isRunning ? "not-allowed" : "pointer" }}
              >
                Reset
              </button>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 700, color: "#333", fontSize: "0.9rem" }}>Máscaras de Bits (Debug)</h4>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cols:</span> <span style={{ color: "#4f46e5", fontWeight: "bold" }}>{currentMasks.col.toString(2).padStart(n, '0')}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>LD:</span> <span style={{ color: "#4f46e5", fontWeight: "bold" }}>{currentMasks.ld.toString(2).padStart(n, '0')}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>RD:</span> <span style={{ color: "#4f46e5", fontWeight: "bold" }}>{currentMasks.rd.toString(2).padStart(n, '0')}</span></div>
              </div>
              <div style={{ marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#333" }}>Soluciones:</span>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "bold" }}>{solutions}</span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT (Derecha) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Visualización Tablero */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "500px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
              <div style={{ 
                width: "100%", 
                maxWidth: "500px", 
                aspectRatio: "1/1", 
                display: "grid", 
                gridTemplateColumns: `repeat(${n}, 1fr)`, 
                gap: "2px",
                background: "#334155",
                border: "4px solid #334155",
                borderRadius: "4px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>
                {Array.from({ length: n * n }).map((_, idx) => {
                  const r = Math.floor(idx / n);
                  const c = idx % n;
                  const isQueen = board[r] === c;
                  const isDark = (r + c) % 2 === 1;
                  const isCurrentRow = r === currentRow;
                  return (
                    <div key={idx} style={{ 
                      backgroundColor: isDark ? "#818cf8" : "#e0e7ff",
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden"
                    }}>
                      {isCurrentRow && (
                          <div style={{ position: "absolute", inset: 0, border: "3px solid #facc15", zIndex: 10, pointerEvents: "none" }}></div>
                      )}
                      {isQueen && (
                        <span style={{ 
                            fontSize: `min(3rem, calc(500px / ${n} * 0.7))`, 
                            lineHeight: 1,
                            userSelect: "none"
                        }}>👑</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Log Panel */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1rem", maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#333", fontSize: "1.1rem" }}>Log de Ejecución</h3>
              {logs.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center", margin: "auto" }}>Listo para iniciar...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} style={{ padding: "8px 12px", borderRadius: 6, background: "#f1f5f9", marginBottom: 6, borderLeft: `4px solid ${log.type === 'success' ? '#10b981' : log.type === 'start' ? '#3b82f6' : '#94a3b8'}` }}>
                    <span style={{ fontWeight: 700, color: "#374151", marginRight: "8px", fontSize: "0.85rem" }}>[{log.type.toUpperCase()}]</span>
                    <span style={{ color: "#475569", fontSize: "0.9rem" }}>{log.message}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}