import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/dijkstra.css';

const ROWS = 12;
const COLS = 20;
const START = { row: 6, col: 3 };
const END = { row: 6, col: 16 };
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const WEIGHT = 5;
const QUEUE_PREVIEW = 12;

const key = (row, col) => `${row}-${col}`;
const label = (k) => `(${k.replace('-', ',')})`;
const START_KEY = key(START.row, START.col);
const END_KEY = key(END.row, END.col);

// terrain: Map de celda a 'wall' o 'heavy'. Una celda sin entrada cuesta 1.
const buildRun = (terrain) => {
  const dist = new Map([[START_KEY, 0]]);
  const frontier = new Map([[START_KEY, 0]]);
  const parent = new Map();
  const order = [];

  const snapshot = () =>
    [...frontier].sort((a, b) => a[1] - b[1]).map(([k, d]) => ({ k, d }));

  const steps = [{
    current: null, currentDist: null, visitedCount: 0, pathCount: 0, frontier: snapshot(),
    text: `Se coloca el inicio ${label(START_KEY)} en la cola de prioridad con distancia 0.`
  }];
  let found = false;

  while (frontier.size > 0) {
    // Se extrae la celda con menor distancia
    let current = null;
    let currentDist = Infinity;
    for (const [k, d] of frontier) {
      if (d < currentDist) {
        current = k;
        currentDist = d;
      }
    }
    frontier.delete(current);
    order.push(current);

    if (current === END_KEY) {
      found = true;
      steps.push({
        current, currentDist, visitedCount: order.length, pathCount: 0, frontier: snapshot(),
        text: `Se extrae ${label(current)} con distancia ${currentDist}: es el destino y su distancia ya es definitiva.`
      });
      break;
    }

    const [row, col] = current.split('-').map(Number);
    const settled = new Set(order);
    let updated = 0;

    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;
      const k = key(nr, nc);
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (terrain.get(k) === 'wall' || settled.has(k)) continue;

      const newDist = currentDist + (terrain.get(k) === 'heavy' ? WEIGHT : 1);
      if (!dist.has(k) || newDist < dist.get(k)) {
        dist.set(k, newDist);
        parent.set(k, current);
        frontier.set(k, newDist);
        updated++;
      }
    }

    steps.push({
      current, currentDist, visitedCount: order.length, pathCount: 0, frontier: snapshot(),
      text: updated > 0
        ? `Se extrae ${label(current)} con distancia ${currentDist} (la menor de la cola) y se actualizan ${updated} vecinos.`
        : `Se extrae ${label(current)} con distancia ${currentDist}. No mejora la distancia de ningún vecino.`
    });
  }

  const path = [];
  if (found) {
    for (let k = END_KEY; k; k = parent.get(k)) path.unshift(k);
    path.forEach((k, i) => steps.push({
      current: null, currentDist: null, visitedCount: order.length, pathCount: i + 1, frontier: [],
      text: `Camino de menor costo: celda ${i + 1} de ${path.length} ${label(k)}.`
    }));
  }

  const cost = found ? dist.get(END_KEY) : null;
  steps.push({
    current: null, currentDist: null, visitedCount: order.length, pathCount: path.length, frontier: [],
    text: found
      ? `El camino de menor costo tiene costo total ${cost} y ${path.length - 1} pasos. Se exploraron ${order.length} celdas.`
      : 'La cola quedó vacía sin llegar al destino: no existe un camino.'
  });

  return { steps, order, path, found, cost };
};

