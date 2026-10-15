import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/bfs.css';

const ROWS = 12;
const COLS = 20;
const START = { row: 6, col: 3 };
const END = { row: 6, col: 16 };
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const QUEUE_PREVIEW = 16;

const key = (row, col) => `${row}-${col}`;
const label = (k) => `(${k.replace('-', ',')})`;
const START_KEY = key(START.row, START.col);
const END_KEY = key(END.row, END.col);

// Ejecuta BFS completo y lo convierte en una lista de pasos para reproducir
const buildRun = (walls) => {
  const queue = [START_KEY];
  const seen = new Set([START_KEY]);
  const parent = new Map();
  const order = [];
  const steps = [{
    current: null, visitedCount: 0, pathCount: 0, queue: [...queue],
    text: `Se coloca el inicio ${label(START_KEY)} en la cola y se marca como descubierto.`
  }];
  let found = false;

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);
    const [row, col] = current.split('-').map(Number);

    if (current === END_KEY) {
      found = true;
      steps.push({
        current, visitedCount: order.length, pathCount: 0, queue: [...queue],
        text: `Se saca ${label(current)} de la cola: es el destino.`
      });
      break;
    }

    let added = 0;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;
      const k = key(nr, nc);
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (walls.has(k) || seen.has(k)) continue;
      seen.add(k);
      parent.set(k, current);
      queue.push(k);
      added++;
    }

    steps.push({
      current, visitedCount: order.length, pathCount: 0, queue: [...queue],
      text: added > 0
        ? `Se saca ${label(current)} de la cola y se agregan ${added} vecinos nuevos al final.`
        : `Se saca ${label(current)} de la cola. No tiene vecinos nuevos.`
    });
  }

  const path = [];
  if (found) {
    for (let k = END_KEY; k; k = parent.get(k)) path.unshift(k);
    path.forEach((k, i) => steps.push({
      current: null, visitedCount: order.length, pathCount: i + 1, queue: [],
      text: `Camino mínimo: celda ${i + 1} de ${path.length} ${label(k)}.`
    }));
  }

  steps.push({
    current: null, visitedCount: order.length, pathCount: path.length, queue: [],
    text: found
      ? `El camino más corto tiene ${path.length - 1} pasos. BFS exploró ${order.length} celdas.`
      : 'La cola quedó vacía sin llegar al destino: no existe un camino.'
  });

  return { steps, order, path, found };
};

