import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/grid.css';

export function AStarGrid() {
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

  const runAStar = async () => {
    setRunning(true);
    setPath([]);
    setVisited(new Set());

    const openSet = [{ ...start, g: 0, f: heuristic(start, end) }];
    const openSetKeys = new Set([`${start.row}-${start.col}`]);
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const visitedSet = new Set();

    const startKey = `${start.row}-${start.col}`;
    gScore.set(startKey, 0);

    while (openSet.length > 0) {
      // Encontrar el nodo con menor f-score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet[currentIndex];
      const currentKey = `${current.row}-${current.col}`;

      // Verificar si llegamos al destino
      if (current.row === end.row && current.col === end.col) {
        const finalPath = [];
        let temp = { row: current.row, col: current.col };
        while (temp) {
          finalPath.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = cameFrom.get(key);
        }
        setPath(finalPath);
        setRunning(false);
        return;
      }

      // Remover current de openSet
      openSet.splice(currentIndex, 1);
      openSetKeys.delete(currentKey);
      closedSet.add(currentKey);

      // Visualizar nodo visitado
      visitedSet.add(currentKey);
      setVisited(new Set(visitedSet));
      await sleep(30);

      // Explorar vecinos
      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;

        // Saltar si ya fue procesado
        if (closedSet.has(neighborKey)) continue;

        const tentativeG = gScore.get(currentKey) + 1;

        // Si no hemos visitado este vecino o encontramos un mejor camino
        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, { row: current.row, col: current.col });
          gScore.set(neighborKey, tentativeG);
          
          const h = heuristic(neighbor, end);
          const f = tentativeG + h;

          // Si no está en openSet, agregarlo
          if (!openSetKeys.has(neighborKey)) {
            openSet.push({ ...neighbor, g: tentativeG, f: f });
            openSetKeys.add(neighborKey);
          } else {
            // Actualizar el f-score si ya está en openSet
            const idx = openSet.findIndex(n => n.row === neighbor.row && n.col === neighbor.col);
            if (idx !== -1) {
              openSet[idx].g = tentativeG;
              openSet[idx].f = f;
            }
          }
        }
      }
    }

    // No se encontró camino
    setRunning(false);
  };

  const clearPath = () => {
    setPath([]);
    setVisited(new Set());
  };

  const clearAll = () => {
    setPath([]);
    setVisited(new Set());
    setWalls(new Set());
  };

  const codes = {
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <cmath>
#include <algorithm>
using namespace std;

struct Node {
    int row, col;
    int g, h, f;
    
    bool operator>(const Node& other) const {
        return f > other.f;
    }
};

class AStarGrid {
public:
    int rows, cols;
    vector<vector<bool>> walls;
    
    AStarGrid(int r, int c) : rows(r), cols(c) {
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
    
    vector<pair<int, int>> findPath(int startR, int startC, int endR, int endC) {
        priority_queue<Node, vector<Node>, greater<Node>> openSet;
        map<pair<int, int>, pair<int, int>> cameFrom;
        map<pair<int, int>, int> gScore;
        
        Node startNode = {startR, startC, 0, heuristic(startR, startC, endR, endC), 0};
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);
        gScore[{startR, startC}] = 0;
        
        while (!openSet.empty()) {
            Node current = openSet.top();
            openSet.pop();
            
            if (current.row == endR && current.col == endC) {
                // Reconstruir camino
                vector<pair<int, int>> path;
                pair<int, int> pos = {endR, endC};
                while (cameFrom.find(pos) != cameFrom.end()) {
                    path.push_back(pos);
                    pos = cameFrom[pos];
                }
                path.push_back({startR, startC});
                reverse(path.begin(), path.end());
                return path;
            }
            
            auto neighbors = getNeighbors(current.row, current.col);
            for (auto [nr, nc] : neighbors) {
                int tentativeG = current.g + 1;
                
                if (gScore.find({nr, nc}) == gScore.end() || 
                    tentativeG < gScore[{nr, nc}]) {
                    cameFrom[{nr, nc}] = {current.row, current.col};
                    gScore[{nr, nc}] = tentativeG;
                    
                    Node neighbor = {nr, nc, tentativeG, 
                                   heuristic(nr, nc, endR, endC), 0};
                    neighbor.f = neighbor.g + neighbor.h;
                    openSet.push(neighbor);
                }
            }
        }
        
        return {}; // No path found
    }
};

int main() {
    AStarGrid grid(15, 20);
    
    // Agregar algunos muros
    grid.walls[5][5] = true;
    grid.walls[5][6] = true;
    
    auto path = grid.findPath(2, 2, 12, 17);
    
    cout << "Camino encontrado: " << path.size() << " pasos" << endl;
    for (auto [r, c] : path) {
        cout << "(" << r << ", " << c << ") ";
    }
    cout << endl;
    
    return 0;
}`,
    python: `import heapq
from typing import List, Tuple, Set

class Node:
    def __init__(self, row, col, g, h):
        self.row = row
        self.col = col
        self.g = g
        self.h = h
        self.f = g + h
    
    def __lt__(self, other):
        return self.f < other.f

class AStarGrid:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.walls = set()
    
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
    
    def find_path(self, start_r, start_c, end_r, end_c):
        open_set = []
        start_node = Node(start_r, start_c, 0, 
                         self.heuristic(start_r, start_c, end_r, end_c))
        heapq.heappush(open_set, start_node)
        
        came_from = {}
        g_score = {(start_r, start_c): 0}
        
        while open_set:
            current = heapq.heappop(open_set)
            
            if current.row == end_r and current.col == end_c:
                # Reconstruir camino
                path = []
                pos = (end_r, end_c)
                while pos in came_from:
                    path.append(pos)
                    pos = came_from[pos]
                path.append((start_r, start_c))
                path.reverse()
                return path
            
            for nr, nc in self.get_neighbors(current.row, current.col):
                tentative_g = current.g + 1
                
                if (nr, nc) not in g_score or tentative_g < g_score[(nr, nc)]:
                    came_from[(nr, nc)] = (current.row, current.col)
                    g_score[(nr, nc)] = tentative_g
                    
                    neighbor = Node(nr, nc, tentative_g,
                                  self.heuristic(nr, nc, end_r, end_c))
                    heapq.heappush(open_set, neighbor)
        
        return []  # No path found

# Uso
grid = AStarGrid(15, 20)

# Agregar algunos muros
grid.walls.add((5, 5))
grid.walls.add((5, 6))

path = grid.find_path(2, 2, 12, 17)

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
      <h2 className="section-title">A* Pathfinding - Grid</h2>

      <div className="explanation-section">
        <h3>Algoritmo A* en Grid</h3>
        <p>
          A* es un algoritmo de búsqueda del camino más corto que utiliza una heurística para 
          guiar la búsqueda de manera eficiente. Combina las ventajas de Dijkstra (garantiza 
          optimalidad) con la eficiencia de Greedy Best-First Search.
        </p>
        <p>
          <strong>Función de evaluación:</strong> f(n) = g(n) + h(n)
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li><strong>g(n):</strong> Costo real desde el inicio hasta n</li>
          <li><strong>h(n):</strong> Estimación heurística desde n hasta el destino (Distancia Manhattan)</li>
          <li><strong>f(n):</strong> Estimación del costo total del camino</li>
        </ul>
        <p>
          Complejidad: <strong>O((V+E) log V)</strong> con heap binario.
        </p>
      </div>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={runAStar} 
          disabled={running}
          style={{ 
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          {running ? '⏳ Ejecutando...' : '▶️ Ejecutar A*'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={clearPath} 
          disabled={running}
          style={{ 
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Limpiar Camino
        </button>
        <button 
          className="btn btn-danger" 
          onClick={clearAll} 
          disabled={running}
          style={{ 
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Limpiar Todo
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
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          border: '2px solid rgba(16, 185, 129, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#10b981' }}>
            ✅ <strong>¡Camino encontrado exitosamente!</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            📏 <strong>Longitud del camino:</strong> {path.length} pasos | 
            🔍 <strong>Nodos visitados:</strong> {visited.size} | 
            ⚡ <strong>Eficiencia:</strong> {((path.length / visited.size) * 100).toFixed(1)}%
          </p>
        </div>
      )}
      
      {!running && visited.size > 0 && path.length === 0 && (
        <div className="explanation-section" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          border: '2px solid rgba(239, 68, 68, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ❌ <strong>No se encontró un camino.</strong> Intenta reducir la cantidad de muros.
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
