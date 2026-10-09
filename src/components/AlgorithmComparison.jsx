import { useState, useEffect, useRef } from 'react';
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
  const [visualizations, setVisualizations] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const timerRef = useRef(null);

  const STYLES = `
    .cmp-grids { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 1.5rem 0; }
    .cmp-card { background: rgba(15, 23, 42, 0.6); border-radius: 8px; padding: 0.75rem; }
    .cmp-grid { display: grid; gap: 1px; background: #0f172a; border: 1px solid #334155; user-select: none; }
    .cmp-cell { aspect-ratio: 1; background: #1e293b; }
    .cmp-cell.wall { background: #94a3b8; }
    .cmp-cell.start { background: #10b981; }
    .cmp-cell.end { background: #ef4444; }
    .cmp-cell.visited { background: #7c6bd6; animation: cmp-visit 0.5s ease-out; }
    .cmp-cell.path { background: #fbbf24; animation: cmp-path 0.4s ease-out; }
    .cmp-count { margin-top: 0.5rem; font-size: 0.85rem; color: #94a3b8; text-align: center; }
    @keyframes cmp-visit {
      0% { transform: scale(0.3); background: #38bdf8; border-radius: 50%; }
      60% { background: #38bdf8; }
      100% { transform: scale(1); background: #7c6bd6; border-radius: 0; }
    }
    @keyframes cmp-path {
      0% { transform: scale(0.5); }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
  `;

  useEffect(() => {
    initializeGrid();
  }, []);

 useEffect(() => () => clearInterval(timerRef.current), []);
  const key = (row, col) => `${row}-${col}`

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
;

  const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

  const getNeighbors = (node) =>
    [[-1, 0], [1, 0], [0, -1], [0, 1]]
      .map(([dr, dc]) => ({ row: node.row + dr, col: node.col + dc }))
      .filter(n =>
        n.row >= 0 && n.row < ROWS && n.col >= 0 && n.col < COLS &&
        !walls.has(key(n.row, n.col))
      );

  // Búsqueda genérica: solo cambia la prioridad según el algoritmo
  const search = (mode) => {
    const t0 = performance.now();
    const score = (n) => {
      if (mode === 'astar') return n.g + heuristic(n, end);
      if (mode === 'greedy') return heuristic(n, end);
      if (mode === 'dijkstra') return n.g;
      return 0; // BFS: sin prioridad, sale el primero en entrar (FIFO)
    };

    const open = [{ ...start, g: 0 }];
    const bestG = new Map([[key(start.row, start.col), 0]]);
    const cameFrom = new Map();
    const closed = new Set();
    const order = [];

    while (open.length > 0) {
      let best = 0;
      for (let i = 1; i < open.length; i++) {
        if (score(open[i]) < score(open[best])) best = i;
      }
      const current = open.splice(best, 1)[0];
      const currentKey = key(current.row, current.col);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);
      order.push(currentKey);

      if (current.row === end.row && current.col === end.col) {
        const path = [];
        let k = currentKey;
        while (k) {
          path.unshift(k);
          k = cameFrom.get(k);
        }
        return { order, path, time: (performance.now() - t0).toFixed(2) };
      }

      for (const n of getNeighbors(current)) {
        const nKey = key(n.row, n.col);
        const g = current.g + 1;
        if (closed.has(nKey)) continue;
        if (!bestG.has(nKey) || g < bestG.get(nKey)) {
          bestG.set(nKey, g);
          cameFrom.set(nKey, currentKey);
          open.push({ ...n, g });
        }
      }
    }
    return { order, path: [], time: (performance.now() - t0).toFixed(2) };
  };

  const ALGORITHMS = {
    'A*': 'astar',
    'Dijkstra': 'dijkstra',
    'BFS': 'bfs',
    'Greedy Best-First': 'greedy'
  };

  const compareAll = () => {
    clearInterval(timerRef.current);
    const runs = Object.fromEntries(
      Object.entries(ALGORITHMS).map(([name, mode]) => [name, search(mode)])
    );

    setRunning(true);
    setResults({});
    setVisualizations({});

    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      const frame = {};
      let finished = true;

      for (const [name, run] of Object.entries(runs)) {
        const explored = run.order.length;
        const pathShown = Math.max(0, step - explored);
        if (pathShown < run.path.length || step < explored) finished = false;
        frame[name] = {
          visited: new Set(run.order.slice(0, step)),
          path: new Set(run.path.slice(0, pathShown))
        };
      }

      setVisualizations(frame);

      if (finished) {
        clearInterval(timerRef.current);
        setResults(Object.fromEntries(
          Object.entries(runs).map(([name, run]) => [name, {
            nodesExplored: run.order.length,
            pathLength: run.path.length,
            time: run.time
          }]
        )));
        setRunning(false);
      }
    }, 30);
  };

  const clearResults = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setResults({});
    setVisualizations({});
    setWalls(new Set());
    izeGrid();
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

  const renderGrid = (name) => {
    const vis = visualizations[name] || { visited: new Set(), path: new Set() };

    return (
      <div
        className="cmp-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {grid.flat().map(({ row, col }) => {
          const k = `${row}-${col}`;
          let cls = 'cmp-cell';
          if (row === start.row && col === start.col) cls += ' start';
          else if (row === end.row && col === end.col) cls += ' end';
          else if (walls.has(k)) cls += ' wall';
          else if (vis.path.has(k)) cls += ' path';
          else if (vis.visited.has(k)) cls += ' visited';

          return (
            <div
              key={k}
              className={cls}
              onMouseDown={() => !running && handleMouseDown(row, col)}
              onMouseEnter={() => !running && handleMouseEnter(row, col)}
            />
          );
        })}
      </div>
    );
  };

  const comparisonCode = {
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <set>
#include <cmath>
#include <algorithm>
#include <chrono>
using namespace std;

struct Node {
    int row, col;
    int g, h, f; // Para A*
    int dist;    // Para Dijkstra
    
    bool operator>(const Node& other) const {
        return f > other.f; // Para A*
    }
};

class PathfindingComparison {
public:
    int rows, cols;
    vector<vector<bool>> walls;
    pair<int, int> start, end;
    
    PathfindingComparison(int r, int c) : rows(r), cols(c) {
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
            int nr = row + dr[i];
            int nc = col + dc[i];
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !walls[nr][nc]) {
                neighbors.push_back({nr, nc});
            }
        }
        return neighbors;
    }
    
    // A* Algorithm
    pair<vector<pair<int, int>>, int> aStar() {
        auto startTime = chrono::high_resolution_clock::now();
        
        priority_queue<Node, vector<Node>, greater<Node>> openSet;
        map<pair<int, int>, pair<int, int>> cameFrom;
        map<pair<int, int>, int> gScore;
        set<pair<int, int>> closedSet;
        
        Node startNode = {start.first, start.second, 0, 
                         heuristic(start.first, start.second, end.first, end.second), 0};
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);
        gScore[start] = 0;
        
        int nodesExplored = 0;
        
        while (!openSet.empty()) {
            Node current = openSet.top();
            openSet.pop();
            
            pair<int, int> currentPos = {current.row, current.col};
            
            if (closedSet.count(currentPos)) continue;
            closedSet.insert(currentPos);
            nodesExplored++;
            
            if (currentPos == end) {
                vector<pair<int, int>> path;
                pair<int, int> pos = end;
                while (cameFrom.count(pos)) {
                    path.push_back(pos);
                    pos = cameFrom[pos];
                }
                path.push_back(start);
                reverse(path.begin(), path.end());
                
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::microseconds>(endTime - startTime);
                
                cout << "A*: Camino de " << path.size() << " pasos, ";
                cout << nodesExplored << " nodos explorados, ";
                cout << duration.count() / 1000.0 << " ms" << endl;
                
                return {path, nodesExplored};
            }
            
            for (auto [nr, nc] : getNeighbors(current.row, current.col)) {
                pair<int, int> neighbor = {nr, nc};
                if (closedSet.count(neighbor)) continue;
                
                int tentativeG = gScore[currentPos] + 1;
                
                if (!gScore.count(neighbor) || tentativeG < gScore[neighbor]) {
                    cameFrom[neighbor] = currentPos;
                    gScore[neighbor] = tentativeG;
                    
                    Node neighborNode = {nr, nc, tentativeG, 
                                       heuristic(nr, nc, end.first, end.second), 0};
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openSet.push(neighborNode);
                }
            }
        }
        
        return {{}, nodesExplored};
    }
    
    // Dijkstra Algorithm
    pair<vector<pair<int, int>>, int> dijkstra() {
        auto startTime = chrono::high_resolution_clock::now();
        
        map<pair<int, int>, int> distances;
        map<pair<int, int>, pair<int, int>> previous;
        set<pair<int, int>> visited;
        priority_queue<pair<int, pair<int, int>>, 
                      vector<pair<int, pair<int, int>>>, 
                      greater<pair<int, pair<int, int>>>> pq;
        
        distances[start] = 0;
        pq.push({0, start});
        
        int nodesExplored = 0;
        
        while (!pq.empty()) {
            auto [dist, current] = pq.top();
            pq.pop();
            
            if (visited.count(current)) continue;
            visited.insert(current);
            nodesExplored++;
            
            if (current == end) {
                vector<pair<int, int>> path;
                pair<int, int> pos = end;
                while (previous.count(pos)) {
                    path.push_back(pos);
                    pos = previous[pos];
                }
                path.push_back(start);
                reverse(path.begin(), path.end());
                
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::microseconds>(endTime - startTime);
                
                cout << "Dijkstra: Camino de " << path.size() << " pasos, ";
                cout << nodesExplored << " nodos explorados, ";
                cout << duration.count() / 1000.0 << " ms" << endl;
                
                return {path, nodesExplored};
            }
            
            for (auto [nr, nc] : getNeighbors(current.first, current.second)) {
                pair<int, int> neighbor = {nr, nc};
                if (visited.count(neighbor)) continue;
                
                int newDist = distances[current] + 1;
                if (!distances.count(neighbor) || newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previous[neighbor] = current;
                    pq.push({newDist, neighbor});
                }
            }
        }
        
        return {{}, nodesExplored};
    }
    
    // BFS Algorithm
    pair<vector<pair<int, int>>, int> bfs() {
        auto startTime = chrono::high_resolution_clock::now();
        
        queue<pair<int, int>> q;
        set<pair<int, int>> visited;
        map<pair<int, int>, pair<int, int>> previous;
        
        q.push(start);
        visited.insert(start);
        
        int nodesExplored = 0;
        
        while (!q.empty()) {
            auto current = q.front();
            q.pop();
            nodesExplored++;
            
            if (current == end) {
                vector<pair<int, int>> path;
                pair<int, int> pos = end;
                while (previous.count(pos)) {
                    path.push_back(pos);
                    pos = previous[pos];
                }
                path.push_back(start);
                reverse(path.begin(), path.end());
                
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::microseconds>(endTime - startTime);
                
                cout << "BFS: Camino de " << path.size() << " pasos, ";
                cout << nodesExplored << " nodos explorados, ";
                cout << duration.count() / 1000.0 << " ms" << endl;
                
                return {path, nodesExplored};
            }
            
            for (auto neighbor : getNeighbors(current.first, current.second)) {
                if (!visited.count(neighbor)) {
                    visited.insert(neighbor);
                    previous[neighbor] = current;
                    q.push(neighbor);
                }
            }
        }
        
        return {{}, nodesExplored};
    }
    
    // Greedy Best-First Algorithm
    pair<vector<pair<int, int>>, int> greedy() {
        auto startTime = chrono::high_resolution_clock::now();
        
        auto cmp = [this](pair<int, int> a, pair<int, int> b) {
            return heuristic(a.first, a.second, end.first, end.second) > 
                   heuristic(b.first, b.second, end.first, end.second);
        };
        priority_queue<pair<int, int>, vector<pair<int, int>>, decltype(cmp)> openSet(cmp);
        
        set<pair<int, int>> visited;
        map<pair<int, int>, pair<int, int>> previous;
        
        openSet.push(start);
        int nodesExplored = 0;
        
        while (!openSet.empty()) {
            auto current = openSet.top();
            openSet.pop();
            
            if (visited.count(current)) continue;
            visited.insert(current);
            nodesExplored++;
            
            if (current == end) {
                vector<pair<int, int>> path;
                pair<int, int> pos = end;
                while (previous.count(pos)) {
                    path.push_back(pos);
                    pos = previous[pos];
                }
                path.push_back(start);
                reverse(path.begin(), path.end());
                
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::microseconds>(endTime - startTime);
                
                cout << "Greedy: Camino de " << path.size() << " pasos, ";
                cout << nodesExplored << " nodos explorados, ";
                cout << duration.count() / 1000.0 << " ms" << endl;
                
                return {path, nodesExplored};
            }
            
            for (auto neighbor : getNeighbors(current.first, current.second)) {
                if (!visited.count(neighbor)) {
                    previous[neighbor] = current;
                    openSet.push(neighbor);
                }
            }
        }
        
        return {{}, nodesExplored};
    }
    
    void compareAll() {
        cout << "=== Comparación de Algoritmos ===" << endl;
        aStar();
        dijkstra();
        bfs();
        greedy();
    }
};