export function Dijkstra() {
  const [terrain, setTerrain] = useState(new Map());
  const [tool, setTool] = useState('wall');
  const [run, setRun] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [paintMode, setPaintMode] = useState(null);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  // Reproducción automática paso a paso
  useEffect(() => {
    if (!playing || !run) return;
    if (stepIndex >= run.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStepIndex(i => i + 1), speed);
    return () => clearTimeout(id);
  }, [playing, run, stepIndex, speed]);

  const reset = () => {
    setRun(null);
    setPlaying(false);
  };

  const start = (autoplay) => {
    setRun(buildRun(terrain));
    setStepIndex(0);
    setPlaying(autoplay);
  };

  const next = () => {
    if (!run) return start(false);
    setPlaying(false);
    setStepIndex(i => Math.min(i + 1, run.steps.length - 1));
  };

  const paint = (row, col, mode) => {
    const k = key(row, col);
    if (k === START_KEY || k === END_KEY) return;
    setTerrain(prev => {
      const copy = new Map(prev);
      if (mode === 'add') copy.set(k, tool);
      else copy.delete(k);
      return copy;
    });
    reset();
  };

  const handleDown = (row, col) => {
    const mode = terrain.get(key(row, col)) === tool ? 'remove' : 'add';
    setPaintMode(mode);
    paint(row, col, mode);
  };

  const handleEnter = (row, col) => {
    if (paintMode) paint(row, col, paintMode);
  };

  const randomTerrain = () => {
    const next = new Map();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = key(r, c);
        if (k === START_KEY || k === END_KEY) continue;
        const roll = Math.random();
        if (roll < 0.18) next.set(k, 'wall');
        else if (roll < 0.4) next.set(k, 'heavy');
      }
    }
    setTerrain(next);
    reset();
  };

  const clearTerrain = () => {
    setTerrain(new Map());
    reset();
  };

  const step = run ? run.steps[stepIndex] : null;
  const finished = !!run && stepIndex === run.steps.length - 1;
  const visited = step ? new Set(run.order.slice(0, step.visitedCount)) : new Set();
  const inQueue = step ? new Set(step.frontier.map(e => e.k)) : new Set();
  const pathSet = step ? new Set(run.path.slice(0, step.pathCount)) : new Set();
  const wallCount = [...terrain.values()].filter(t => t === 'wall').length;
  const heavyCount = terrain.size - wallCount;

  const cellClass = (row, col) => {
    const k = key(row, col);
    let cls = 'dij-cell';
    if (k === START_KEY) cls += ' start';
    else if (k === END_KEY) cls += ' end';
    else if (terrain.get(k) === 'wall') cls += ' wall';
    else if (pathSet.has(k)) cls += ' path';
    else if (step && step.current === k) cls += ' current';
    else if (visited.has(k)) cls += ' visited';
    else if (inQueue.has(k)) cls += ' frontier';
    else if (terrain.get(k) === 'heavy') cls += ' heavy';
    return cls;
  };

  const queueItems = step ? step.frontier.slice(0, QUEUE_PREVIEW) : [];
  const queueExtra = step ? Math.max(0, step.frontier.length - QUEUE_PREVIEW) : 0;

  const cppCode = `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <algorithm>
using namespace std;

const int dr[] = {-1, 0, 1, 0};
const int dc[] = {0, 1, 0, -1};
const int WALL = -1; // cada celda guarda su costo de entrada; -1 es un muro

struct Result {
    int cost;
    vector<pair<int, int>> path;
};

Result dijkstra(const vector<vector<int>>& grid,
                pair<int, int> start, pair<int, int> end) {
    int rows = grid.size();
    int cols = grid[0].size();

    vector<vector<int>> dist(rows, vector<int>(cols, INT_MAX));
    vector<vector<pair<int, int>>> parent(rows, vector<pair<int, int>>(cols, {-1, -1}));

    // {distancia, {fila, columna}}: la menor distancia sale primero
    using State = pair<int, pair<int, int>>;
    priority_queue<State, vector<State>, greater<State>> pq;

    dist[start.first][start.second] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, node] = pq.top();
        pq.pop();
        auto [r, c] = node;

        if (d > dist[r][c]) continue; // entrada desactualizada

        if (node == end) {
            vector<pair<int, int>> path;
            pair<int, int> cur = end;
            while (cur.first != -1) {
                path.push_back(cur);
                cur = parent[cur.first][cur.second];
            }
            reverse(path.begin(), path.end());
            return {d, path};
        }

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == WALL) continue;

            int nd = d + grid[nr][nc];
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                parent[nr][nc] = {r, c};
                pq.push({nd, {nr, nc}});
            }
        }
    }
    return {-1, {}};
}

int main() {
    vector<vector<int>> grid(12, vector<int>(20, 1));
    for (int r = 2; r < 10; r++) grid[r][10] = WALL;   // muro vertical
    for (int r = 4; r < 9; r++) grid[r][8] = grid[r][9] = 5; // terreno pesado

    auto [cost, path] = dijkstra(grid, {6, 3}, {6, 16});
    if (path.empty()) {
        cout << "No existe un camino" << endl;
    } else {
        cout << "Costo mínimo: " << cost << ", " << path.size() - 1 << " pasos" << endl;
        for (auto [r, c] : path) cout << "(" << r << "," << c << ") ";
        cout << endl;
    }
    return 0;
}`;

  const pythonCode = `import heapq

DIRECTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]
WALL = -1  # cada celda guarda su costo de entrada; -1 es un muro

def dijkstra(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    dist = {start: 0}
    parent = {start: None}
    heap = [(0, start)]  # (distancia, celda): la menor distancia sale primero

    while heap:
        d, (r, c) = heapq.heappop(heap)

        if d > dist[(r, c)]:
            continue  # entrada desactualizada

        if (r, c) == end:
            path = []
            node = end
            while node is not None:
                path.append(node)
                node = parent[node]
            return d, path[::-1]

        for dr, dc in DIRECTIONS:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == WALL:
                continue

            nd = d + grid[nr][nc]
            if nd < dist.get((nr, nc), float('inf')):
                dist[(nr, nc)] = nd
                parent[(nr, nc)] = (r, c)
                heapq.heappush(heap, (nd, (nr, nc)))

    return None, []

# Uso
grid = [[1] * 20 for _ in range(12)]
for r in range(2, 10):
    grid[r][10] = WALL        # muro vertical
for r in range(4, 9):
    grid[r][8] = grid[r][9] = 5   # terreno pesado

cost, path = dijkstra(grid, (6, 3), (6, 16))
if path:
    print(f"Costo mínimo: {cost}, {len(path) - 1} pasos")
    print(path)
else:
    print("No existe un camino")`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Algoritmo de Dijkstra</h2>

      <div className="explanation-section">
        <h3>¿Qué es Dijkstra?</h3>
        <p>
          El algoritmo de Dijkstra encuentra el camino de menor costo desde un nodo inicial hacia los
          demás en un grafo con pesos no negativos. Mantiene la mejor distancia conocida a cada nodo y,
          en cada paso, procesa el nodo pendiente con la menor distancia, usando una cola de prioridad.
        </p>
        <p>
          Cuando todas las aristas cuestan lo mismo, Dijkstra explora igual que BFS. La diferencia aparece
          con pesos: aquí hay celdas de terreno pesado que cuestan {WEIGHT} en lugar de 1, y Dijkstra
          prefiere rodearlas si el desvío sale más barato, aunque tenga más pasos.
        </p>
        <p>
          <strong>Complejidad:</strong> O((V + E) log V) en tiempo con una cola de prioridad binaria
          y O(V) en memoria.
        </p>
        <ol className="dij-steps">
          <li><strong>Inicio:</strong> el nodo inicial tiene distancia 0 y entra a la cola de prioridad.</li>
          <li><strong>Procesar:</strong> se extrae el nodo con la menor distancia. Esa distancia ya es definitiva.</li>
          <li><strong>Relajar:</strong> para cada vecino se calcula distancia + costo de entrada; si mejora la conocida, se actualiza.</li>
          <li><strong>Terminar:</strong> se repite hasta extraer el destino o hasta que la cola quede vacía.</li>
        </ol>
        <p>
          <strong>Instrucciones:</strong> elige "Dibujar muros" o "Dibujar peso" y arrastra sobre la cuadrícula.
          Luego presiona "Ejecutar Dijkstra". También puedes avanzar con "Siguiente paso".
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={() => start(true)}>
          Ejecutar Dijkstra
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setPlaying(p => !p)}
          disabled={!run || finished}
        >
          {playing ? 'Pausar' : 'Continuar'}
        </button>
        <button className="btn btn-secondary" onClick={next} disabled={finished}>
          Siguiente paso
        </button>
        <button
          className={`btn ${tool === 'wall' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTool('wall')}
        >
          Dibujar muros
        </button>
        <button
          className={`btn ${tool === 'heavy' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTool('heavy')}
        >
          Dibujar peso ({WEIGHT})
        </button>
        <button className="btn btn-success" onClick={randomTerrain}>
          Terreno aleatorio
        </button>
        <button className="btn btn-secondary" onClick={clearTerrain}>
          Limpiar
        </button>
        <label className="dij-speed">
          Retardo: {speed} ms
          <input
            type="range"
            min="10"
            max="300"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
        </label>
      </div>

      <div className="visualization-area">
        <div className="dij-panel">
          <div className="dij-legend">
            <span><i className="start" />Inicio</span>
            <span><i className="end" />Destino</span>
            <span><i className="wall" />Muro</span>
            <span><i className="heavy" />Peso {WEIGHT}</span>
            <span><i className="frontier" />En la cola</span>
            <span><i className="current" />Procesando</span>
            <span><i className="visited" />Explorada</span>
            <span><i className="path" />Camino</span>
          </div>

          <div
            className="dij-grid"
            style={{ '--cols': COLS }}
            onMouseUp={() => setPaintMode(null)}
            onMouseLeave={() => setPaintMode(null)}
          >
            {Array.from({ length: ROWS * COLS }, (_, i) => {
              const row = Math.floor(i / COLS);
              const col = i % COLS;
              return (
                <div
                  key={i}
                  className={cellClass(row, col)}
                  onMouseDown={() => handleDown(row, col)}
                  onMouseEnter={() => handleEnter(row, col)}
                >
                  {terrain.get(key(row, col)) === 'heavy' ? WEIGHT : ''}
                </div>
              );
            })}
          </div>

          <div className="dij-stats">
            <span>Celdas exploradas: <strong>{step ? step.visitedCount : 0}</strong></span>
            <span>Tamaño de la cola: <strong>{step ? step.frontier.length : 0}</strong></span>
            <span>Distancia actual: <strong>{step && step.currentDist !== null ? step.currentDist : '-'}</strong></span>
            <span>Muros: <strong>{wallCount}</strong></span>
            <span>Celdas con peso: <strong>{heavyCount}</strong></span>
          </div>

          <div className="dij-queue">
            <div className="dij-queue-title">Cola de prioridad (la menor distancia está a la izquierda)</div>
            <div className="dij-queue-items">
              {queueItems.length === 0 && <span className="dij-empty">vacía</span>}
              {queueItems.map(({ k, d }, i) => (
                <span key={k} className={`dij-chip${i === 0 ? ' front' : ''}`}>
                  {label(k)} d={d}
                </span>
              ))}
              {queueExtra > 0 && <span className="dij-empty">+{queueExtra} más</span>}
            </div>
          </div>

          {run ? (
            <div className="dij-explain">
              <div className="dij-count">Paso {stepIndex + 1} de {run.steps.length}</div>
              <div>{step.text}</div>
            </div>
          ) : (
            <p className="dij-hint">
              Presiona "Ejecutar Dijkstra" para ver el proceso, o "Siguiente paso" para avanzar manualmente.
            </p>
          )}

          {finished && (run.found ? (
            <div className="dij-result ok">
              <h4>Camino encontrado</h4>
              <p><strong>Costo mínimo:</strong> {run.cost}</p>
              <p><strong>Pasos del camino:</strong> {run.path.length - 1}</p>
              <p><strong>Celdas exploradas:</strong> {run.order.length}</p>
            </div>
          ) : (
            <div className="dij-result no">
              <h4>Camino no encontrado</h4>
              <p>Los muros bloquean todas las rutas hacia el destino.</p>
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
