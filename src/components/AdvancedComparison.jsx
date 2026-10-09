import { useState, useEffect, useRef } from 'react';
import '../styles/common.css';
import '../styles/comparison.css';

const MAX_ANIM_N = 8;
const SUBSET_ARR = Array.from({ length: 12 }, (_, i) => i + 1);
const SUBSET_TARGET = 20;
const QUEENS_ALGOS = ['Backtracking Normal', 'Backtracking + Bitmask'];
const SUBSET_ALGOS = ['Backtracking', 'Meet in the Middle'];
const PHASE_LABEL = {
  L: 'Mitad izquierda: generando sumas',
  R: 'Mitad derecha: buscando complemento'
};

const STYLES = `
.adv-grids { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1rem 0 2rem; }
.adv-card { background: rgba(15, 23, 42, 0.6); border-radius: 8px; padding: 0.75rem; }
.adv-board { display: grid; gap: 1px; background: #0f172a; border: 1px solid #334155; max-width: 320px; margin: 0 auto; }
.adv-cell { aspect-ratio: 1; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #fbbf24; }
.adv-cell.dark { background: #273449; }
.adv-cell.queen { background: #7c6bd6; animation: adv-pop 0.25s ease-out; }
.adv-cell.reject { background: #ef4444; }
.adv-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.adv-chip { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #1e293b; color: #94a3b8; transition: background 0.15s, color 0.15s; }
.adv-chip.gap { margin-left: 14px; }
.adv-chip.on { background: #7c6bd6; color: #fff; }
.adv-chip.on.hit { background: #10b981; }
.adv-meta { margin-top: 0.5rem; font-size: 0.85rem; color: #94a3b8; text-align: center; line-height: 1.6; }
@keyframes adv-pop { 0% { transform: scale(0.4); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
`;

// Eventos: ['p', fila, col] coloca, ['r', fila, col] retira, ['x', fila, col] rechaza, ['s'] solución
const traceQueens = (n, useBitmask) => {
  const events = [];

  if (!useBitmask) {
    const board = Array(n).fill(-1);
    const isSafe = (row, col) => {
      for (let i = 0; i < row; i++) {
        if (board[i] === col || Math.abs(board[i] - col) === Math.abs(i - row)) return false;
      }
      return true;
    };
    const solve = (row) => {
      if (row === n) { events.push(['s']); return; }
      for (let col = 0; col < n; col++) {
        if (isSafe(row, col)) {
          board[row] = col;
          events.push(['p', row, col]);
          solve(row + 1);
          board[row] = -1;
          events.push(['r', row, col]);
        } else {
          events.push(['x', row, col]);
        }
      }
    };
    solve(0);
  } else {
    const solve = (row, cols, d1, d2) => {
      if (row === n) { events.push(['s']); return; }
      let available = ((1 << n) - 1) & ~(cols | d1 | d2);
      while (available) {
        const pos = available & -available;
        available -= pos;
        const col = 31 - Math.clz32(pos);
        events.push(['p', row, col]);
        solve(row + 1, cols | pos, (d1 | pos) << 1, (d2 | pos) >> 1);
        events.push(['r', row, col]);
      }
    };
    solve(0, 0, 0, 0);
  }
  return events;
};

// Eventos: [mascara de elementos, suma, soluciones encontradas, fase]
const traceSubsetBacktracking = () => {
  const events = [];
  const solve = (index, sum, mask) => {
    const hit = sum === SUBSET_TARGET;
    events.push([mask, sum, hit ? 1 : 0, 'B']);
    if (hit || index >= SUBSET_ARR.length || sum > SUBSET_TARGET) return;
    solve(index + 1, sum + SUBSET_ARR[index], mask | (1 << index));
    solve(index + 1, sum, mask);
  };
  solve(0, 0, 0);
  return events;
};

const traceSubsetMITM = () => {
  const n = SUBSET_ARR.length;
  const mid = Math.floor(n / 2);
  const events = [];
  const leftSums = new Map();

  for (let mask = 0; mask < (1 << mid); mask++) {
    let sum = 0;
    for (let i = 0; i < mid; i++) if (mask & (1 << i)) sum += SUBSET_ARR[i];
    leftSums.set(sum, (leftSums.get(sum) || 0) + 1);
    events.push([mask, sum, 0, 'L']);
  }
  for (let mask = 0; mask < (1 << (n - mid)); mask++) {
    let sum = 0;
    for (let i = 0; i < n - mid; i++) if (mask & (1 << i)) sum += SUBSET_ARR[mid + i];
    events.push([mask << mid, sum, leftSums.get(SUBSET_TARGET - sum) || 0, 'R']);
  }
  return events;
};