int main() {
    PathfindingComparison pf(12, 20);
    pf.start = {2, 2};
    pf.end = {9, 17};
    
    // Agregar algunos muros
    pf.walls[5][5] = true;
    pf.walls[5][6] = true;
    
    pf.compareAll();
    
    return 0;
}`,

    python: `import heapq
import time
from collections import deque

class PathfindingComparison:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.walls = set()
        self.start = None
        self.end = None
    
    def heuristic(self, r1, c1, r2, c2):
        return abs(r1 - r2) + abs(c1 - c2)
    
    def get_neighbors(self, row, col):
        neighbors = []
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        for dr, dc in directions:
            nr, nc = row + dr, col + dc
            if (0 <= nr < self.rows and 
                0 <= nc < self.cols and 
                (nr, nc) not in self.walls):
                neighbors.append((nr, nc))
        
        return neighbors
    
    def a_star(self):
        """Algoritmo A*"""
        start_time = time.time()
        
        open_set = []
        heapq.heappush(open_set, (0, self.start))
        
        came_from = {}
        g_score = {self.start: 0}
        f_score = {self.start: self.heuristic(*self.start, *self.end)}
        closed_set = set()
        
        nodes_explored = 0
        
        while open_set:
            _, current = heapq.heappop(open_set)
            
            if current in closed_set:
                continue
            
            closed_set.add(current)
            nodes_explored += 1
            
            if current == self.end:
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(self.start)
                path.reverse()
                
                elapsed = (time.time() - start_time) * 1000
                print(f"A*: Camino de {len(path)} pasos, "
                      f"{nodes_explored} nodos explorados, "
                      f"{elapsed:.2f} ms")
                
                return path, nodes_explored
            
            for neighbor in self.get_neighbors(*current):
                if neighbor in closed_set:
                    continue
                
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f = tentative_g + self.heuristic(*neighbor, *self.end)
                    f_score[neighbor] = f
                    heapq.heappush(open_set, (f, neighbor))
        
        return [], nodes_explored
    
    def dijkstra(self):
        """Algoritmo de Dijkstra"""
        start_time = time.time()
        
        distances = {self.start: 0}
        previous = {}
        visited = set()
        pq = [(0, self.start)]
        
        nodes_explored = 0
        
        while pq:
            dist, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            nodes_explored += 1
            
            if current == self.end:
                path = []
                while current in previous:
                    path.append(current)
                    current = previous[current]
                path.append(self.start)
                path.reverse()
                
                elapsed = (time.time() - start_time) * 1000
                print(f"Dijkstra: Camino de {len(path)} pasos, "
                      f"{nodes_explored} nodos explorados, "
                      f"{elapsed:.2f} ms")
                
                return path, nodes_explored
            
            for neighbor in self.get_neighbors(*current):
                if neighbor in visited:
                    continue
                
                new_dist = distances[current] + 1
                if neighbor not in distances or new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = current
                    heapq.heappush(pq, (new_dist, neighbor))
        
        return [], nodes_explored
    
    def bfs(self):
        """Búsqueda en Anchura (BFS)"""
        start_time = time.time()
        
        queue = deque([self.start])
        visited = {self.start}
        previous = {}
        
        nodes_explored = 0
        
        while queue:
            current = queue.popleft()
            nodes_explored += 1
            
            if current == self.end:
                path = []
                while current in previous:
                    path.append(current)
                    current = previous[current]
                path.append(self.start)
                path.reverse()
                
                elapsed = (time.time() - start_time) * 1000
                print(f"BFS: Camino de {len(path)} pasos, "
                      f"{nodes_explored} nodos explorados, "
                      f"{elapsed:.2f} ms")
                
                return path, nodes_explored
            
            for neighbor in self.get_neighbors(*current):
                if neighbor not in visited:
                    visited.add(neighbor)
                    previous[neighbor] = current
                    queue.append(neighbor)
        
        return [], nodes_explored
    
    def greedy_best_first(self):
        """Greedy Best-First Search"""
        start_time = time.time()
        
        open_set = [(self.heuristic(*self.start, *self.end), self.start)]
        visited = set()
        previous = {}
        
        nodes_explored = 0
        
        while open_set:
            _, current = heapq.heappop(open_set)
            
            if current in visited:
                continue
            
            visited.add(current)
            nodes_explored += 1
            
            if current == self.end:
                path = []
                while current in previous:
                    path.append(current)
                    current = previous[current]
                path.append(self.start)
                path.reverse()
                
                elapsed = (time.time() - start_time) * 1000
                print(f"Greedy: Camino de {len(path)} pasos, "
                      f"{nodes_explored} nodos explorados, "
                      f"{elapsed:.2f} ms")
                
                return path, nodes_explored
            
            for neighbor in self.get_neighbors(*current):
                if neighbor not in visited:
                    previous[neighbor] = current
                    h = self.heuristic(*neighbor, *self.end)
                    heapq.heappush(open_set, (h, neighbor))
        
        return [], nodes_explored
    
    def compare_all(self):
        """Ejecuta y compara todos los algoritmos"""
        print("=== Comparación de Algoritmos ===")
        self.a_star()
        self.dijkstra()
        self.bfs()
        self.greedy_best_first()

