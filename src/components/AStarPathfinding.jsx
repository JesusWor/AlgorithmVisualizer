import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/grid.css';

export function AStarPathfinding() {
  const ROWS = 15;
  const COLS = 20;
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState({ row: 2, col: 2 });
  const [end, setEnd] = useState({ row: 12, col: 17 });
  const [walls, setWalls] = useState(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [visited, setVisited] = useState(new Set());
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
    setPath([]);
    setVisited(new Set());

    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.row}-${start.col}`, 0);
    fScore.set(`${start.row}-${start.col}`, heuristic(start, end));

    const visitedNodes = new Set();

    while (openSet.length > 0) {
      openSet.sort((a, b) => {
        const aKey = `${a.row}-${a.col}`;
        const bKey = `${b.row}-${b.col}`;
        return (fScore.get(aKey) || Infinity) - (fScore.get(bKey) || Infinity);
      });

      const current = openSet.shift();
      const currentKey = `${current.row}-${current.col}`;

      visitedNodes.add(currentKey);
      setVisited(new Set(visitedNodes));
      await sleep(30);

      if (current.row === end.row && current.col === end.col) {
        const reconstructedPath = [];
        let temp = current;
        while (temp) {
          reconstructedPath.unshift(temp);
          const key = `${temp.row}-${temp.col}`;
          temp = cameFrom.get(key);
        }
        setPath(reconstructedPath);
        return;
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
  };

  const clearWalls = () => {
    setWalls(new Set());
    setPath([]);
    setVisited(new Set());
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <map>
#include <set>
using namespace std;

struct Node {
    int row, col;
    double f, g, h;
    
    bool operator>(const Node& other) const {
        return f > other.f;
    }
};

double heuristic(int r1, int c1, int r2, int c2) {
    return abs(r1 - r2) + abs(c1 - c2);
}

vector<pair<int,int>> aStar(vector<vector<int>>& grid, 
                             pair<int,int> start, 
                             pair<int,int> end) {
    int rows = grid.size();
    int cols = grid[0].size();
    
    priority_queue<Node, vector<Node>, greater<Node>> openSet;
    map<pair<int,int>, pair<int,int>> cameFrom;
    map<pair<int,int>, double> gScore;
    set<pair<int,int>> visited;
    
    Node startNode = {start.first, start.second, 0, 0, 
                      heuristic(start.first, start.second, 
                               end.first, end.second)};
    openSet.push(startNode);
    gScore[start] = 0;
    
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};
    
    while (!openSet.empty()) {
        Node current = openSet.top();
        openSet.pop();
        
        pair<int,int> currentPos = {current.row, current.col};
        
        if (currentPos == end) {
            vector<pair<int,int>> path;
            while (cameFrom.count(currentPos)) {
                path.push_back(currentPos);
                currentPos = cameFrom[currentPos];
            }
            path.push_back(start);
            reverse(path.begin(), path.end());
            return path;
        }
        
        if (visited.count(currentPos)) continue;
        visited.insert(currentPos);
        
        for (int i = 0; i < 4; i++) {
            int newRow = current.row + dr[i];
            int newCol = current.col + dc[i];
            
            if (newRow >= 0 && newRow < rows && 
                newCol >= 0 && newCol < cols && 
                grid[newRow][newCol] == 0) {
                
                pair<int,int> neighbor = {newRow, newCol};
                double tentativeG = gScore[currentPos] + 1;
                
                if (!gScore.count(neighbor) || tentativeG < gScore[neighbor]) {
                    cameFrom[neighbor] = currentPos;
                    gScore[neighbor] = tentativeG;
                    
                    Node neighborNode = {
                        newRow, newCol,
                        tentativeG + heuristic(newRow, newCol, end.first, end.second),
                        tentativeG,
                        heuristic(newRow, newCol, end.first, end.second)
                    };
                    openSet.push(neighborNode);
                }
            }
        }
    }
    
    return {};
}`;

  const pythonCode = `import heapq
from typing import List, Tuple, Set

def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star(grid: List[List[int]], 
           start: Tuple[int, int], 
           end: Tuple[int, int]) -> List[Tuple[int, int]]:
    
    rows, cols = len(grid), len(grid[0])
    
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, end)}
    visited = set()
    
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while open_set:
        _, current = heapq.heappop(open_set)
        
        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]
        
        if current in visited:
            continue
        visited.add(current)
        
        for dr, dc in directions:
            neighbor = (current[0] + dr, current[1] + dc)
            
            if (0 <= neighbor[0] < rows and 
                0 <= neighbor[1] < cols and 
                grid[neighbor[0]][neighbor[1]] == 0):
                
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, end)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    return []

# Uso
grid = [[0]*20 for _ in range(15)]
path = a_star(grid, (2, 2), (12, 17))
print(path)`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const getCellClass = (row, col) => {
    const key = `${row}-${col}`;
    if (row === start.row && col === start.col) return 'cell start';
    if (row === end.row && col === end.col) return 'cell end';
    if (walls.has(key)) return 'cell wall';
    if (path.some(p => p.row === row && p.col === col)) return 'cell path';
    if (visited.has(key)) return 'cell visited';
    return 'cell';
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Búsqueda A* (A-Star)</h2>

      <div className="explanation-section">
        <h3>¿Qué es A*?</h3>
        <p>
          A* es un algoritmo de búsqueda de caminos que encuentra el camino más corto entre dos puntos. 
          Utiliza una función heurística para estimar la distancia al objetivo, combinándola con el 
          costo real del camino recorrido. Es muy eficiente y garantiza encontrar el camino óptimo.
        </p>
        <p>
          <strong>Fórmula:</strong> f(n) = g(n) + h(n), donde g(n) es el costo desde el inicio hasta n, 
          y h(n) es la heurística estimada desde n hasta el objetivo.
        </p>
        <p>
          <strong>Instrucciones:</strong> Haz clic y arrastra para dibujar muros (negro). Verde = inicio, Rojo = fin.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={runAStar}>
          Ejecutar A*
        </button>
        <button className="btn btn-secondary" onClick={clearWalls}>
          Limpiar Grid
        </button>
      </div>

      <div className="visualization-area">
        <div className="grid-container">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={getCellClass(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

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
            onClick={() => copyCode(codeLanguage === 'cpp' ? cppCode : pythonCode)}
          >
            Copiar
          </button>
          <pre>{codeLanguage === 'cpp' ? cppCode : pythonCode}</pre>
        </div>
      </div>
    </div>
  );
}
