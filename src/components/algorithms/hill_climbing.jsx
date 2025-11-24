import { useState, useEffect } from "react";

export default function HillClimbing() {
  const [landscape, setLandscape] = useState([]);
  const [numPoints, setNumPoints] = useState(40);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [bestIndex, setBestIndex] = useState(null);
  const [steps, setSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    generateLandscape();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPoints]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const generateLandscape = () => {
    const arr = [];
    const width = 600;
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

  const runHillClimbing = async () => {
    if (landscape.length === 0) return;
    setIsRunning(true);
    setSteps([]);
    setErrorMessage("");

    // start at a random index
    let current = Math.floor(Math.random() * landscape.length);
    let best = current;

    // mark start
    setLandscape((prev) => prev.map((p) => ({ ...p, state: "normal" })));
    setCurrentIndex(current);
    setBestIndex(best);

    const maxIterations = landscape.length * 10;
    let iter = 0;

    while (isRunning || iter === 0) {
      iter++;
      if (iter > maxIterations) {
        setErrorMessage("Máximo de iteraciones alcanzado");
        break;
      }

      // look at neighbors (left and right)
      const neighbors = [];
      if (current - 1 >= 0) neighbors.push(current - 1);
      if (current + 1 < landscape.length) neighbors.push(current + 1);

      // find best neighbor
      let bestNeighbor = current;
      for (const ni of neighbors) {
        if (landscape[ni].value > landscape[bestNeighbor].value) {
          bestNeighbor = ni;
        }
      }

      // record the attempt
      setSteps((prev) => [
        ...prev,
        {
          from: current,
          to: bestNeighbor,
          fromValue: landscape[current].value,
          toValue: landscape[bestNeighbor].value,
        },
      ]);

      // update visualization states
      setLandscape((prev) =>
        prev.map((p) => {
          if (p.id === current) return { ...p, state: "visited" };
          if (p.id === bestNeighbor) return { ...p, state: "candidate" };
          return { ...p, state: "normal" };
        })
      );

      await delay(animationSpeed);

      // move if better
      if (landscape[bestNeighbor].value > landscape[current].value) {
        current = bestNeighbor;
        if (landscape[current].value > landscape[best].value) best = current;
        setCurrentIndex(current);
        setBestIndex(best);
        // continue searching
      } else {
        // local maximum reached
        break;
      }

      // allow early stop
      if (!isRunning) break;
    }

    // finalize states
    setLandscape((prev) => prev.map((p) => ({
      ...p,
      state: p.id === best ? "best" : p.state === "visited" || p.state === "candidate" ? p.state : "normal",
    })));

    setCurrentIndex(null);
    setIsRunning(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                onClick={() => (isRunning ? setIsRunning(false) : runHillClimbing())}
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
              <svg width="100%" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet" style={{ display: "block", margin: "0 auto" }}>
                <rect x="0" y="0" width="600" height="220" fill="transparent" />
                {landscape.map((p) => {
                  const barHeight = Math.max(6, (p.value / 120) * 160);
                  const color = p.state === "best" ? "#f59e0b" : p.state === "candidate" ? "#60a5fa" : p.state === "visited" ? "#8b5cf6" : "#9ca3af";
                  const cx = p.x;
                  return (
                    <g key={p.id}>
                      <rect x={cx - 5} y={200 - barHeight} width={10} height={barHeight} fill={color} rx={3} />
                      <text x={cx} y={205} fontSize="9" textAnchor="middle" fill="#374151">{p.id}</text>
                    </g>
                  );
                })}

                {currentIndex !== null && (
                  <g>
                    <text x={landscape[currentIndex].x} y={40} fontSize="12" textAnchor="middle" fill="#111" fontWeight={700}>Actual</text>
                  </g>
                )}
                {bestIndex !== null && (
                  <g>
                    <text x={landscape[bestIndex].x} y={18} fontSize="12" textAnchor="middle" fill="#111" fontWeight={700}>Mejor</text>
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