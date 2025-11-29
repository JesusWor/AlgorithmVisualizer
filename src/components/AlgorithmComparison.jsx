import { useState } from 'react';
import '../styles/common.css';
import '../styles/comparison.css';

export function AlgorithmComparison() {
  const ROWS = 12;
  const COLS = 20;
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState({ row: 2, col: 2 });
  const [end, setEnd] = useState({ row: 9, col: 17 });
  const [walls, setWalls] = useState(new Set());
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  useState(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push({ row, col });
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
  };

  const heuristic = (a, b) => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  const getNeighbors = (node) => {
    const neighbors = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];

    for (const dir of directions) {
      const newRow = node.row + dir.row;
      const newCol = node.col + dir.col;

      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
        const key = `${newRow}-${newCol}`;
        if (!walls.has(key)) {
          neighbors.push({ row: newRow, col: newCol });
        }
      }
    }
    return neighbors;
  };

  const runAStar = () => {
    const startTime = performance.now();
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.row}-${start.col}`, 0);
    fScore.set(`${start.row}-${start.col}`, heuristic(start, end));

    const visitedNodes = new Set();
    let nodesExplored = 0;

    while (openSet.length > 0) {
      openSet.sort((a, b) => {
        const aKey = `${a.row}-${a.col}`;
        const bKey = `${b.row}-${b.col}`;
        return (fScore.get(aKey) || Infinity) - (fScore.get(bKey) || Infinity);
      });

      const current = openSet.shift();
      const currentKey = `${current.row}-${current.col}`;

      if (visitedNodes.has(currentKey)) continue;
      visitedNodes.add(currentKey);
      nodesExplored++;

      if (current.row === end.row && current.col === end.col) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = cameFrom.get(key);
        }
        const endTime = performance.now();
        return {
          path,
          nodesExplored,
          time: (endTime - startTime).toFixed(2),
          pathLength: path.length
        };
      }

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        const tentativeGScore = (gScore.get(currentKey) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));

          if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    const endTime = performance.now();
    return {
      path: [],
      nodesExplored,
      time: (endTime - startTime).toFixed(2),
      pathLength: 0
    };
  };

  const runDijkstra = () => {
    const startTime = performance.now();
    const distances = new Map();
    const previous = new Map();
    const unvisited = [];
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const key = `${row}-${col}`;
        if (!walls.has(key)) {
          distances.set(key, Infinity);
          unvisited.push({ row, col });
        }
      }
    }

    const startKey = `${start.row}-${start.col}`;
    distances.set(startKey, 0);
    let nodesExplored = 0;

    while (unvisited.length > 0) {
      unvisited.sort((a, b) => {
        const aKey = `${a.row}-${a.col}`;
        const bKey = `${b.row}-${b.col}`;
        return (distances.get(aKey) || Infinity) - (distances.get(bKey) || Infinity);
      });

      const current = unvisited.shift();
      const currentKey = `${current.row}-${current.col}`;
      nodesExplored++;

      if (current.row === end.row && current.col === end.col) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = previous.get(key);
        }
        const endTime = performance.now();
        return {
          path,
          nodesExplored,
          time: (endTime - startTime).toFixed(2),
          pathLength: path.length
        };
      }

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        const alt = (distances.get(currentKey) || Infinity) + 1;

        if (alt < (distances.get(neighborKey) || Infinity)) {
          distances.set(neighborKey, alt);
          previous.set(neighborKey, current);
        }
      }
    }

    const endTime = performance.now();
    return {
      path: [],
      nodesExplored,
      time: (endTime - startTime).toFixed(2),
      pathLength: 0
    };
  };

  const runBFS = () => {
    const startTime = performance.now();
    const queue = [start];
    const visited = new Set();
    const previous = new Map();
    let nodesExplored = 0;

    const startKey = `${start.row}-${start.col}`;
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = `${current.row}-${current.col}`;
      nodesExplored++;

      if (current.row === end.row && current.col === end.col) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = previous.get(key);
        }
        const endTime = performance.now();
        return {
          path,
          nodesExplored,
          time: (endTime - startTime).toFixed(2),
          pathLength: path.length
        };
      }

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          previous.set(neighborKey, current);
          queue.push(neighbor);
        }
      }
    }

    const endTime = performance.now();
    return {
      path: [],
      nodesExplored,
      time: (endTime - startTime).toFixed(2),
      pathLength: 0
    };
  };

  const runGreedy = () => {
    const startTime = performance.now();
    const openSet = [start];
    const visited = new Set();
    const previous = new Map();
    let nodesExplored = 0;

    while (openSet.length > 0) {
      openSet.sort((a, b) => heuristic(a, end) - heuristic(b, end));
      
      const current = openSet.shift();
      const currentKey = `${current.row}-${current.col}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      nodesExplored++;

      if (current.row === end.row && current.col === end.col) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = previous.get(key);
        }
        const endTime = performance.now();
        return {
          path,
          nodesExplored,
          time: (endTime - startTime).toFixed(2),
          pathLength: path.length
        };
      }

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey)) {
          previous.set(neighborKey, current);
          openSet.push(neighbor);
        }
      }
    }

    const endTime = performance.now();
    return {
      path: [],
      nodesExplored,
      time: (endTime - startTime).toFixed(2),
      pathLength: 0
    };
  };

  const compareAll = () => {
    setRunning(true);
    const aStarResult = runAStar();
    const dijkstraResult = runDijkstra();
    const bfsResult = runBFS();
    const greedyResult = runGreedy();

    setResults({
      'A*': aStarResult,
      'Dijkstra': dijkstraResult,
      'BFS': bfsResult,
      'Greedy Best-First': greedyResult
    });
    setRunning(false);
  };

  const clearResults = () => {
    setResults({});
    setWalls(new Set());
    initializeGrid();
  };

  const handleMouseDown = (row, col) => {
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    const key = `${row}-${col}`;
    setWalls(prev => {
      const newWalls = new Set(prev);
      if (newWalls.has(key)) {
        newWalls.delete(key);
      } else {
        newWalls.add(key);
      }
      return newWalls;
    });
  };

  const comparisonCode = {
    cpp: `// Comparación de algoritmos de búsqueda de caminos
// Este ejemplo muestra las diferencias clave entre los algoritmos

// A* - Usa costo real + heurística
// Complejidad: O((V+E) log V) con heap binario
// Garantiza camino óptimo si heurística es admisible

// Dijkstra - Usa solo costo real
// Complejidad: O((V+E) log V) con heap binario
// Siempre garantiza camino óptimo

// BFS - Búsqueda por niveles
// Complejidad: O(V + E)
// Garantiza camino óptimo en grafos no ponderados

// Greedy Best-First - Usa solo heurística
// Complejidad: O(b^m) donde b es el factor de ramificación
// No garantiza camino óptimo, pero puede ser rápido`,

    python: `# Comparación de algoritmos de búsqueda de caminos
# Este ejemplo muestra las diferencias clave entre los algoritmos

# A* - Usa costo real + heurística
# Complejidad: O((V+E) log V) con heap
# Garantiza camino óptimo si heurística es admisible

# Dijkstra - Usa solo costo real
# Complejidad: O((V+E) log V) con heap
# Siempre garantiza camino óptimo

# BFS - Búsqueda por niveles
# Complejidad: O(V + E)
# Garantiza camino óptimo en grafos no ponderados

# Greedy Best-First - Usa solo heurística
# Complejidad: O(b^m) donde b es el factor de ramificación
# No garantiza camino óptimo, pero puede ser rápido`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Comparación de Algoritmos de Búsqueda</h2>

      <div className="explanation-section">
        <h3>Comparación de Algoritmos</h3>
        <p>
          Esta herramienta te permite comparar el rendimiento de diferentes algoritmos de búsqueda 
          de caminos en el mismo problema. Los algoritmos incluidos son:
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li><strong>A*:</strong> Combina costo real con heurística. Óptimo y eficiente.</li>
          <li><strong>Dijkstra:</strong> Busca el camino más corto sin heurística. Siempre óptimo.</li>
          <li><strong>BFS:</strong> Búsqueda por anchura. Simple y óptimo en grafos no ponderados.</li>
          <li><strong>Greedy Best-First:</strong> Solo usa heurística. Rápido pero no garantiza optimalidad.</li>
        </ul>
        <p>
          <strong>Instrucciones:</strong> Haz clic en las celdas para agregar/quitar muros, luego compara los algoritmos.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={compareAll} disabled={running}>
          {running ? 'Comparando...' : 'Comparar Todos'}
        </button>
        <button className="btn btn-secondary" onClick={clearResults}>
          Limpiar
        </button>
      </div>

      {grid.length > 0 && (
        <div className="visualization-area">
          <div className="grid-container">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  let cellClass = 'cell';
                  if (rowIndex === start.row && colIndex === start.col) cellClass += ' start';
                  else if (rowIndex === end.row && colIndex === end.col) cellClass += ' end';
                  else if (walls.has(key)) cellClass += ' wall';

                  return (
                    <div
                      key={colIndex}
                      className={cellClass}
                      onClick={() => handleMouseDown(rowIndex, colIndex)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="results-section">
          <h3 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Resultados de la Comparación</h3>
          <div className="results-grid">
            {Object.entries(results).map(([algorithm, result]) => (
              <div key={algorithm} className="result-card">
                <h4>{algorithm}</h4>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Tiempo:</span>
                    <span className="stat-value">{result.time} ms</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Nodos Explorados:</span>
                    <span className="stat-value">{result.nodesExplored}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Longitud del Camino:</span>
                    <span className="stat-value">{result.pathLength}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Éxito:</span>
                    <span className={`stat-value ${result.pathLength > 0 ? 'success' : 'fail'}`}>
                      {result.pathLength > 0 ? '✓ Encontrado' : '✗ No encontrado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="code-section">
        <div className="code-tabs">
          <button
            className={`code-tab ${codeLanguage === 'cpp' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('cpp')}
          >
            C++
          </button>
          <button
            className={`code-tab ${codeLanguage === 'python' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('python')}
          >
            Python
          </button>
        </div>
        <div className="code-block">
          <button
            className="copy-btn"
            onClick={() => copyCode(comparisonCode[codeLanguage])}
          >
            Copiar
          </button>
          <pre>{comparisonCode[codeLanguage]}</pre>
        </div>
      </div>
    </div>
  );
}
