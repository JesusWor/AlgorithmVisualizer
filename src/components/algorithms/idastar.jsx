import { useState, useEffect } from "react";

export default function IDAStar() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [numNodes, setNumNodes] = useState(7);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [currentThreshold, setCurrentThreshold] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [startNodeId, setStartNodeId] = useState(0);
  const [endNodeId, setEndNodeId] = useState(6);
  const [executionLog, setExecutionLog] = useState([]);
  const [finalPath, setFinalPath] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [nodesPruned, setNodesPruned] = useState(0);
  const [thresholdHistory, setThresholdHistory] = useState([]);

  useEffect(() => {
    generateRandomGraph();
  }, [numNodes]);

  const addLog = (message, type = "info") => {
    setExecutionLog((prev) => [
      ...prev,
      { message, type, timestamp: Date.now() },
    ]);
  };

  const generateRandomGraph = () => {
    const newNodes = [];
    const positions = generateCircularLayout(numNodes);

    for (let i = 0; i < numNodes; i++) {
      newNodes.push({
        id: i,
        label: String.fromCharCode(65 + i),
        x: positions[i].x,
        y: positions[i].y,
        state: "unvisited",
      });
    }

    const newEdges = [];
    const adjacency = Array(numNodes)
      .fill(0)
      .map(() => []);

    for (let i = 1; i < numNodes; i++) {
      const target = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 10) + 1;
      newEdges.push({
        from: target,
        to: i,
        weight,
        active: false,
        pruned: false,
        inPath: false,
      });
      adjacency[target].push(i);
      adjacency[i].push(target);
    }

    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (!adjacency[i].includes(j) && Math.random() < 0.25) {
          const weight = Math.floor(Math.random() * 10) + 1;
          newEdges.push({
            from: i,
            to: j,
            weight,
            active: false,
            pruned: false,
            inPath: false,
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setStartNodeId(0);
    setEndNodeId(numNodes - 1);
    setNodesExplored(0);
    setPathLength(0);
    setCurrentThreshold(0);
    setIterations(0);
    setExecutionLog([]);
    setFinalPath([]);
    setTotalCost(0);
    setExecutionTime(0);
    setNodesPruned(0);
    setThresholdHistory([]);
  };

  const generateCircularLayout = (n) => {
    const positions = [];
    const centerX = 300;
    const centerY = 250;
    const radius = 180;

    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.push({ x, y });
    }

    return positions;
  };

  const heuristic = (nodeId1, nodeId2) => {
    const node1 = nodes[nodeId1];
    const node2 = nodes[nodeId2];
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy) / 20;
  };

  const getNeighbors = (nodeId) => {
    const neighbors = [];
    edges.forEach((edge) => {
      if (edge.from === nodeId) {
        neighbors.push({ nodeId: edge.to, weight: edge.weight });
      } else if (edge.to === nodeId) {
        neighbors.push({ nodeId: edge.from, weight: edge.weight });
      }
    });
    return neighbors;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runIDAStar = async () => {
    const startTime = performance.now();
    setIsRunning(true);
    setNodesExplored(0);
    setPathLength(0);
    setIterations(0);
    setExecutionLog([]);
    setFinalPath([]);
    setTotalCost(0);
    setNodesPruned(0);
    setThresholdHistory([]);

    addLog(
      `Iniciando IDA* desde ${String.fromCharCode(
        65 + startNodeId
      )} hasta ${String.fromCharCode(65 + endNodeId)}`,
      "start"
    );

    const nodesCopy = nodes.map((n) => ({ ...n, state: "unvisited" }));
    const edgesCopy = edges.map((e) => ({
      ...e,
      active: false,
      pruned: false,
      inPath: false,
    }));

    let threshold = heuristic(startNodeId, endNodeId);
    setCurrentThreshold(Math.round(threshold * 10) / 10);
    addLog(`Threshold inicial: ${Math.round(threshold * 10) / 10}`, "info");

    let iterCount = 0;
    const maxIterations = 20;
    const thresholds = [Math.round(threshold * 10) / 10];

    while (iterCount < maxIterations) {
      iterCount++;
      setIterations(iterCount);
      addLog(
        `--- Iteración ${iterCount} con threshold=${
          Math.round(threshold * 10) / 10
        } ---`,
        "iteration"
      );

      nodesCopy.forEach((n) => (n.state = "unvisited"));
      edgesCopy.forEach((e) => {
        e.active = false;
        e.pruned = false;
      });
      setNodes([...nodesCopy]);
      setEdges([...edgesCopy]);

      await delay(animationSpeed);

      const visited = new Set();

      const search = async (currentId, g, path) => {
        const f = g + heuristic(currentId, endNodeId);

        if (f > threshold) {
          setNodesPruned((prev) => prev + 1);
          nodesCopy[currentId].state = "pruned";

          if (path.length > 0) {
            const prevId = path[path.length - 1];
            edgesCopy.forEach((edge) => {
              if (
                (edge.from === prevId && edge.to === currentId) ||
                (edge.to === prevId && edge.from === currentId)
              ) {
                edge.pruned = true;
              }
            });
          }

          addLog(
            `Nodo ${nodesCopy[currentId].label} podado: f=${f.toFixed(
              2
            )} > threshold=${threshold.toFixed(2)}`,
            "pruned"
          );
          setNodes([...nodesCopy]);
          setEdges([...edgesCopy]);
          await delay(animationSpeed / 2);

          nodesCopy[currentId].state = "unvisited";
          if (path.length > 0) {
            edgesCopy.forEach((e) => (e.pruned = false));
          }

          return { found: false, minThreshold: f };
        }

        nodesCopy[currentId].state = "exploring";

        if (path.length > 0) {
          const prevId = path[path.length - 1];
          edgesCopy.forEach((edge) => {
            if (
              (edge.from === prevId && edge.to === currentId) ||
              (edge.to === prevId && edge.from === currentId)
            ) {
              edge.active = true;
            }
          });
        }

        addLog(
          `Explorando ${nodesCopy[currentId].label}: g=${g.toFixed(
            2
          )}, h=${heuristic(currentId, endNodeId).toFixed(2)}, f=${f.toFixed(
            2
          )}`,
          "explore"
        );
        setNodes([...nodesCopy]);
        setEdges([...edgesCopy]);
        setNodesExplored((prev) => prev + 1);
        await delay(animationSpeed);

        if (currentId === endNodeId) {
          addLog(
            `Objetivo alcanzado en ${nodesCopy[currentId].label}`,
            "success"
          );
          return { found: true, path: [...path, currentId] };
        }

        visited.add(currentId);
        let minThreshold = Infinity;

        const neighbors = getNeighbors(currentId);

        for (const { nodeId: neighborId, weight } of neighbors) {
          if (visited.has(neighborId)) continue;

          const result = await search(neighborId, g + weight, [
            ...path,
            currentId,
          ]);

          if (result.found) {
            return result;
          }

          minThreshold = Math.min(minThreshold, result.minThreshold);
        }

        visited.delete(currentId);
        nodesCopy[currentId].state = "unvisited";

        if (path.length > 0) {
          edgesCopy.forEach((e) => (e.active = false));
        }

        setNodes([...nodesCopy]);
        setEdges([...edgesCopy]);

        return { found: false, minThreshold };
      };

      const result = await search(startNodeId, 0, []);

      if (result.found) {
        setPathLength(result.path.length - 1);
        setFinalPath(result.path.map((id) => nodesCopy[id]));

        let cost = 0;
        result.path.forEach((nodeId, idx) => {
          nodesCopy[nodeId].state = "path";

          if (idx < result.path.length - 1) {
            const nextId = result.path[idx + 1];
            edgesCopy.forEach((edge) => {
              if (
                (edge.from === nodeId && edge.to === nextId) ||
                (edge.to === nodeId && edge.from === nextId)
              ) {
                edge.inPath = true;
                edge.active = false;
                edge.pruned = false;
                cost += edge.weight;
              }
            });
          }
        });

        setTotalCost(cost);
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);
        setThresholdHistory(thresholds);

        addLog(
          `Camino encontrado: ${result.path
            .map((id) => nodesCopy[id].label)
            .join(" → ")}`,
          "success"
        );
        addLog(`Costo total: ${cost}`, "success");
        addLog(`Longitud: ${result.path.length - 1} aristas`, "success");
        addLog(`Iteraciones totales: ${iterCount}`, "success");
        addLog(`Nodos explorados: ${nodesExplored}`, "success");
        addLog(`Nodos podados: ${nodesPruned}`, "success");
        addLog(`Tiempo: ${(endTime - startTime).toFixed(2)}ms`, "success");

        setNodes([...nodesCopy]);
        setEdges([...edgesCopy]);
        setIsRunning(false);
        return;
      }

      if (result.minThreshold === Infinity) {
        addLog("No se encontró camino", "error");
        setIsRunning(false);
        return;
      }

      threshold = result.minThreshold;
      thresholds.push(Math.round(threshold * 10) / 10);
      setCurrentThreshold(Math.round(threshold * 10) / 10);
      setThresholdHistory([...thresholds]);
      addLog(`Nuevo threshold: ${Math.round(threshold * 10) / 10}`, "update");
      await delay(animationSpeed * 2);
    }

    addLog("Límite de iteraciones alcanzado", "error");
    setIsRunning(false);
  };

  const getNodeColor = (state, nodeId) => {
    if (nodeId === startNodeId) return "#10b981";
    if (nodeId === endNodeId) return "#ef4444";

    switch (state) {
      case "exploring":
        return "#60a5fa";
      case "pruned":
        return "#fb923c";
      case "path":
        return "#fbbf24";
      default:
        return "#9ca3af";
    }
  };

  const getArrowEnd = (edge) => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];
    if (!fromNode || !toNode) return { x: 0, y: 0 };

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const radius = 35;

    return {
      x: toNode.x - Math.cos(angle) * radius,
      y: toNode.y - Math.sin(angle) * radius,
    };
  };

  const getMidPoint = (edge) => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];
    if (!fromNode || !toNode) return { x: 0, y: 0 };

    return {
      x: (fromNode.x + toNode.x) / 2,
      y: (fromNode.y + toNode.y) / 2,
    };
  };

  const getLogColor = (type) => {
    switch (type) {
      case "start":
        return "#667eea";
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "explore":
        return "#60a5fa";
      case "update":
        return "#f59e0b";
      case "pruned":
        return "#fb923c";
      case "iteration":
        return "#8b5cf6";
      default:
        return "#666";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
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
            IDA* (Iterative Deepening A*)
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Búsqueda en profundidad iterativa con resultados detallados
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
                Número de Nodos: {numNodes}
              </label>
              <input
                type="range"
                min="5"
                max="10"
                value={numNodes}
                onChange={(e) => setNumNodes(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: "100%" }}
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
                min="200"
                max="1500"
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
                onClick={isRunning ? () => setIsRunning(false) : runIDAStar}
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
                {isRunning ? "Detener" : "Ejecutar IDA*"}
              </button>
              <button
                onClick={generateRandomGraph}
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
                Generar Grafo
              </button>
            </div>

            <div
              style={{
                background: "#fef3c7",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                border: "2px solid #f59e0b",
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#92400e",
                }}
              >
                Threshold Actual
              </h4>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                  textAlign: "center",
                  fontFamily: "monospace",
                }}
              >
                {currentThreshold}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#92400e",
                  textAlign: "center",
                  marginTop: "0.5rem",
                }}
              >
                Iteración #{iterations}
              </div>
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
                  <span style={{ color: "#666" }}>Iteraciones:</span>
                  <strong style={{ color: "#8b5cf6" }}>{iterations}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Explorados:</span>
                  <strong style={{ color: "#667eea" }}>{nodesExplored}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Podados:</span>
                  <strong style={{ color: "#fb923c" }}>{nodesPruned}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Longitud:</span>
                  <strong style={{ color: "#10b981" }}>{pathLength}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Costo:</span>
                  <strong style={{ color: "#f59e0b" }}>{totalCost}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Tiempo:</span>
                  <strong style={{ color: "#667eea" }}>
                    {executionTime.toFixed(2)}ms
                  </strong>
                </div>
              </div>
            </div>

            {thresholdHistory.length > 0 && (
              <div
                style={{
                  background: "#e0e7ff",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.75rem",
                    color: "#4338ca",
                  }}
                >
                  Historial Thresholds
                </h4>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {thresholdHistory.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#8b5cf6",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {finalPath.length > 0 && (
              <div
                style={{
                  background: "#dcfce7",
                  borderRadius: "8px",
                  padding: "1rem",
                  border: "2px solid #10b981",
                }}
              >
                <h4
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.75rem",
                    color: "#065f46",
                  }}
                >
                  Camino Final
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {finalPath.map((node, idx) => (
                    <div
                      key={node.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#10b981",
                          color: "white",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                        }}
                      >
                        {node.label}
                      </span>
                      {idx < finalPath.length - 1 && (
                        <span style={{ color: "#065f46", fontWeight: "bold" }}>
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
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
                Grafo Ponderado
              </h3>

              <svg
                width="600"
                height="500"
                style={{ display: "block", margin: "0 auto" }}
              >
                <defs>
                  <marker
                    id="arrow-normal"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#9ca3af" />
                  </marker>
                  <marker
                    id="arrow-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                  </marker>
                  <marker
                    id="arrow-pruned"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#fb923c" />
                  </marker>
                  <marker
                    id="arrow-path"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
                  </marker>
                </defs>

                {edges.map((edge, idx) => {
                  const end = getArrowEnd(edge);
                  const mid = getMidPoint(edge);
                  const fromNode = nodes[edge.from];

                  if (!fromNode) return null;

                  let strokeColor = "#d1d5db";
                  let markerEnd = "arrow-normal";
                  let strokeWidth = 2;

                  if (edge.inPath) {
                    strokeColor = "#fbbf24";
                    markerEnd = "arrow-path";
                    strokeWidth = 4;
                  } else if (edge.active) {
                    strokeColor = "#60a5fa";
                    markerEnd = "arrow-active";
                    strokeWidth = 3;
                  } else if (edge.pruned) {
                    strokeColor = "#fb923c";
                    markerEnd = "arrow-pruned";
                    strokeWidth = 3;
                  }

                  return (
                    <g key={idx}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        markerEnd={`url(#${markerEnd})`}
                      />
                      <rect
                        x={mid.x - 15}
                        y={mid.y - 12}
                        width="30"
                        height="20"
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        rx="4"
                      />
                      <text
                        x={mid.x}
                        y={mid.y + 4}
                        textAnchor="middle"
                        fill={edge.inPath ? "#fbbf24" : "#333"}
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const color = getNodeColor(node.state, node.id);

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="35"
                        fill={color}
                        stroke="white"
                        strokeWidth="4"
                      />
                      <text
                        x={node.x}
                        y={node.y + 6}
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="bold"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                maxHeight: "400px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
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
                Log de Ejecución
              </h3>
              <div
                style={{
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {executionLog.length === 0 ? (
                  <p
                    style={{
                      color: "#999",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    Ejecuta el algoritmo para ver el log
                  </p>
                ) : (
                  executionLog.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.75rem",
                        background: "#f9fafb",
                        borderRadius: "6px",
                        borderLeft: `4px solid ${getLogColor(log.type)}`,
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        style={{
                          color: getLogColor(log.type),
                          fontWeight: "bold",
                        }}
                      >
                        [{log.type.toUpperCase()}]
                      </span>{" "}
                      <span style={{ color: "#333" }}>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
