import { useState, useEffect } from "react";

export default function AStar() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [numNodes, setNumNodes] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [startNodeId, setStartNodeId] = useState(0);
  const [endNodeId, setEndNodeId] = useState(7);
  const [executionLog, setExecutionLog] = useState([]);
  const [finalPath, setFinalPath] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);

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
        g: Infinity,
        h: 0,
        f: Infinity,
        parent: null,
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
        inPath: false,
      });
      adjacency[target].push(i);
      adjacency[i].push(target);
    }

    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (!adjacency[i].includes(j) && Math.random() < 0.3) {
          const weight = Math.floor(Math.random() * 10) + 1;
          newEdges.push({
            from: i,
            to: j,
            weight,
            active: false,
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
    setExecutionLog([]);
    setFinalPath([]);
    setTotalCost(0);
    setExecutionTime(0);
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

  const heuristic = (node1, node2) => {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy) / 20;
  };

  const getNeighbors = (nodeId, edgesList) => {
    const neighbors = [];
    edgesList.forEach((edge) => {
      if (edge.from === nodeId) {
        neighbors.push({ nodeId: edge.to, weight: edge.weight });
      } else if (edge.to === nodeId) {
        neighbors.push({ nodeId: edge.from, weight: edge.weight });
      }
    });
    return neighbors;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const reconstructPath = (nodesList, endNodeId) => {
    const path = [];
    let currentId = endNodeId;

    while (currentId !== null) {
      const node = nodesList.find((n) => n.id === currentId);
      path.unshift(node);
      currentId = node.parent;
    }

    return path;
  };

  const runAStar = async () => {
    const startTime = performance.now();
    setIsRunning(true);
    setNodesExplored(0);
    setPathLength(0);
    setExecutionLog([]);
    setFinalPath([]);
    setTotalCost(0);

    addLog(
      `Iniciando A* desde ${String.fromCharCode(
        65 + startNodeId
      )} hasta ${String.fromCharCode(65 + endNodeId)}`,
      "start"
    );

    const nodesCopy = nodes.map((n) => ({
      ...n,
      state: "unvisited",
      g: Infinity,
      h: 0,
      f: Infinity,
      parent: null,
    }));

    const edgesCopy = edges.map((e) => ({
      ...e,
      active: false,
      inPath: false,
    }));

    const startNode = nodesCopy[startNodeId];
    const endNode = nodesCopy[endNodeId];

    startNode.g = 0;
    startNode.h = heuristic(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    addLog(
      `Nodo inicial ${startNode.label}: g=0, h=${startNode.h.toFixed(
        2
      )}, f=${startNode.f.toFixed(2)}`,
      "info"
    );

    const openList = [startNodeId];
    const closedSet = new Set();

    while (openList.length > 0) {
      let currentId = openList[0];
      let minF = nodesCopy[currentId].f;

      for (let i = 1; i < openList.length; i++) {
        const nodeId = openList[i];
        if (nodesCopy[nodeId].f < minF) {
          currentId = nodeId;
          minF = nodesCopy[nodeId].f;
        }
      }

      const index = openList.indexOf(currentId);
      openList.splice(index, 1);

      const currentNode = nodesCopy[currentId];
      addLog(
        `Explorando nodo ${currentNode.label} con f=${currentNode.f.toFixed(
          2
        )}`,
        "explore"
      );

      if (currentId === endNodeId) {
        const path = reconstructPath(nodesCopy, endNodeId);
        setPathLength(path.length - 1);
        setFinalPath(path);

        let cost = 0;
        for (let i = 0; i < path.length; i++) {
          const node = path[i];
          nodesCopy[node.id].state = "path";

          if (i < path.length - 1) {
            const nextNode = path[i + 1];
            edgesCopy.forEach((edge) => {
              if (
                (edge.from === node.id && edge.to === nextNode.id) ||
                (edge.to === node.id && edge.from === nextNode.id)
              ) {
                edge.inPath = true;
                cost += edge.weight;
              }
            });
          }
        }

        setTotalCost(cost);
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);

        addLog(
          `Camino encontrado: ${path.map((n) => n.label).join(" → ")}`,
          "success"
        );
        addLog(`Costo total del camino: ${cost}`, "success");
        addLog(`Longitud del camino: ${path.length - 1} aristas`, "success");
        addLog(
          `Tiempo de ejecución: ${(endTime - startTime).toFixed(2)}ms`,
          "success"
        );

        setNodes([...nodesCopy]);
        setEdges([...edgesCopy]);
        setIsRunning(false);
        return;
      }

      closedSet.add(currentId);
      currentNode.state = "closed";
      setNodes([...nodesCopy]);
      setNodesExplored((prev) => prev + 1);
      await delay(animationSpeed);

      const neighbors = getNeighbors(currentId, edges);

      for (const { nodeId: neighborId, weight } of neighbors) {
        if (closedSet.has(neighborId)) continue;

        const neighborNode = nodesCopy[neighborId];
        const tentativeG = currentNode.g + weight;

        if (tentativeG < neighborNode.g) {
          neighborNode.parent = currentId;
          neighborNode.g = tentativeG;
          neighborNode.h = heuristic(neighborNode, endNode);
          neighborNode.f = neighborNode.g + neighborNode.h;

          addLog(
            `Actualizando ${neighborNode.label}: g=${neighborNode.g.toFixed(
              2
            )}, h=${neighborNode.h.toFixed(2)}, f=${neighborNode.f.toFixed(2)}`,
            "update"
          );

          if (!openList.includes(neighborId)) {
            openList.push(neighborId);
            neighborNode.state = "open";
          }

          edgesCopy.forEach((edge) => {
            if (
              (edge.from === currentId && edge.to === neighborId) ||
              (edge.to === currentId && edge.from === neighborId)
            ) {
              edge.active = true;
            }
          });

          setNodes([...nodesCopy]);
          setEdges([...edgesCopy]);
          await delay(animationSpeed / 2);

          edgesCopy.forEach((edge) => (edge.active = false));
          setEdges([...edgesCopy]);
        }
      }
    }

    addLog("No se encontró un camino", "error");
    setIsRunning(false);
  };

  const getNodeColor = (state, nodeId) => {
    if (nodeId === startNodeId) return "#10b981";
    if (nodeId === endNodeId) return "#ef4444";

    switch (state) {
      case "open":
        return "#60a5fa";
      case "closed":
        return "#93c5fd";
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
            A* (A-Star) Pathfinding
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Algoritmo de búsqueda del camino más corto con resultados detallados
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
                max="12"
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
                onClick={isRunning ? () => setIsRunning(false) : runAStar}
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
                {isRunning ? "Detener" : "Ejecutar A*"}
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
                  <span style={{ color: "#666" }}>Nodos explorados:</span>
                  <strong style={{ color: "#667eea" }}>{nodesExplored}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Longitud camino:</span>
                  <strong style={{ color: "#10b981" }}>{pathLength}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Costo total:</span>
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
                    id="arrowhead-normal"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#9ca3af" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#667eea" />
                  </marker>
                  <marker
                    id="arrowhead-path"
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

                  return (
                    <g key={idx}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={
                          edge.inPath
                            ? "#fbbf24"
                            : edge.active
                            ? "#667eea"
                            : "#d1d5db"
                        }
                        strokeWidth={edge.inPath ? 4 : edge.active ? 3 : 2}
                        markerEnd={`url(#${
                          edge.inPath
                            ? "arrowhead-path"
                            : edge.active
                            ? "arrowhead-active"
                            : "arrowhead-normal"
                        })`}
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
                  const isStart = node.id === startNodeId;
                  const isEnd = node.id === endNodeId;

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
                        y={node.y - 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="bold"
                      >
                        {node.label}
                      </text>
                      {node.f !== Infinity &&
                        node.state !== "unvisited" &&
                        !isStart &&
                        !isEnd && (
                          <text
                            x={node.x}
                            y={node.y + 12}
                            textAnchor="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                          >
                            f={Math.round(node.f)}
                          </text>
                        )}
                      {(isStart || isEnd) && (
                        <text
                          x={node.x}
                          y={node.y + 12}
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {isStart ? "START" : "END"}
                        </text>
                      )}
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
