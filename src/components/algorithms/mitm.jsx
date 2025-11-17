import { useState } from "react";

export default function MeetInMiddle() {
  const [numbers, setNumbers] = useState([3, 5, 6, 7, 8, 9]);
  const [target, setTarget] = useState(15);
  const [leftSubsets, setLeftSubsets] = useState([]);
  const [rightSubsets, setRightSubsets] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [currentLeftSubset, setCurrentLeftSubset] = useState(null);
  const [currentRightSubset, setCurrentRightSubset] = useState(null);
  const [subsetsGenerated, setSubsetsGenerated] = useState(0);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateRandomArray = () => {
    const size = 6 + Math.floor(Math.random() * 4);
    const nums = [];
    for (let i = 0; i < size; i++) {
      nums.push(Math.floor(Math.random() * 15) + 1);
    }
    setNumbers(nums);
    setTarget(Math.floor(nums.reduce((a, b) => a + b, 0) / 2));
    resetVisualization();
  };

  const resetVisualization = () => {
    setLeftSubsets([]);
    setRightSubsets([]);
    setSolutions([]);
    setCurrentLeftSubset(null);
    setCurrentRightSubset(null);
    setSubsetsGenerated(0);
  };

  const generateSubsets = (arr) => {
    const subsets = [];
    const n = arr.length;
    const totalSubsets = Math.pow(2, n);

    for (let i = 0; i < totalSubsets; i++) {
      const subset = [];
      let sum = 0;

      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          subset.push(arr[j]);
          sum += arr[j];
        }
      }

      subsets.push({ elements: subset, sum });
    }

    return subsets;
  };

  const runMeetInMiddle = async () => {
    setIsRunning(true);
    resetVisualization();

    const mid = Math.floor(numbers.length / 2);
    const left = numbers.slice(0, mid);
    const right = numbers.slice(mid);

    const leftSubs = generateSubsets(left);
    const rightSubs = generateSubsets(right);

    setLeftSubsets(leftSubs);
    setRightSubsets(rightSubs);
    setSubsetsGenerated(leftSubs.length + rightSubs.length);

    await delay(animationSpeed * 2);

    const leftMap = new Map();
    leftSubs.forEach((subset) => {
      if (!leftMap.has(subset.sum)) {
        leftMap.set(subset.sum, []);
      }
      leftMap.get(subset.sum).push(subset);
    });

    const foundSolutions = [];

    for (const rightSubset of rightSubs) {
      setCurrentRightSubset(rightSubset);
      await delay(animationSpeed);

      const needed = target - rightSubset.sum;

      if (leftMap.has(needed)) {
        const matchingLeftSubsets = leftMap.get(needed);

        for (const leftSubset of matchingLeftSubsets) {
          setCurrentLeftSubset(leftSubset);
          await delay(animationSpeed);

          foundSolutions.push({
            left: leftSubset.elements,
            right: rightSubset.elements,
            sum: target,
          });

          setSolutions([...foundSolutions]);
          await delay(animationSpeed * 2);
        }
      }
    }

    setCurrentLeftSubset(null);
    setCurrentRightSubset(null);
    setIsRunning(false);
  };

  // Calcular posiciones para visualización tipo grafo
  const getNodePosition = (index, total, side) => {
    const centerX = side === "left" ? 150 : 450;
    const centerY = 250;
    const radius = 120;
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{ textAlign: "center", marginBottom: "2rem", color: "white" }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Meet in the Middle
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Divide el problema en dos mitades y búscalas de forma independiente
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "1.5rem",
              height: "fit-content",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                color: "#333",
              }}
            >
              Controles
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#555",
                }}
              >
                Suma Objetivo: {target}
              </label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                disabled={isRunning}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#555",
                }}
              >
                Velocidad: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <button
                onClick={
                  isRunning ? () => setIsRunning(false) : runMeetInMiddle
                }
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  background: isRunning ? "#ef4444" : "#10b981",
                  color: "white",
                }}
              >
                {isRunning ? "Detener" : "Buscar Subconjuntos"}
              </button>
              <button
                onClick={generateRandomArray}
                disabled={isRunning}
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  background: "#3b82f6",
                  color: "white",
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                Generar Números
              </button>
              <button
                onClick={resetVisualization}
                disabled={isRunning}
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  background: "#f59e0b",
                  color: "white",
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                Reiniciar
              </button>
            </div>

            <div
              style={{
                background: "#f3f4f6",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  color: "#333",
                }}
              >
                Estadísticas
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Subconjuntos:</span>
                  <strong style={{ color: "#667eea" }}>
                    {subsetsGenerated}
                  </strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Soluciones:</span>
                  <strong style={{ color: "#10b981" }}>
                    {solutions.length}
                  </strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Complejidad:</span>
                  <strong style={{ color: "#f59e0b" }}>O(2^(n/2))</strong>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#e0e7ff",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  color: "#333",
                }}
              >
                Array Original
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {numbers.map((num, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background:
                        idx < Math.floor(numbers.length / 2)
                          ? "#60a5fa"
                          : "#c084fc",
                      color: "white",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "#333",
                }}
              >
                Visualización de Subconjuntos
              </h3>

              <svg
                width="600"
                height="500"
                style={{ display: "block", margin: "0 auto" }}
              >
                {/* Mitad Izquierda */}
                <g>
                  <text
                    x="150"
                    y="30"
                    textAnchor="middle"
                    fill="#60a5fa"
                    fontSize="18"
                    fontWeight="bold"
                  >
                    Mitad Izquierda
                  </text>
                  <text
                    x="150"
                    y="50"
                    textAnchor="middle"
                    fill="#666"
                    fontSize="14"
                  >
                    [
                    {numbers
                      .slice(0, Math.floor(numbers.length / 2))
                      .join(", ")}
                    ]
                  </text>

                  {leftSubsets.slice(0, 8).map((subset, idx) => {
                    const pos = getNodePosition(idx, 8, "left");
                    const isHighlighted =
                      currentLeftSubset &&
                      JSON.stringify(currentLeftSubset.elements) ===
                        JSON.stringify(subset.elements);

                    return (
                      <g key={`left-${idx}`}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isHighlighted ? 35 : 30}
                          fill={isHighlighted ? "#10b981" : "#60a5fa"}
                          stroke="white"
                          strokeWidth="3"
                        />
                        <text
                          x={pos.x}
                          y={pos.y - 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          [{subset.elements.join(",")}]
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + 10}
                          textAnchor="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          Σ={subset.sum}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Mitad Derecha */}
                <g>
                  <text
                    x="450"
                    y="30"
                    textAnchor="middle"
                    fill="#c084fc"
                    fontSize="18"
                    fontWeight="bold"
                  >
                    Mitad Derecha
                  </text>
                  <text
                    x="450"
                    y="50"
                    textAnchor="middle"
                    fill="#666"
                    fontSize="14"
                  >
                    [{numbers.slice(Math.floor(numbers.length / 2)).join(", ")}]
                  </text>

                  {rightSubsets.slice(0, 8).map((subset, idx) => {
                    const pos = getNodePosition(idx, 8, "right");
                    const isHighlighted =
                      currentRightSubset &&
                      JSON.stringify(currentRightSubset.elements) ===
                        JSON.stringify(subset.elements);

                    return (
                      <g key={`right-${idx}`}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isHighlighted ? 35 : 30}
                          fill={isHighlighted ? "#10b981" : "#c084fc"}
                          stroke="white"
                          strokeWidth="3"
                        />
                        <text
                          x={pos.x}
                          y={pos.y - 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          [{subset.elements.join(",")}]
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + 10}
                          textAnchor="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          Σ={subset.sum}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Línea divisoria */}
                <line
                  x1="300"
                  y1="80"
                  x2="300"
                  y2="420"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Indicador de objetivo */}
                <rect
                  x="250"
                  y="450"
                  width="100"
                  height="40"
                  fill="#667eea"
                  rx="8"
                />
                <text
                  x="300"
                  y="465"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Objetivo
                </text>
                <text
                  x="300"
                  y="482"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                >
                  {target}
                </text>
              </svg>
            </div>

            {solutions.length > 0 && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    color: "#333",
                  }}
                >
                  Soluciones Encontradas ({solutions.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {solutions.map((solution, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#f9fafb",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: "2px solid #10b981",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: "#666" }}>
                          Izq:
                        </span>
                        {solution.left.map((num, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "#60a5fa",
                              color: "white",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            {num}
                          </span>
                        ))}
                        <span style={{ margin: "0 0.5rem", color: "#666" }}>
                          +
                        </span>
                        <span style={{ fontWeight: "bold", color: "#666" }}>
                          Der:
                        </span>
                        {solution.right.map((num, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "#c084fc",
                              color: "white",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            {num}
                          </span>
                        ))}
                        <span style={{ margin: "0 0.5rem", color: "#666" }}>
                          =
                        </span>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "#10b981",
                            color: "white",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {solution.sum}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "2rem",
            marginTop: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#333",
            }}
          >
            Meet in the Middle
          </h3>
          <div style={{ color: "#555", lineHeight: "1.8" }}>
            <h4
              style={{
                fontWeight: "bold",
                marginTop: "1rem",
                color: "#667eea",
              }}
            >
              Concepto
            </h4>
            <p>
              Técnica que reduce la complejidad exponencial dividiendo el
              problema en dos mitades y buscando soluciones desde ambos extremos
              simultáneamente.
            </p>

            <h4
              style={{
                fontWeight: "bold",
                marginTop: "1rem",
                color: "#667eea",
              }}
            >
              Algoritmo para Subset Sum
            </h4>
            <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Dividir el array en dos mitades: izquierda y derecha</li>
              <li>
                Generar todos los subconjuntos de la mitad izquierda (2^(n/2))
              </li>
              <li>Almacenar sumas en un mapa hash para búsqueda O(1)</li>
              <li>
                Para cada subconjunto de la derecha, buscar complemento en el
                mapa
              </li>
              <li>Si suma_izq + suma_der = objetivo, encontramos solución</li>
            </ol>

            <h4
              style={{
                fontWeight: "bold",
                marginTop: "1rem",
                color: "#667eea",
              }}
            >
              Mejora de Complejidad
            </h4>
            <p>
              <strong>Búsqueda Exhaustiva:</strong> O(2^n) - Impracticable para
              n &gt 20
              <br />
              <strong>Meet in the Middle:</strong> O(2^(n/2)) - Manejable hasta
              n ≈ 40
              <br />
              <strong>Ejemplo:</strong> Para n=20, reduce de ~1M a ~1K
              operaciones por lado
            </p>

            <h4
              style={{
                fontWeight: "bold",
                marginTop: "1rem",
                color: "#667eea",
              }}
            >
              Aplicaciones
            </h4>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li>Problema de la mochila (Knapsack)</li>
              <li>Criptografía: ataques de cumpleaños</li>
              <li>Búsqueda bidireccional en grafos</li>
              <li>Problemas de optimización combinatoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
