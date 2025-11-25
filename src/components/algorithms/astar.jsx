import { useState, useEffect, useRef } from "react";

export default function AStar() {
  const [viewMode, setViewMode] = useState("graph");
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [executionLog, setExecutionLog] = useState([]);

  // Estados para GRAFO
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [numNodes, setNumNodes] = useState(8);
  const [startNodeId, setStartNodeId] = useState(0);
  const [endNodeId, setEndNodeId] = useState(7);

  // Estados para GRID
  const GRID_SIZE = 20;
  const [grid, setGrid] = useState([]);
  const [startPos, setStartPos] = useState({ row: 2, col: 2 });
  const [endPos, setEndPos] = useState({ row: 17, col: 17 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);

  useEffect(() => {
    if (viewMode === "graph") {
      generateRandomGraph();
    } else {
      initializeGrid();
    }
  }, [viewMode, numNodes]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const addLog = (message, type = "info") => {
    setExecutionLog((prev) => [
      ...prev,
      { message, type, timestamp: Date.now() },
    ]);
  };

  // ============ FUNCIONES PARA GRAFO ============
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
    resetStats();
  };

  const heuristicGraph = (node1, node2) => {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy) / 20;
  };

  const getNeighborsGraph = (nodeId, edgesList) => {
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

  // ============ FUNCIONES PARA GRID ============
  const initializeGrid = () => {
    const newGrid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid.push({
          row,
          col,
          isWall: false,
          isStart: row === startPos.row && col === startPos.col,
          isEnd: row === endPos.row && col === endPos.col,
          isOpen: false,
          isClosed: false,
          isPath: false,
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
        });
      }
    }
    setGrid(newGrid);
    resetStats();
  };

  const generateRandomGrid = () => {
    const newGrid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const isStartCell = row === startPos.row && col === startPos.col;
        const isEndCell = row === endPos.row && col === endPos.col;
        const isWall = !isStartCell && !isEndCell && Math.random() < 0.25;

        newGrid.push({
          row,
          col,
          isWall,
          isStart: isStartCell,
          isEnd: isEndCell,
          isOpen: false,
          isClosed: false,
          isPath: false,
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
        });
      }
    }
    setGrid(newGrid);
    resetStats();
  };

  const heuristicGrid = (cell1, cell2) => {
    return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
  };

  const getNeighborsGrid = (cell, gridArray) => {
    const neighbors = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    directions.forEach((dir) => {
      const newRow = cell.row + dir.row;
      const newCol = cell.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        const neighbor = gridArray.find(
          (c) => c.row === newRow && c.col === newCol
        );
        if (neighbor && !neighbor.isWall) {
          neighbors.push(neighbor);
        }
      }
    });
    return neighbors;
  };

  const handleCellClick = (cell) => {
    if (isRunning || cell.isStart || cell.isEnd) return;
    const newGrid = [...grid];
    const index = cell.row * GRID_SIZE + cell.col;
    newGrid[index] = { ...newGrid[index], isWall: !newGrid[index].isWall };
    setGrid(newGrid);
  };

  const handleMouseDown = (cell) => {
    if (isRunning) return;
    setIsDragging(true);
    if (cell.isStart) {
      setDragType("start");
    } else if (cell.isEnd) {
      setDragType("end");
    } else {
      setDragType(cell.isWall ? "erase" : "wall");
      handleCellClick(cell);
    }
  };

  const handleMouseEnter = (cell) => {
    if (!isDragging || isRunning) return;

    const newGrid = [...grid];

    if (dragType === "start" && !cell.isWall && !cell.isEnd) {
      setStartPos({ row: cell.row, col: cell.col });
      for (let i = 0; i < newGrid.length; i++) {
        newGrid[i] = {
          ...newGrid[i],
          isStart: newGrid[i].row === cell.row && newGrid[i].col === cell.col,
        };
      }
      setGrid(newGrid);
    } else if (dragType === "end" && !cell.isWall && !cell.isStart) {
      setEndPos({ row: cell.row, col: cell.col });
      for (let i = 0; i < newGrid.length; i++) {
        newGrid[i] = {
          ...newGrid[i],
          isEnd: newGrid[i].row === cell.row && newGrid[i].col === cell.col,
        };
      }
      setGrid(newGrid);
    } else if (dragType === "wall" && !cell.isStart && !cell.isEnd) {
      const index = cell.row * GRID_SIZE + cell.col;
      newGrid[index] = { ...newGrid[index], isWall: true };
      setGrid(newGrid);
    } else if (dragType === "erase" && !cell.isStart && !cell.isEnd) {
      const index = cell.row * GRID_SIZE + cell.col;
      newGrid[index] = { ...newGrid[index], isWall: false };
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  // ============ FUNCIONES COMUNES ============
  const resetStats = () => {
    setNodesExplored(0);
    setPathLength(0);
    setTotalCost(0);
    setExecutionTime(0);
    setExecutionLog([]);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runAStar = async () => {
    if (viewMode === "graph") {
      await runAStarGraph();
    } else {
      await runAStarGrid();
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    addLog("Ejecución detenida por el usuario", "error");
  };

  // ============ A* PARA GRAFO ============
  const runAStarGraph = async () => {
    const startTime = performance.now();
    setIsRunning(true);
    isRunningRef.current = true;
    resetStats();
    addLog(
      `Iniciando A* en Grafo desde ${String.fromCharCode(
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
    startNode.h = heuristicGraph(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    const openList = [startNodeId];
    const closedSet = new Set();

    while (openList.length > 0 && isRunningRef.current) {
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

      if (currentId === endNodeId) {
        const path = reconstructPathGraph(nodesCopy, endNodeId);
        setPathLength(path.length - 1);

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

          setNodes([...nodesCopy]);
          setEdges([...edgesCopy]);
          await delay(animationSpeed);
        }

        setTotalCost(cost);
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);

        addLog(
          `Camino encontrado: ${path.map((n) => n.label).join(" → ")}`,
          "success"
        );
        addLog(`Costo total: ${cost}`, "success");
        addLog(`Tiempo: ${(endTime - startTime).toFixed(2)}ms`, "success");

        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      closedSet.add(currentId);
      currentNode.state = "closed";
      setNodes([...nodesCopy]);
      setNodesExplored((prev) => prev + 1);
      await delay(animationSpeed);

      if (!isRunningRef.current) break;

      const neighbors = getNeighborsGraph(currentId, edges);

      for (const { nodeId: neighborId, weight } of neighbors) {
        if (!isRunningRef.current) break;
        if (closedSet.has(neighborId)) continue;

        const neighborNode = nodesCopy[neighborId];
        const tentativeG = currentNode.g + weight;

        if (tentativeG < neighborNode.g) {
          neighborNode.parent = currentId;
          neighborNode.g = tentativeG;
          neighborNode.h = heuristicGraph(neighborNode, endNode);
          neighborNode.f = neighborNode.g + neighborNode.h;

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

    if (isRunningRef.current) {
      addLog("No se encontró camino", "error");
    }
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const reconstructPathGraph = (nodesList, endNodeId) => {
    const path = [];
    let currentId = endNodeId;

    while (currentId !== null) {
      const node = nodesList.find((n) => n.id === currentId);
      path.unshift(node);
      currentId = node.parent;
    }

    return path;
  };

  // ============ A* PARA GRID ============
  const runAStarGrid = async () => {
    const startTime = performance.now();
    setIsRunning(true);
    isRunningRef.current = true;
    resetStats();
    addLog(
      `Iniciando A* en Grid desde (${startPos.row},${startPos.col}) hasta (${endPos.row},${endPos.col})`,
      "start"
    );

    const gridCopy = grid.map((cell) => ({
      ...cell,
      isOpen: false,
      isClosed: false,
      isPath: false,
      g: Infinity,
      h: 0,
      f: Infinity,
      parent: null,
    }));

    const startCell = gridCopy.find((c) => c.isStart);
    const endCell = gridCopy.find((c) => c.isEnd);

    startCell.g = 0;
    startCell.h = heuristicGrid(startCell, endCell);
    startCell.f = startCell.g + startCell.h;

    const openList = [startCell];
    const closedList = [];

    while (openList.length > 0 && isRunningRef.current) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();

      current.isClosed = true;
      current.isOpen = false;
      closedList.push(current);
      setNodesExplored((prev) => prev + 1);

      setGrid([...gridCopy]);
      await delay(animationSpeed);

      if (!isRunningRef.current) break;

      if (current === endCell) {
        const path = reconstructPathGrid(endCell);
        setPathLength(path.length);
        setTotalCost(path.length - 1);

        for (const cell of path) {
          if (!cell.isStart && !cell.isEnd) {
            cell.isPath = true;
            setGrid([...gridCopy]);
            await delay(animationSpeed / 4);
          }
        }

        const endTime = performance.now();
        setExecutionTime(endTime - startTime);

        addLog(`Camino encontrado con ${path.length - 1} pasos`, "success");
        addLog(`Tiempo: ${(endTime - startTime).toFixed(2)}ms`, "success");

        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      const neighbors = getNeighborsGrid(current, gridCopy);

      for (const neighbor of neighbors) {
        if (!isRunningRef.current) break;
        if (closedList.includes(neighbor)) continue;

        const tentativeG = current.g + 1;

        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
          neighbor.isOpen = true;
        } else if (tentativeG >= neighbor.g) {
          continue;
        }

        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristicGrid(neighbor, endCell);
        neighbor.f = neighbor.g + neighbor.h;

        setGrid([...gridCopy]);
        await delay(animationSpeed / 4);
      }
    }

    if (isRunningRef.current) {
      addLog("No se encontró camino", "error");
    }
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const reconstructPathGrid = (endCell) => {
    const path = [];
    let current = endCell;
    while (current !== null) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  };

  // ============ RENDER HELPERS ============
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

  const getCellStyle = (cell) => {
    let backgroundColor = "rgba(255, 255, 255, 0.2)";

    if (cell.isStart) backgroundColor = "#10b981";
    else if (cell.isEnd) backgroundColor = "#ef4444";
    else if (cell.isPath) backgroundColor = "#fbbf24";
    else if (cell.isWall) backgroundColor = "#1f2937";
    else if (cell.isClosed) backgroundColor = "#93c5fd";
    else if (cell.isOpen) backgroundColor = "#bfdbfe";

    return { backgroundColor };
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
            Algoritmo de búsqueda del camino más corto
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
                Modo de Visualización
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setViewMode("graph")}
                  disabled={isRunning}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: viewMode === "graph" ? "#667eea" : "#e5e7eb",
                    background: viewMode === "graph" ? "#667eea" : "white",
                    color: viewMode === "graph" ? "white" : "#666",
                    fontWeight: "600",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.5 : 1,
                  }}
                >
                  Grafo
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  disabled={isRunning}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: viewMode === "grid" ? "#667eea" : "#e5e7eb",
                    background: viewMode === "grid" ? "#667eea" : "white",
                    color: viewMode === "grid" ? "white" : "#666",
                    fontWeight: "600",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.5 : 1,
                  }}
                >
                  Grid
                </button>
              </div>
            </div>

            {viewMode === "graph" && (
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
            )}

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
                min="50"
                max="1000"
                step="50"
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
                onClick={isRunning ? stopExecution : runAStar}
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
                onClick={
                  viewMode === "graph"
                    ? generateRandomGraph
                    : generateRandomGrid
                }
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
                {viewMode === "graph" ? "Generar Grafo" : "Generar Obstáculos"}
              </button>
              {viewMode === "grid" && (
                <button
                  onClick={initializeGrid}
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
                  Limpiar Grid
                </button>
              )}
            </div>

            <div
              style={{
                background: "#f3f4f6",
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
                {viewMode === "graph" ? "Grafo Ponderado" : "Grid de Búsqueda"}
              </h3>

              {viewMode === "graph" ? (
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
              ) : (
                <div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    Click para agregar/quitar obstáculos. Arrastra inicio/final
                    para moverlos.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                      gap: "2px",
                      background: "#e5e7eb",
                      padding: "2px",
                      borderRadius: "8px",
                      maxWidth: "700px",
                      margin: "0 auto",
                    }}
                    onMouseLeave={handleMouseUp}
                  >
                    {grid.map((cell, index) => (
                      <div
                        key={index}
                        style={{
                          ...getCellStyle(cell),
                          aspectRatio: "1",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "white",
                          userSelect: "none",
                        }}
                        onMouseDown={() => handleMouseDown(cell)}
                        onMouseEnter={() => handleMouseEnter(cell)}
                        onMouseUp={handleMouseUp}
                      >
                        {cell.isStart && "S"}
                        {cell.isEnd && "E"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                maxHeight: "300px",
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
