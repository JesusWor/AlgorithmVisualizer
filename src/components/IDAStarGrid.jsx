import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/grid.css';

export function IDAStarGrid() {
  const ROWS = 15;
  const COLS = 20;
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState({ row: 2, col: 2 });
  const [end, setEnd] = useState({ row: 12, col: 17 });
  const [walls, setWalls] = useState(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  useEffect(() => {
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

  const handleMouseDown = (row, col) => {
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    setIsDrawing(true);
    toggleWall(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDrawing) return;
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    toggleWall(row, col);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const toggleWall = (row, col) => {
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runIDAStar = async () => {
    setRunning(true);
    setPath([]);
    setVisited(new Set());
    setIterations(0);

    let threshold = heuristic(start, end);
    const visitedGlobal = new Set();

    while (true) {
      setCurrentThreshold(threshold);
      const visitedThisIteration = new Set();
      
      const result = await search([start], 0, threshold, visitedThisIteration, visitedGlobal);
      
      if (result.found) {
        setPath(result.path);
        setRunning(false);
        return;
      }
      
      if (result.newThreshold === Infinity) {
        setRunning(false);
        return; // No path exists
      }
      
      threshold = result.newThreshold;
      setIterations(prev => prev + 1);
      await sleep(500); // Pausa entre iteraciones
    }
  };

  const search = async (currentPath, g, threshold, visitedThisIteration, visitedGlobal) => {
    const current = currentPath[currentPath.length - 1];
    const f = g + heuristic(current, end);

    if (f > threshold) {
      return { found: false, newThreshold: f };
    }

    const currentKey = `${current.row}-${current.col}`;
    visitedThisIteration.add(currentKey);
    visitedGlobal.add(currentKey);
    setVisited(new Set(visitedGlobal));
    await sleep(30);

    if (current.row === end.row && current.col === end.col) {
      return { found: true, path: currentPath };
    }

    let min = Infinity;
    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row}-${neighbor.col}`;
      
      if (visitedThisIteration.has(neighborKey)) continue;

      const newPath = [...currentPath, neighbor];
      const result = await search(newPath, g + 1, threshold, visitedThisIteration, visitedGlobal);

      if (result.found) {
        return result;
      }

      if (result.newThreshold < min) {
        min = result.newThreshold;
      }
    }

    return { found: false, newThreshold: min };
  };

  const clearPath = () => {
    setPath([]);
    setVisited(new Set());
    setCurrentThreshold(0);
    setIterations(0);
  };

  const clearAll = () => {
    setPath([]);
    setVisited(new Set());
    setWalls(new Set());
    setCurrentThreshold(0);
    setIterations(0);
  };

  const codes = {
    cpp: `#include <iostream>
#include <vector>
#include <set>
#include <cmath>
#include <algorithm>
using namespace std;

class IDAStarGrid {
public:
    int rows, cols;
    vector<vector<bool>> walls;
    pair<int, int> start, goal;
    
    IDAStarGrid(int r, int c) : rows(r), cols(c) {
        walls.resize(r, vector<bool>(c, false));
    }
    
    int heuristic(int r1, int c1, int r2, int c2) {
        return abs(r1 - r2) + abs(c1 - c2);
    }
    
    vector<pair<int, int>> getNeighbors(int row, int col) {
        vector<pair<int, int>> neighbors;
        int dr[] = {-1, 1, 0, 0};
        int dc[] = {0, 0, -1, 1};
        
        for (int i = 0; i < 4; i++) {
            int newRow = row + dr[i];
            int newCol = col + dc[i];
            
            if (newRow >= 0 && newRow < rows && 
                newCol >= 0 && newCol < cols && 
                !walls[newRow][newCol]) {
                neighbors.push_back({newRow, newCol});
            }
        }
        
        return neighbors;
    }
    
    pair<bool, int> search(vector<pair<int, int>>& path, int g, 
                          int threshold, set<pair<int, int>>& visited) {
        auto current = path.back();
        int f = g + heuristic(current.first, current.second, 
                             goal.first, goal.second);
        
        if (f > threshold) {
            return {false, f};
        }
        
        if (current == goal) {
            return {true, -1};
        }
        
        visited.insert(current);
        int min = INT_MAX;
        
        auto neighbors = getNeighbors(current.first, current.second);
        for (auto neighbor : neighbors) {
            if (visited.find(neighbor) != visited.end()) continue;
            
            path.push_back(neighbor);
            auto result = search(path, g + 1, threshold, visited);
            
            if (result.first) {
                return result;
            }
            
            path.pop_back();
            min = std::min(min, result.second);
        }
        
        visited.erase(current);
        return {false, min};
    }
    
    vector<pair<int, int>> findPath(pair<int, int> s, pair<int, int> g) {
        start = s;
        goal = g;
        
        int threshold = heuristic(start.first, start.second, 
                                 goal.first, goal.second);
        vector<pair<int, int>> path = {start};
        
        while (true) {
            set<pair<int, int>> visited;
            auto result = search(path, 0, threshold, visited);
            
            if (result.first) {
                return path;
            }
            
            if (result.second == INT_MAX) {
                return {}; // No path found
            }
            
            threshold = result.second;
        }
    }
};

int main() {
    IDAStarGrid grid(15, 20);
    
    auto path = grid.findPath({2, 2}, {12, 17});
    
    cout << "Camino encontrado: " << path.size() << " pasos" << endl;
    for (auto [r, c] : path) {
        cout << "(" << r << ", " << c << ") ";
    }
    cout << endl;
    
    return 0;
}`,
    python: `class IDAStarGrid:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.walls = set()
        self.start = None
        self.goal = None
    
    def heuristic(self, r1, c1, r2, c2):
        return abs(r1 - r2) + abs(c1 - c2)
    
    def get_neighbors(self, row, col):
        neighbors = []
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            if (0 <= new_row < self.rows and 
                0 <= new_col < self.cols and 
                (new_row, new_col) not in self.walls):
                neighbors.append((new_row, new_col))
        
        return neighbors
    
    def search(self, path, g, threshold, visited):
        current = path[-1]
        f = g + self.heuristic(current[0], current[1], 
                              self.goal[0], self.goal[1])
        
        if f > threshold:
            return False, f
        
        if current == self.goal:
            return True, -1
        
        visited.add(current)
        min_threshold = float('inf')
        
        for neighbor in self.get_neighbors(current[0], current[1]):
            if neighbor in visited:
                continue
            
            path.append(neighbor)
            found, new_threshold = self.search(path, g + 1, threshold, visited)
            
            if found:
                return True, -1
            
            path.pop()
            min_threshold = min(min_threshold, new_threshold)
        
        visited.remove(current)
        return False, min_threshold
    
    def find_path(self, start, goal):
        self.start = start
        self.goal = goal
        
        threshold = self.heuristic(start[0], start[1], goal[0], goal[1])
        path = [start]
        
        while True:
            visited = set()
            found, new_threshold = self.search(path, 0, threshold, visited)
            
            if found:
                return path
            
            if new_threshold == float('inf'):
                return []  # No path found
            
            threshold = new_threshold

# Uso
grid = IDAStarGrid(15, 20)
path = grid.find_path((2, 2), (12, 17))

print(f"Camino encontrado: {len(path)} pasos")
for r, c in path:
    print(f"({r}, {c})", end=" ")
print()`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">IDA* (Iterative Deepening A*) - Grid</h2>

      <div className="explanation-section">
        <h3>Algoritmo IDA* en Grid</h3>
        <p>
          IDA* (Iterative Deepening A*) es una variante de A* que combina la búsqueda en profundidad 
          iterativa con la función heurística de A*. Su principal ventaja es el uso óptimo de memoria.
        </p>
        <p>
          <strong>Características principales:</strong>
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li><strong>Búsqueda en profundidad:</strong> Explora el espacio de búsqueda en profundidad</li>
          <li><strong>Threshold incremental:</strong> Aumenta el límite f(n) en cada iteración</li>
          <li><strong>Uso de memoria:</strong> O(d) donde d es la profundidad de la solución</li>
          <li><strong>Garantiza optimalidad:</strong> Si la heurística es admisible</li>
        </ul>
        <p>
          Complejidad temporal: <strong>O(b^d)</strong> donde b es el factor de ramificación.
          Ventaja: Usa mucha menos memoria que A* estándar.
        </p>
      </div>

      {running && (
        <div className="stats-section" style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          marginBottom: '1rem',
          padding: '1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px'
        }}>
          <div>
            <strong>Iteración actual:</strong> <span style={{ color: '#3b82f6' }}>{iterations + 1}</span>
          </div>
          <div>
            <strong>Threshold f(n):</strong> <span style={{ color: '#10b981' }}>{currentThreshold}</span>
          </div>
        </div>
      )}

      <div className="controls">
        <button className="btn btn-primary" onClick={runIDAStar} disabled={running}>
          {running ? 'Ejecutando...' : 'Ejecutar IDA*'}
        </button>
        <button className="btn btn-secondary" onClick={clearPath} disabled={running}>
          Limpiar Camino
        </button>
        <button className="btn btn-danger" onClick={clearAll} disabled={running}>
          Limpiar Todo
        </button>
      </div>

      <div className="explanation-section" style={{ 
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '0.75rem',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          🖱️ Arrastra el mouse para dibujar muros. <strong style={{ color: '#10b981' }}>Verde</strong> = Inicio, 
          <strong style={{ color: '#ef4444' }}> Rojo</strong> = Destino, 
          <strong style={{ color: '#3b82f6' }}> Azul</strong> = Visitado, 
          <strong style={{ color: '#8b5cf6' }}> Morado</strong> = Camino
        </p>
      </div>

      {grid.length > 0 && (
        <div className="visualization-area">
          <div 
            className="grid-container"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  let cellClass = 'cell';
                  
                  if (rowIndex === start.row && colIndex === start.col) {
                    cellClass += ' start';
                  } else if (rowIndex === end.row && colIndex === end.col) {
                    cellClass += ' end';
                  } else if (walls.has(key)) {
                    cellClass += ' wall';
                  } else if (path.some(p => p.row === rowIndex && p.col === colIndex)) {
                    cellClass += ' path';
                  } else if (visited.has(key)) {
                    cellClass += ' visited';
                  }

                  return (
                    <div
                      key={colIndex}
                      className={cellClass}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {path.length > 0 && (
        <div className="explanation-section" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0 }}>
            ✨ <strong>Camino encontrado:</strong> {path.length} pasos | 
            <strong> Iteraciones totales:</strong> {iterations + 1} |
            <strong> Nodos visitados:</strong> {visited.size}
          </p>
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
            onClick={() => copyCode(codes[codeLanguage])}
          >
            Copiar
          </button>
          <pre>{codes[codeLanguage]}</pre>
        </div>
      </div>
    </div>
  );
}
