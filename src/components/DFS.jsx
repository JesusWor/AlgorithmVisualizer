import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/dfs.css';

const ROWS = 12;
const COLS = 20;
const START = { row: 6, col: 3 };
const END = { row: 6, col: 16 };
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const STACK_PREVIEW = 16;

const key = (row, col) => `${row}-${col}`;
const label = (k) => `(${k.replace('-', ',')})`;
const START_KEY = key(START.row, START.col);
const END_KEY = key(END.row, END.col);

// Ejecuta DFS completo y lo convierte en una lista de pasos para reproducir
const buildRun = (walls) => {
  const stack = [{ k: START_KEY, from: null }];
  const parent = new Map();
  const order = [];
  const steps = [{
    current: null, visitedCount: 0, pathCount: 0, stack: [START_KEY],
    text: `Se coloca el inicio ${label(START_KEY)} en la pila.`
  }];
  let found = false;

  while (stack.length > 0) {
    const { k: current, from } = stack.pop();

    if (parent.has(current)) {
      steps.push({
        current: null, visitedCount: order.length, pathCount: 0, stack: stack.map(e => e.k),
        text: `Se saca ${label(current)} de la pila: ya fue visitado, se descarta.`
      });
      continue;
    }

    parent.set(current, from);
    order.push(current);
    const [row, col] = current.split('-').map(Number);

    if (current === END_KEY) {
      found = true;
      steps.push({
        current, visitedCount: order.length, pathCount: 0, stack: stack.map(e => e.k),
        text: `Se saca ${label(current)} de la pila: es el destino.`
      });
      break;
    }

    // Se apilan en orden inverso para que arriba sea el primero en salir
    let added = 0;
    for (let i = DIRECTIONS.length - 1; i >= 0; i--) {
      const nr = row + DIRECTIONS[i][0];
      const nc = col + DIRECTIONS[i][1];
      const k = key(nr, nc);
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (walls.has(k) || parent.has(k)) continue;
      stack.push({ k, from: current });
      added++;
    }

    steps.push({
      current, visitedCount: order.length, pathCount: 0, stack: stack.map(e => e.k),
      text: added > 0
        ? `Se saca ${label(current)} de la pila, se marca como visitado y se apilan ${added} vecinos.`
        : `Se saca ${label(current)} de la pila. Es un callejón sin salida: se retrocede al siguiente de la pila.`
    });
  }

  const path = [];
  if (found) {
    for (let k = END_KEY; k; k = parent.get(k)) path.unshift(k);
    path.forEach((k, i) => steps.push({
      current: null, visitedCount: order.length, pathCount: i + 1, stack: [],
      text: `Camino encontrado: celda ${i + 1} de ${path.length} ${label(k)}.`
    }));
  }

  steps.push({
    current: null, visitedCount: order.length, pathCount: path.length, stack: [],
    text: found
      ? `DFS llegó al destino con un camino de ${path.length - 1} pasos tras explorar ${order.length} celdas.`
      : 'La pila quedó vacía sin llegar al destino: no existe un camino.'
  });

  return { steps, order, path, found };
};