export function BreadthFirstSearch() {
  const [walls, setWalls] = useState(new Set());
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
    setRun(buildRun(walls));
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
    setWalls(prev => {
      const copy = new Set(prev);
      if (mode === 'add') copy.add(k);
      else copy.delete(k);
      return copy;
    });
    reset();
  };

  const handleDown = (row, col) => {
    const mode = walls.has(key(row, col)) ? 'remove' : 'add';
    setPaintMode(mode);
    paint(row, col, mode);
  };

  const handleEnter = (row, col) => {
    if (paintMode) paint(row, col, paintMode);
  };

  const randomWalls = () => {
    const next = new Set();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = key(r, c);
        if (k !== START_KEY && k !== END_KEY && Math.random() < 0.28) next.add(k);
      }
    }
    setWalls(next);
    reset();
  };

  const clearWalls = () => {
    setWalls(new Set());
    reset();
  };

  const step = run ? run.steps[stepIndex] : null;
  const finished = !!run && stepIndex === run.steps.length - 1;
  const visited = step ? new Set(run.order.slice(0, step.visitedCount)) : new Set();
  const queued = step ? new Set(step.queue) : new Set();
  const pathSet = step ? new Set(run.path.slice(0, step.pathCount)) : new Set();

  const cellClass = (row, col) => {
    const k = key(row, col);
    let cls = 'bfs-cell';
    if (k === START_KEY) cls += ' start';
    else if (k === END_KEY) cls += ' end';
    else if (walls.has(k)) cls += ' wall';
    else if (pathSet.has(k)) cls += ' path';
    else if (step && step.current === k) cls += ' current';
    else if (queued.has(k)) cls += ' queued';
    else if (visited.has(k)) cls += ' visited';
    return cls;
  };

  const queueItems = step ? step.queue.slice(0, QUEUE_PREVIEW) : [];
  const queueExtra = step ? Math.max(0, step.queue.length - QUEUE_PREVIEW) : 0;

  const cppCode = `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

const int dr[] = {-1, 0, 1, 0};
const int dc[] = {0, 1, 0, -1};

vector<pair<int, int>> bfs(const vector<vector<int>>& grid,
                           pair<int, int> start, pair<int, int> end) {
    int rows = grid.size();
    int cols = grid[0].size();

    vector<vector<bool>> seen(rows, vector<bool>(cols, false));
    vector<vector<pair<int, int>>> parent(rows, vector<pair<int, int>>(cols, {-1, -1}));
    queue<pair<int, int>> q;

    q.push(start);
    seen[start.first][start.second] = true;

    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();

        if (make_pair(r, c) == end) {
            vector<pair<int, int>> path;
            pair<int, int> cur = end;
            while (cur.first != -1) {
                path.push_back(cur);
                cur = parent[cur.first][cur.second];
            }
            reverse(path.begin(), path.end());
            return path;
        }

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == 1 || seen[nr][nc]) continue;

            seen[nr][nc] = true;
            parent[nr][nc] = {r, c};
            q.push({nr, nc});
        }
    }
    return {};
}

int main() {
    vector<vector<int>> grid(12, vector<int>(20, 0));
    for (int r = 2; r < 10; r++) grid[r][10] = 1; // muro vertical

    auto path = bfs(grid, {6, 3}, {6, 16});
    if (path.empty()) {
        cout << "No existe un camino" << endl;
    } else {
        cout << "Distancia mínima: " << path.size() - 1 << " pasos" << endl;
        for (auto [r, c] : path) cout << "(" << r << "," << c << ") ";
        cout << endl;
    }
    return 0;
}`;

  const pythonCode = `from collections import deque

DIRECTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]

def bfs(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    parent = {start: None}
    queue = deque([start])

    while queue:
        r, c = queue.popleft()

        if (r, c) == end:
            path = []
            node = end
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]

        for dr, dc in DIRECTIONS:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == 1 or (nr, nc) in parent:
                continue

            parent[(nr, nc)] = (r, c)
            queue.append((nr, nc))

    return []

# Uso
grid = [[0] * 20 for _ in range(12)]
for r in range(2, 10):
    grid[r][10] = 1  # muro vertical

path = bfs(grid, (6, 3), (6, 16))
if path:
    print(f"Distancia mínima: {len(path) - 1} pasos")
    print(path)
else:
    print("No existe un camino")`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Búsqueda en Anchura (BFS)</h2>

      <div className="explanation-section">
        <h3>¿Qué es BFS?</h3>
        <p>
          La búsqueda en anchura (Breadth-First Search) explora un grafo por niveles: primero visita
          todos los vecinos del nodo inicial, luego los vecinos de esos vecinos, y así sucesivamente.
          Usa una cola (FIFO), por lo que siempre se procesa primero el nodo que lleva más tiempo esperando.
        </p>
        <p>
          En un grafo sin pesos, como esta cuadrícula, el primer camino que BFS encuentra hacia el destino
          es siempre el más corto en número de pasos.
        </p>
        <p>
          <strong>Complejidad:</strong> O(V + E) en tiempo y O(V) en memoria, donde V son los nodos y E las aristas.
        </p>
        <ol className="bfs-steps">
          <li><strong>Inicio:</strong> se coloca el nodo inicial en la cola y se marca como descubierto.</li>
          <li><strong>Procesar:</strong> se saca el primer nodo de la cola.</li>
          <li><strong>Expandir:</strong> sus vecinos no descubiertos se marcan y se agregan al final de la cola.</li>
          <li><strong>Terminar:</strong> se repite hasta llegar al destino o hasta que la cola quede vacía.</li>
        </ol>
        <p>
          <strong>Instrucciones:</strong> arrastra sobre la cuadrícula para dibujar o borrar muros y presiona
          "Ejecutar BFS". También puedes avanzar con "Siguiente paso".
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={() => start(true)}>
          Ejecutar BFS
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
        <button className="btn btn-success" onClick={randomWalls}>
          Muros aleatorios
        </button>
        <button className="btn btn-secondary" onClick={clearWalls}>
          Limpiar muros
        </button>
        <label className="bfs-speed">
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
        <div className="bfs-panel">
          <div className="bfs-legend">
            <span><i className="start" />Inicio</span>
            <span><i className="end" />Destino</span>
            <span><i className="wall" />Muro</span>
            <span><i className="queued" />En la cola</span>
            <span><i className="current" />Procesando</span>
            <span><i className="visited" />Explorada</span>
            <span><i className="path" />Camino</span>
          </div>

          <div
            className="bfs-grid"
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
                />
              );
            })}
          </div>

          <div className="bfs-stats">
            <span>Celdas exploradas: <strong>{step ? step.visitedCount : 0}</strong></span>
            <span>Tamaño de la cola: <strong>{step ? step.queue.length : 0}</strong></span>
            <span>Muros: <strong>{walls.size}</strong></span>
          </div>

          <div className="bfs-queue">
            <div className="bfs-queue-title">Cola (el frente está a la izquierda)</div>
            <div className="bfs-queue-items">
              {queueItems.length === 0 && <span className="bfs-empty">vacía</span>}
              {queueItems.map((k, i) => (
                <span key={k} className={`bfs-chip${i === 0 ? ' front' : ''}`}>{label(k)}</span>
              ))}
              {queueExtra > 0 && <span className="bfs-empty">+{queueExtra} más</span>}
            </div>
          </div>

          {run ? (
            <div className="bfs-explain">
              <div className="bfs-count">Paso {stepIndex + 1} de {run.steps.length}</div>
              <div>{step.text}</div>
            </div>
          ) : (
            <p className="bfs-hint">
              Presiona "Ejecutar BFS" para ver el proceso, o "Siguiente paso" para avanzar manualmente.
            </p>
          )}

          {finished && (run.found ? (
            <div className="bfs-result ok">
              <h4>Camino encontrado</h4>
              <p><strong>Distancia mínima:</strong> {run.path.length - 1} pasos</p>
              <p><strong>Celdas exploradas:</strong> {run.order.length}</p>
            </div>
          ) : (
            <div className="bfs-result no">
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
