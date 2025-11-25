import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HillClimbing() {
  const navigate = useNavigate();
  const [landscape, setLandscape] = useState([]);
  const [numPoints, setNumPoints] = useState(40);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [bestIndex, setBestIndex] = useState(null);
  const [steps, setSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const runningRef = useRef(false);

  // visualization constants (used by both generator and renderer)
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 300;
  const TOP_PADDING = 48;
  const BOTTOM_PADDING = 36;

  useEffect(() => {
    generateLandscape();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPoints]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const generateLandscape = () => {
    const arr = [];
    const width = SVG_WIDTH;
    const spacing = width / numPoints;

    // produce an interesting landscape using sin waves + noise
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 4;
      const base = Math.sin(t) * 0.6 + Math.sin(t * 0.5) * 0.3;
      const noise = (Math.random() - 0.5) * 0.4;
      const value = Math.max(0, base + noise + 1); // normalize positive

      arr.push({
        id: i,
        x: spacing * i + spacing / 2,
        value: Number((value * 100).toFixed(2)),
        state: "normal",
      });
    }

    setLandscape(arr);
    setCurrentIndex(null);
    setBestIndex(null);
    setSteps([]);
    setErrorMessage("");
  };

  // derived values used by rendering to avoid recomputing inside the JSX map
  const maxVal = landscape.length ? Math.max(...landscape.map((p) => p.value)) : 1;
  const scaleHeight = Math.max(60, SVG_HEIGHT - TOP_PADDING - BOTTOM_PADDING);
  const barWidth = Math.min(24, Math.max(6, SVG_WIDTH / numPoints * 0.6));

  const runHillClimbing = async () => {
    if (landscape.length === 0) return;
    setIsRunning(true);
    runningRef.current = true;
    setSteps([]);
    setErrorMessage("");
    // create a local copy so we don't rely on stale state
    const local = landscape.map((p) => ({ ...p }));

    // start at a random index
    let current = Math.floor(Math.random() * local.length);
    let best = current;

    // reset states in local copy and in UI
    for (let p of local) p.state = "normal";
    setLandscape(local.map((p) => ({ ...p })));
    setCurrentIndex(current);
    setBestIndex(best);

    const maxIterations = local.length * 50;
    let iter = 0;

    while (runningRef.current) {
      iter++;
      if (iter > maxIterations) {
        setErrorMessage("Máximo de iteraciones alcanzado");
        break;
      }

      // look at neighbors (left and right)
      const neighbors = [];
      if (current - 1 >= 0) neighbors.push(current - 1);
      if (current + 1 < local.length) neighbors.push(current + 1);

      // find best neighbor
      let bestNeighbor = current;
      for (const ni of neighbors) {
        if (local[ni].value > local[bestNeighbor].value) {
          bestNeighbor = ni;
        }
      }

      // record the attempt using local values
      setSteps((prev) => [
        ...prev,
        {
          from: current,
          to: bestNeighbor,
          fromValue: local[current].value,
          toValue: local[bestNeighbor].value,
        },
      ]);

      // update local visualization states
      for (let p of local) p.state = "normal";
      local[current].state = "visited";
      local[bestNeighbor].state = "candidate";
      setLandscape(local.map((p) => ({ ...p })));

      await delay(animationSpeed);

      // move if better
      if (local[bestNeighbor].value > local[current].value) {
        current = bestNeighbor;
        if (local[current].value > local[best].value) best = current;
        setCurrentIndex(current);
        setBestIndex(best);
        // continue searching
      } else {
        // local maximum reached
        break;
      }

      // allow early stop
      if (!runningRef.current) break;
    }

    // finalize states
    for (let p of local) {
      p.state = p.id === best ? "best" : p.state;
    }
    setLandscape(local.map((p) => ({ ...p })));

    setCurrentIndex(null);
    setIsRunning(false);
    runningRef.current = false;
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            zIndex: 60,
            padding: "0.4rem 0.6rem",
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
        <div style={{ textAlign: "center", marginBottom: "1.5rem", color: "white" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>Hill Climbing</h1>
          <p style={{ opacity: 0.9 }}>Búsqueda local ascendente en una función unidimensional</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>Controles</h3>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: 6, color: "#555", fontWeight: 600 }}>Puntos: {numPoints}</label>
              <input
                type="range"
                min="10"
                max="120"
                value={numPoints}
                onChange={(e) => setNumPoints(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: 6, color: "#555", fontWeight: 600 }}>Velocidad: {animationSpeed}ms</label>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false);
                    runningRef.current = false;
                  } else {
                    runHillClimbing();
                  }
                }}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: isRunning ? "#ef4444" : "#10b981", color: "white", fontWeight: 700 }}
              >
                {isRunning ? "Detener" : "Ejecutar"}
              </button>
              <button
                onClick={generateLandscape}
                disabled={isRunning}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: "#3b82f6", color: "white", fontWeight: 700 }}
              >
                Generar
              </button>
            </div>

            <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "0.75rem" }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#333" }}>Estadísticas</h4>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "#666" }}>Pasos:</span>
                <strong style={{ color: "#667eea" }}>{steps.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "#666" }}>Mejor valor:</span>
                <strong style={{ color: "#10b981" }}>{bestIndex !== null ? landscape[bestIndex].value : "-"}</strong>
              </div>
            </div>

            {errorMessage && (
              <div style={{ marginTop: 12, background: "#fee2e2", padding: 8, borderRadius: 6, color: "#991b1b" }}>{errorMessage}</div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
              <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block", margin: "0 auto" }}>
                <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="transparent" />
                {landscape.map((p) => {
                  const barHeight = Math.max(6, (p.value / maxVal) * scaleHeight);
                  const color = p.state === "best" ? "#f59e0b" : p.state === "candidate" ? "#60a5fa" : p.state === "visited" ? "#8b5cf6" : "#9ca3af";
                  const cx = p.x;
                  return (
                    <g key={p.id}>
                      <rect x={cx - barWidth / 2} y={SVG_HEIGHT - BOTTOM_PADDING - barHeight} width={barWidth} height={barHeight} fill={color} rx={3} />
                      <text x={cx} y={SVG_HEIGHT - 8} fontSize="9" textAnchor="middle" fill="#374151">{p.id}</text>
                      {barHeight > 18 && (
                        <text x={cx} y={SVG_HEIGHT - BOTTOM_PADDING - barHeight - 6} fontSize="9" textAnchor="middle" fill="#111">{p.value}</text>
                      )}
                    </g>
                  );
                })}

                {currentIndex !== null && landscape[currentIndex] && (
                  <g>
                    <text x={landscape[currentIndex].x} y={TOP_PADDING - 6} fontSize="13" textAnchor="middle" fill="#111" fontWeight={700}>Actual</text>
                  </g>
                )}
                {bestIndex !== null && landscape[bestIndex] && (
                  <g>
                    <text x={landscape[bestIndex].x} y={TOP_PADDING - 26} fontSize="13" textAnchor="middle" fill="#111" fontWeight={700}>Mejor</text>
                  </g>
                )}
              </svg>
            </div>

            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "1rem", maxHeight: 220, overflow: "auto" }}>
              <h3 style={{ marginTop: 0, color: "#333" }}>Log</h3>
              {steps.length === 0 ? (
                <p style={{ color: "#999" }}>Ejecuta el algoritmo para ver los pasos</p>
              ) : (
                steps.slice().reverse().map((s, idx) => (
                  <div key={idx} style={{ padding: 8, borderRadius: 6, background: "#f9fafb", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, color: "#374151" }}>
                      {`De ${s.from} (${s.fromValue}) → ${s.to} (${s.toValue})`}
                    </div>
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