const newQueensState = (n) => ({
  board: Array(n).fill(-1), flash: null, lastSolution: null, states: 1, solutions: 0, done: false
});
const newSubsetState = () => ({
  mask: 0, sum: 0, phase: null, hit: false, states: 0, solutions: 0, done: false
});

const applyQueens = (s, events) => {
  s.flash = null;
  for (const [type, row, col] of events) {
    if (type === 'p') { s.board[row] = col; s.states++; s.flash = null; }
    else if (type === 'r') { s.board[row] = -1; s.flash = null; }
    else if (type === 'x') { s.flash = { row, col }; }
    else { s.solutions++; s.lastSolution = [...s.board]; }
  }
};

const applySubset = (s, events) => {
  for (const [mask, sum, hits, phase] of events) {
    s.mask = mask;
    s.sum = sum;
    s.phase = phase;
    s.hit = hits > 0;
    s.states++;
    s.solutions += hits;
  }
};

export function AdvancedComparison() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [problemSize, setProblemSize] = useState(8);
  const [frames, setFrames] = useState({});
  const timerRef = useRef(null);
  const animN = Math.min(problemSize, MAX_ANIM_N);

  useEffect(() => () => clearInterval(timerRef.current), []);
  

  // N-Queens con Backtracking Normal
  const solveNQueensBacktracking = (n) => {
    const startTime = performance.now();
    let solutionsFound = 0;
    let statesExplored = 0;
    const board = Array(n).fill(-1);

    const isSafe = (row, col) => {
      for (let i = 0; i < row; i++) {
        if (board[i] === col || 
            Math.abs(board[i] - col) === Math.abs(i - row)) {
          return false;
        }
      }
      return true;
    };

    const solve = (row) => {
      statesExplored++;
      if (row === n) {
        solutionsFound++;
        return;
      }

      for (let col = 0; col < n; col++) {
        if (isSafe(row, col)) {
          board[row] = col;
          solve(row + 1);
          board[row] = -1;
        }
      }
    };

    solve(0);
    const endTime = performance.now();

    return {
      solutionsFound,
      statesExplored,
      time: (endTime - startTime).toFixed(2),
      efficiency: (solutionsFound / statesExplored * 100).toFixed(2)
    };
  };

  // N-Queens con Backtracking + Bitmask
  const solveNQueensBitmask = (n) => {
    const startTime = performance.now();
    let solutionsFound = 0;
    let statesExplored = 0;

    const solve = (row, cols, diag1, diag2) => {
      statesExplored++;
      if (row === n) {
        solutionsFound++;
        return;
      }

      let availablePositions = ((1 << n) - 1) & ~(cols | diag1 | diag2);

      while (availablePositions) {
        const position = availablePositions & -availablePositions;
        availablePositions -= position;
        
        solve(
          row + 1,
          cols | position,
          (diag1 | position) << 1,
          (diag2 | position) >> 1
        );
      }
    };

    solve(0, 0, 0, 0);
    const endTime = performance.now();

    return {
      solutionsFound,
      statesExplored,
      time: (endTime - startTime).toFixed(2),
      efficiency: (solutionsFound / statesExplored * 100).toFixed(2)
    };
  };

  // Subset Sum con Backtracking
  const solveSubsetSumBacktracking = (targetSum) => {
    const startTime = performance.now();
    const arr = Array.from({ length: 12 }, (_, i) => i + 1);
    let solutionsFound = 0;
    let statesExplored = 0;

    const solve = (index, currentSum) => {
      statesExplored++;
      
      if (currentSum === targetSum) {
        solutionsFound++;
        return;
      }
      
      if (index >= arr.length || currentSum > targetSum) {
        return;
      }

      // Incluir elemento actual
      solve(index + 1, currentSum + arr[index]);
      
      // No incluir elemento actual
      solve(index + 1, currentSum);
    };

    solve(0, 0);
    const endTime = performance.now();

    return {
      solutionsFound,
      statesExplored,
      time: (endTime - startTime).toFixed(2),
      efficiency: (solutionsFound / statesExplored * 100).toFixed(2)
    };
  };

  // Subset Sum con Meet in the Middle
  const solveSubsetSumMITM = (targetSum) => {
    const startTime = performance.now();
    const arr = Array.from({ length: 12 }, (_, i) => i + 1);
    const n = arr.length;
    const mid = Math.floor(n / 2);
    
    let solutionsFound = 0;
    let statesExplored = 0;

    // Generar todas las sumas de la primera mitad
    const leftSums = new Map();
    for (let mask = 0; mask < (1 << mid); mask++) {
      statesExplored++;
      let sum = 0;
      for (let i = 0; i < mid; i++) {
        if (mask & (1 << i)) {
          sum += arr[i];
        }
      }
      leftSums.set(sum, (leftSums.get(sum) || 0) + 1);
    }

    // Generar todas las sumas de la segunda mitad y buscar complemento
    for (let mask = 0; mask < (1 << (n - mid)); mask++) {
      statesExplored++;
      let sum = 0;
      for (let i = 0; i < (n - mid); i++) {
        if (mask & (1 << i)) {
          sum += arr[mid + i];
        }
      }
      
      const needed = targetSum - sum;
      if (leftSums.has(needed)) {
        solutionsFound += leftSums.get(needed);
      }
    }

    const endTime = performance.now();

    return {
      solutionsFound,
      statesExplored,
      time: (endTime - startTime).toFixed(2),
      efficiency: (solutionsFound / statesExplored * 100).toFixed(2)
    };
  };

  const compareAll = async () => {
    clearInterval(timerRef.current);
    setRunning(true);
    setResults({});
    setFrames({});

    await new Promise(resolve => setTimeout(resolve, 100));

    // Métricas reales, sin animación
    const finalResults = {
      queens: {
        'Backtracking Normal': solveNQueensBacktracking(problemSize),
        'Backtracking + Bitmask': solveNQueensBitmask(problemSize)
      },
      subset: {
        'Backtracking': solveSubsetSumBacktracking(SUBSET_TARGET),
        'Meet in the Middle': solveSubsetSumMITM(SUBSET_TARGET)
      }
    };

    // Animación
    const traces = {
      'Backtracking Normal': traceQueens(animN, false),
      'Backtracking + Bitmask': traceQueens(animN, true),
      'Backtracking': traceSubsetBacktracking(),
      'Meet in the Middle': traceSubsetMITM()
    };
    const state = {
      'Backtracking Normal': newQueensState(animN),
      'Backtracking + Bitmask': newQueensState(animN),
      'Backtracking': newSubsetState(),
      'Meet in the Middle': newSubsetState()
    };

    // Todos avanzan al mismo ritmo: el que tiene menos pasos termina antes
    const longest = Math.max(...Object.values(traces).map(t => t.length));
    const perTick = Math.max(1, Math.ceil(longest / 300));
    let pos = 0;

    timerRef.current = setInterval(() => {
      const next = pos + perTick;
      const snapshot = {};

      for (const [name, events] of Object.entries(traces)) {
        const s = state[name];
        ('board' in s ? applyQueens : applySubset)(s, events.slice(pos, next));
        s.done = next >= events.length;
        snapshot[name] = { ...s };
        if (s.board) snapshot[name].board = [...s.board];
      }

      pos = next;
      setFrames(snapshot);

      if (pos >= longest) {
        clearInterval(timerRef.current);
        setResults(finalResults);
        setRunning(false);
      }
    }, 30);
  };

  const clearResults = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setResults({});
    setFrames({});
  };

  const comparisonCode = {
    cpp: `// Comparación de Algoritmos Avanzados
#include <iostream>
#include <vector>
#include <map>
using namespace std;

// N-Queens con Backtracking Normal
class NQueensBacktracking {
    int n, solutions, states;
    vector<int> board;
    
    bool isSafe(int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i] == col || 
                abs(board[i] - col) == abs(i - row))
                return false;
        }
        return true;
    }
    
    void solve(int row) {
        states++;
        if (row == n) {
            solutions++;
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (isSafe(row, col)) {
                board[row] = col;
                solve(row + 1);
                board[row] = -1;
            }
        }
    }
    
public:
    void run(int size) {
        n = size;
        solutions = states = 0;
        board.assign(n, -1);
        solve(0);
        cout << "Soluciones: " << solutions 
             << ", Estados: " << states << endl;
    }
};

// N-Queens con Bitmask (Optimizado)
class NQueensBitmask {
    int n, solutions, states;
    
    void solve(int row, int cols, int diag1, int diag2) {
        states++;
        if (row == n) {
            solutions++;
            return;
        }
        
        int available = ((1 << n) - 1) & ~(cols | diag1 | diag2);
        
        while (available) {
            int pos = available & -available;
            available -= pos;
            solve(row + 1, cols | pos, 
                  (diag1 | pos) << 1, 
                  (diag2 | pos) >> 1);
        }
    }
    
public:
    void run(int size) {
        n = size;
        solutions = states = 0;
        solve(0, 0, 0, 0);
        cout << "Soluciones: " << solutions 
             << ", Estados: " << states << endl;
    }
};

// Meet in the Middle para Subset Sum
class SubsetSumMITM {
public:
    int solve(vector<int>& arr, int target) {
        int n = arr.size();
        int mid = n / 2;
        int solutions = 0;
        
        // Primera mitad
        map<int, int> leftSums;
        for (int mask = 0; mask < (1 << mid); mask++) {
            int sum = 0;
            for (int i = 0; i < mid; i++) {
                if (mask & (1 << i)) sum += arr[i];
            }
            leftSums[sum]++;
        }
        
        // Segunda mitad
        for (int mask = 0; mask < (1 << (n - mid)); mask++) {
            int sum = 0;
            for (int i = 0; i < (n - mid); i++) {
                if (mask & (1 << i)) sum += arr[mid + i];
            }
            
            int needed = target - sum;
            if (leftSums.count(needed)) {
                solutions += leftSums[needed];
            }
        }
        
        return solutions;
    }
};

int main() {
    // Comparar N-Queens
    cout << "N-Queens (8x8):" << endl;
    NQueensBacktracking nqb;
    nqb.run(8);
    
    NQueensBitmask nqm;
    nqm.run(8);
    
    // Comparar Subset Sum
    cout << "\\nSubset Sum:" << endl;
    vector<int> arr = {1,2,3,4,5,6,7,8,9,10,11,12};
    SubsetSumMITM mitm;
    cout << "Soluciones: " << mitm.solve(arr, 20) << endl;
    
    return 0;
}`,
    python: `# Comparación de Algoritmos Avanzados

# N-Queens con Backtracking Normal
class NQueensBacktracking:
    def __init__(self):
        self.solutions = 0
        self.states = 0
    
    def is_safe(self, board, row, col):
        for i in range(row):
            if (board[i] == col or 
                abs(board[i] - col) == abs(i - row)):
                return False
        return True
    
    def solve(self, board, row, n):
        self.states += 1
        if row == n:
            self.solutions += 1
            return
        
        for col in range(n):
            if self.is_safe(board, row, col):
                board[row] = col
                self.solve(board, row + 1, n)
                board[row] = -1
    
    def run(self, n):
        board = [-1] * n
        self.solve(board, 0, n)
        print(f"Soluciones: {self.solutions}, Estados: {self.states}")

# N-Queens con Bitmask
class NQueensBitmask:
    def __init__(self):
        self.solutions = 0
        self.states = 0
        self.n = 0
    
    def solve(self, row, cols, diag1, diag2):
        self.states += 1
        if row == self.n:
            self.solutions += 1
            return
        
        available = ((1 << self.n) - 1) & ~(cols | diag1 | diag2)
        
        while available:
            pos = available & -available
            available -= pos
            self.solve(row + 1, 
                      cols | pos,
                      (diag1 | pos) << 1,
                      (diag2 | pos) >> 1)
    
    def run(self, n):
        self.n = n
        self.solve(0, 0, 0, 0)
        print(f"Soluciones: {self.solutions}, Estados: {self.states}")

# Meet in the Middle para Subset Sum
class SubsetSumMITM:
    def solve(self, arr, target):
        n = len(arr)
        mid = n // 2
        
        # Primera mitad
        left_sums = {}
        for mask in range(1 << mid):
            s = sum(arr[i] for i in range(mid) if mask & (1 << i))
            left_sums[s] = left_sums.get(s, 0) + 1
        
        # Segunda mitad
        solutions = 0
        for mask in range(1 << (n - mid)):
            s = sum(arr[mid + i] for i in range(n - mid) if mask & (1 << i))
            needed = target - s
            if needed in left_sums:
                solutions += left_sums[needed]
        
        return solutions

# Uso
print("N-Queens (8x8):")
nqb = NQueensBacktracking()
nqb.run(8)

nqm = NQueensBitmask()
nqm.run(8)

print("\\nSubset Sum:")
arr = list(range(1, 13))
mitm = SubsetSumMITM()
print(f"Soluciones: {mitm.solve(arr, 20)}")`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const renderQueens = (name) => {
    const s = frames[name];
    const n = s ? s.board.length : animN;
    const board = s ? (s.done && s.lastSolution ? s.lastSolution : s.board) : Array(n).fill(-1);

    return (
      <div className="adv-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n * n }, (_, i) => {
          const row = Math.floor(i / n);
          const col = i % n;
          let cls = 'adv-cell';
          if ((row + col) % 2) cls += ' dark';
          if (board[row] === col) cls += ' queen';
          else if (s?.flash && s.flash.row === row && s.flash.col === col) cls += ' reject';
          return <div key={i} className={cls}>{board[row] === col ? '♛' : ''}</div>;
        })}
      </div>
    );
  };

  const renderSubset = (name) => {
    const s = frames[name] || newSubsetState();
    const sumLabel =
      s.phase === 'R' ? `Suma: ${s.sum} (complemento: ${SUBSET_TARGET - s.sum})` :
      s.phase === 'L' ? `Suma: ${s.sum}` :
      `Suma: ${s.sum} / ${SUBSET_TARGET}`;

    return (
      <>
        <div className="adv-chips">
          {SUBSET_ARR.map((v, i) => {
            let cls = 'adv-chip';
            if (name === 'Meet in the Middle' && i === SUBSET_ARR.length / 2) cls += ' gap';
            if (s.mask & (1 << i)) cls += ' on';
            if (s.hit) cls += ' hit';
            return <div key={v} className={cls}>{v}</div>;
          })}
        </div>
        <div className="adv-meta">{sumLabel}</div>
      </>
    );
  };

  const renderStats = (name) => {
    const s = frames[name];
    return (
      <div className="adv-meta">
        {PHASE_LABEL[s?.phase] && <div>{PHASE_LABEL[s.phase]}</div>}
        <div>Estados: {s ? s.states : 0} | Soluciones: {s ? s.solutions : 0}</div>
      </div>
    );
  };

  return (
    <div className="algo-container">
      <style>{STYLES}</style>
      <h2 className="section-title">Comparación de Algoritmos Avanzados</h2>

      <div className="explanation-section">
        <h3>Comparando Técnicas de Optimización</h3>
        <p>
          Esta herramienta compara diferentes enfoques para resolver problemas complejos,
          mostrando cómo las optimizaciones pueden mejorar dramáticamente el rendimiento.
        </p>
        
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Problema 1: N-Queens</h4>
          <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
            <li><strong>Backtracking Normal:</strong> Usa arrays y validación de posiciones</li>
            <li><strong>Backtracking + Bitmask:</strong> Usa operaciones de bits para validación ultra-rápida</li>
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Problema 2: Subset Sum</h4>
          <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
            <li><strong>Backtracking:</strong> O(2^n) - Explora todas las combinaciones</li>
            <li><strong>Meet in the Middle:</strong> O(2^(n/2)) - Divide el problema en dos mitades</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
            <strong>Tamaño del tablero N-Queens: {problemSize}x{problemSize}</strong>
          </label>
          <input 
            type="range" 
            min="4" 
            max="12" 
            value={problemSize}
            onChange={(e) => setProblemSize(parseInt(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: '#a78bfa'
            }}
            disabled={running}
          />
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Tamaños mayores a 10 pueden tardar varios segundos
          </p>
        </div>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={compareAll} disabled={running}>
          {running ? 'Comparando...' : 'Comparar Todos'}
        </button>
        <button className="btn btn-secondary" onClick={clearResults} disabled={running}>
          Limpiar
        </button>
      </div>

      <h3 style={{ color: '#a78bfa', marginTop: '1.5rem' }}>
        Ejecución N-Queens ({animN}x{animN})
      </h3>
      <div className="adv-grids">
        {QUEENS_ALGOS.map(name => (
          <div key={name} className="adv-card">
            <h4 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#60a5fa' }}>{name}</h4>
            {renderQueens(name)}
            {renderStats(name)}
          </div>
        ))}
      </div>

      <h3 style={{ color: '#a78bfa' }}>Ejecución Subset Sum (objetivo = {SUBSET_TARGET})</h3>
      <div className="adv-grids">
        {SUBSET_ALGOS.map(name => (
          <div key={name} className="adv-card">
            <h4 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#60a5fa' }}>{name}</h4>
            {renderSubset(name)}
            {renderStats(name)}
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="results-section">
          <h3 style={{ color: '#a78bfa', marginBottom: '1.5rem' }}>Resultados de la Comparación</h3>
          
          {/* N-Queens Results */}
          {results.queens && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>
                N-Queens Problem ({problemSize}x{problemSize})
              </h4>
              <div className="results-grid">
                {Object.entries(results.queens).map(([algorithm, result]) => (
                  <div key={algorithm} className="result-card">
                    <h4>{algorithm}</h4>
                    <div className="result-stats">
                      <div className="stat">
                        <span className="stat-label">Tiempo:</span>
                        <span className="stat-value">{result.time} ms</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Soluciones:</span>
                        <span className="stat-value">{result.solutionsFound}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Estados Explorados:</span>
                        <span className="stat-value">{result.statesExplored.toLocaleString()}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Eficiencia:</span>
                        <span className="stat-value">{result.efficiency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {results.queens['Backtracking Normal'] && results.queens['Backtracking + Bitmask'] && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <p style={{ margin: 0 }}>
                    <strong>Mejora con Bitmask:</strong>{' '}
                    {(
                      ((parseFloat(results.queens['Backtracking Normal'].time) - 
                        parseFloat(results.queens['Backtracking + Bitmask'].time)) / 
                        parseFloat(results.queens['Backtracking Normal'].time)) * 100
                    ).toFixed(1)}% más rápido |{' '}
                    {(
                      ((results.queens['Backtracking Normal'].statesExplored - 
                        results.queens['Backtracking + Bitmask'].statesExplored) / 
                        results.queens['Backtracking Normal'].statesExplored) * 100
                    ).toFixed(1)}% menos estados explorados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Subset Sum Results */}
          {results.subset && (
            <div>
              <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>
                Subset Sum Problem (target = 20)
              </h4>
              <div className="results-grid">
                {Object.entries(results.subset).map(([algorithm, result]) => (
                  <div key={algorithm} className="result-card">
                    <h4>{algorithm}</h4>
                    <div className="result-stats">
                      <div className="stat">
                        <span className="stat-label">Tiempo:</span>
                        <span className="stat-value">{result.time} ms</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Soluciones:</span>
                        <span className="stat-value">{result.solutionsFound}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Estados Explorados:</span>
                        <span className="stat-value">{result.statesExplored.toLocaleString()}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Eficiencia:</span>
                        <span className="stat-value">{result.efficiency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.subset['Backtracking'] && results.subset['Meet in the Middle'] && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <p style={{ margin: 0 }}>
                    <strong>Mejora con Meet in the Middle:</strong>{' '}
                    {(
                      ((parseFloat(results.subset['Backtracking'].time) - 
                        parseFloat(results.subset['Meet in the Middle'].time)) / 
                        parseFloat(results.subset['Backtracking'].time)) * 100
                    ).toFixed(1)}% más rápido |{' '}
                    Complejidad reducida de O(2^n) a O(2^(n/2))
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="explanation-section" style={{ marginTop: '2rem' }}>
        <h3>Conclusiones</h3>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li>
            <strong>Bitmask:</strong> Usa operaciones de bits extremadamente rápidas para 
            validar posiciones, eliminando bucles y condicionales costosos.
          </li>
          <li>
            <strong>Meet in the Middle:</strong> Reduce exponencialmente el espacio de búsqueda 
            al dividir el problema, convirtiendo O(2^n) en O(2^(n/2)).
          </li>
          <li>
            <strong>Trade-offs:</strong> Bitmask requiere más conocimiento técnico pero es más rápido. 
            MITM usa más memoria pero explora menos estados.
          </li>
        </ul>
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