# Uso
pf = PathfindingComparison(12, 20)
pf.start = (2, 2)
pf.end = (9, 17)

# Agregar algunos muros
pf.walls.add((5, 5))
pf.walls.add((5, 6))

pf.compare_all()`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <style>{STYLES}</style>
      <h2 className="section-title">Comparación de Algoritmos de Búsqueda</h2>

      <div className="explanation-section">
        <h3>Comparación de Algoritmos</h3>
        <p>
          Esta herramienta te permite comparar el rendimiento de diferentes algoritmos de búsqueda 
          de caminos ejecutándose simultáneamente en el mismo problema. Los algoritmos incluidos son:
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li><strong>A*:</strong> Combina costo real con heurística. Óptimo y eficiente.</li>
          <li><strong>Dijkstra:</strong> Busca el camino más corto sin heurística. Siempre óptimo.</li>
          <li><strong>BFS:</strong> Búsqueda por anchura. Simple y óptimo en grafos no ponderados.</li>
          <li><strong>Greedy Best-First:</strong> Solo usa heurística. Rápido pero no garantiza optimalidad.</li>
        </ul>
        <p>
          <strong>Instrucciones:</strong> Arrastra el mouse para dibujar/borrar muros, luego presiona "Comparar Todos" para ver las ejecuciones simultáneas.
        </p>
      </div>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={compareAll} 
          disabled={running}
          style={{
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          {running ? 'Comparando...' : 'Comparar Todos'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={clearResults}
          disabled={running}
          style={{
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          Limpiar
        </button>
      </div>

      {running && (
        <div className="explanation-section" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          border: '2px solid rgba(16, 185, 129, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#10b981', fontWeight: '600' }}>
            Ejecutando algoritmos simultáneamente... Observa cómo cada uno explora el espacio de búsqueda.
          </p>
        </div>
      )}

      <div className="comparison-grids">
        {['A*', 'Dijkstra', 'BFS', 'Greedy Best-First'].map(algorithm => (
          <div key={algorithm} className="algorithm-visualization">
            <h4 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#a78bfa' }}>
              {algorithm}
            </h4>
            {renderGrid(algorithm)}
            {results[algorithm] && (
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem',
                background: 'rgba(167, 139, 250, 0.1)',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}>
                <div>{results[algorithm].time} ms</div>
                <div>{results[algorithm].nodesExplored} nodos</div>
                <div>Camino: {results[algorithm].pathLength}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="results-section">
          <h3 style={{ color: '#a78bfa', marginBottom: '1rem' }}>📊 Resultados Detallados</h3>
          <div className="results-grid">
            {Object.entries(results).map(([algorithm, result]) => (
              <div key={algorithm} className="result-card">
                <h4>{algorithm}</h4>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">⏱️ Tiempo:</span>
                    <span className="stat-value">{result.time} ms</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">🔍 Nodos Explorados:</span>
                    <span className="stat-value">{result.nodesExplored}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">📏 Longitud del Camino:</span>
                    <span className="stat-value">{result.pathLength}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">✓ Éxito:</span>
                    <span className={`stat-value ${result.pathLength > 0 ? 'success' : 'fail'}`}>
                      {result.pathLength > 0 ? '✓ Encontrado' : '✗ No encontrado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(results).length > 1 && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>📈 Análisis Comparativo</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>
                  <strong>Más rápido:</strong>{' '}
                  {Object.entries(results).reduce((fastest, [name, data]) => 
                    parseFloat(data.time) < parseFloat(fastest[1].time) ? [name, data] : fastest
                  )[0]} con {Object.entries(results).reduce((fastest, [name, data]) => 
                    parseFloat(data.time) < parseFloat(fastest[1].time) ? [name, data] : fastest
                  )[1].time} ms
                </li>
                <li>
                  <strong>Menos nodos explorados:</strong>{' '}
                  {Object.entries(results).reduce((min, [name, data]) => 
                    data.nodesExplored < min[1].nodesExplored ? [name, data] : min
                  )[0]} con {Object.entries(results).reduce((min, [name, data]) => 
                    data.nodesExplored < min[1].nodesExplored ? [name, data] : min
                  )[1].nodesExplored} nodos
                </li>
                <li>
                  <strong>Conclusión:</strong> A* combina lo mejor de ambos mundos: 
                  la optimalidad de Dijkstra con la eficiencia dirigida por heurística de Greedy Best-First,
                  explorando menos nodos mientras garantiza encontrar el camino más corto.
                </li>
              </ul>
            </div>
          )}
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