export function DepthFirstSearch() {
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
  const stacked = step ? new Set(step.stack) : new Set();
  const pathSet = step ? new Set(run.path.slice(0, step.pathCount)) : new Set();

  const cellClass = (row, col) => {
    const k = key(row, col);
    let cls = 'dfs-cell';
    if (k === START_KEY) cls += ' start';
    else if (k === END_KEY) cls += ' end';
    else if (walls.has(k)) cls += ' wall';
    else if (pathSet.has(k)) cls += ' path';
    else if (step && step.current === k) cls += ' current';
    else if (visited.has(k)) cls += ' visited';
    else if (stacked.has(k)) cls += ' stacked';
    return cls;
  };

  const stackItems = step ? step.stack.slice(-STACK_PREVIEW) : [];
  const stackHidden = step ? Math.max(0, step.stack.length - STACK_PREVIEW) : 0;

  const cppCode = `#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>
using namespace std;

const int dr[] = {-1, 0, 1, 0};
const int dc[] = {0, 1, 0, -1};

vector<pair<int, int>> dfs(const vector<vector<int>>& grid,
                           pair<int, int> start, pair<int, int> end) {
    int rows = grid.size();
    int cols = grid[0].size();

    vector<vector<bool>> visited(rows, vector<bool>(cols, false));
    vector<vector<pair<int, int>>> parent(rows, vector<pair<int, int>>(cols, {-1, -1}));
    stack<pair<pair<int, int>, pair<int, int>>> st; // {nodo, padre}

    st.push({start, {-1, -1}});

    while (!st.empty()) {
        auto [node, from] = st.top();
        st.pop();
        auto [r, c] = node;

        if (visited[r][c]) continue;
        visited[r][c] = true;
        parent[r][c] = from;

        if (node == end) {
            vector<pair<int, int>> path;
            pair<int, int> cur = end;
            while (cur.first != -1) {
                path.push_back(cur);
                cur = parent[cur.first][cur.second];
            }
            reverse(path.begin(), path.end());
            return path;
        }

        // Orden inverso: el primer vecino (arriba) sale primero de la pila
        for (int i = 3; i >= 0; i--) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == 1 || visited[nr][nc]) continue;

            st.push({{nr, nc}, {r, c}});
        }
    }
    return {};
}

int main() {
    vector<vector<int>> grid(12, vector<int>(20, 0));
    for (int r = 2; r < 10; r++) grid[r][10] = 1; // muro vertical

    auto path = dfs(grid, {6, 3}, {6, 16});
    if (path.empty()) {
        cout << "No existe un camino" << endl;
    } else {
        cout << "Camino de " << path.size() - 1 << " pasos (no necesariamente el más corto)" << endl;
        for (auto [r, c] : path) cout << "(" << r << "," << c << ") ";
        cout << endl;
    }
    return 0;
}`;

  const pythonCode = `DIRECTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]

def dfs(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    parent = {}               # también funciona como conjunto de visitados
    stack = [(start, None)]   # (nodo, padre)

    while stack:
        (r, c), came_from = stack.pop()

        if (r, c) in parent:
            continue
        parent[(r, c)] = came_from

        if (r, c) == end:
            path = []
            node = end
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]

        # Orden inverso: el primer vecino (arriba) sale primero de la pila
        for dr, dc in reversed(DIRECTIONS):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == 1 or (nr, nc) in parent:
                continue

            stack.append(((nr, nc), (r, c)))

    return []

# Uso
grid = [[0] * 20 for _ in range(12)]
for r in range(2, 10):
    grid[r][10] = 1  # muro vertical

path = dfs(grid, (6, 3), (6, 16))
if path:
    print(f"Camino de {len(path) - 1} pasos (no necesariamente el más corto)")
    print(path)
else:
    print("No existe un camino")`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Búsqueda en Profundidad (DFS)</h2>

      <div className="explanation-section">
        <h3>¿Qué es DFS?</h3>
        <p>
          La búsqueda en profundidad (Depth-First Search) avanza por un camino tan lejos como puede
          antes de probar otro. Cuando llega a un callejón sin salida, retrocede hasta la última
          bifurcación pendiente y sigue por ahí. Usa una pila (LIFO), por lo que siempre se procesa
          primero el nodo que se agregó más recientemente.
        </p>
        <p>
          A diferencia de BFS, DFS no garantiza encontrar el camino más corto: devuelve el primer
          camino que descubre, que puede ser mucho más largo que el óptimo. A cambio, solo necesita
          recordar la rama actual y las bifurcaciones pendientes.
        </p>
        <p>
          <strong>Complejidad:</strong> O(V + E) en tiempo y O(V) en memoria, donde V son los nodos y E las aristas.
        </p>
        <ol className="dfs-steps">
          <li><strong>Inicio:</strong> se coloca el nodo inicial en la pila.</li>
          <li><strong>Procesar:</strong> se saca el nodo del tope. Si ya fue visitado, se descarta.</li>
          <li><strong>Expandir:</strong> se marca como visitado y se apilan sus vecinos no visitados.</li>
          <li><strong>Terminar:</strong> se repite hasta llegar al destino o hasta que la pila quede vacía.</li>
        </ol>
        <p>
          <strong>Instrucciones:</strong> arrastra sobre la cuadrícula para dibujar o borrar muros y presiona
          "Ejecutar DFS". También puedes avanzar con "Siguiente paso". Prueba los mismos muros en BFS
          para comparar la longitud de los caminos.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={() => start(true)}>
          Ejecutar DFS
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
        <label className="dfs-speed">
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
        <div className="dfs-panel">
          <div className="dfs-legend">
            <span><i className="start" />Inicio</span>
            <span><i className="end" />Destino</span>
            <span><i className="wall" />Muro</span>
            <span><i className="stacked" />En la pila</span>
            <span><i className="current" />Procesando</span>
            <span><i className="visited" />Explorada</span>
            <span><i className="path" />Camino</span>
          </div>

          <div
            className="dfs-grid"
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

          <div className="dfs-stats">
            <span>Celdas exploradas: <strong>{step ? step.visitedCount : 0}</strong></span>
            <span>Tamaño de la pila: <strong>{step ? step.stack.length : 0}</strong></span>
            <span>Muros: <strong>{walls.size}</strong></span>
          </div>

          <div className="dfs-stack">
            <div className="dfs-stack-title">Pila (el tope está a la derecha)</div>
            <div className="dfs-stack-items">
              {stackHidden > 0 && <span className="dfs-empty">+{stackHidden} más abajo</span>}
              {stackItems.length === 0 && <span className="dfs-empty">vacía</span>}
              {stackItems.map((k, i) => (
                <span
                  key={`${k}-${i}`}
                  className={`dfs-chip${i === stackItems.length - 1 ? ' top' : ''}`}
                >
                  {label(k)}
                </span>
              ))}
            </div>
          </div>

          {run ? (
            <div className="dfs-explain">
              <div className="dfs-count">Paso {stepIndex + 1} de {run.steps.length}</div>
              <div>{step.text}</div>
            </div>
          ) : (
            <p className="dfs-hint">
              Presiona "Ejecutar DFS" para ver el proceso, o "Siguiente paso" para avanzar manualmente.
            </p>
          )}

          {finished && (run.found ? (
            <div className="dfs-result ok">
              <h4>Camino encontrado</h4>
              <p><strong>Longitud del camino:</strong> {run.path.length - 1} pasos</p>
              <p><strong>Celdas exploradas:</strong> {run.order.length}</p>
              <p>DFS devuelve el primer camino que encuentra, que no siempre es el más corto.</p>
            </div>
          ) : (
            <div className="dfs-result no">
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
