import { useState } from 'react';
import '../styles/common.css';
import '../styles/chess.css';

export function BacktrackingBitmask() {
  const [board, setBoard] = useState(Array(8).fill(null).map(() => Array(8).fill(false)));
  const [queens, setQueens] = useState([]);
  const [solving, setSolving] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [stats, setStats] = useState({ attempts: 0, backtracks: 0 });

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const solveNQueensBitmask = async () => {
    setSolving(true);
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(false));
    setBoard(newBoard);
    let attempts = 0;
    let backtracks = 0;

    const solve = async (col, colMask, diagMask, antiDiagMask) => {
      if (col >= 8) {
        return true;
      }

      // Máscara de posiciones disponibles
      let availableMask = ((1 << 8) - 1) & ~(colMask | diagMask | antiDiagMask);

      while (availableMask > 0) {
        // Obtener la posición del bit menos significativo
        const bit = availableMask & -availableMask;
        const row = Math.log2(bit);
        
        attempts++;
        setStats({ attempts, backtracks });

        // Colocar la reina
        newBoard[row][col] = true;
        setBoard(newBoard.map(r => [...r]));
        await sleep(200);

        // Recursión con máscaras actualizadas
        if (await solve(
          col + 1,
          colMask | bit,
          (diagMask | bit) << 1,
          (antiDiagMask | bit) >> 1
        )) {
          return true;
        }

        // Backtracking
        backtracks++;
        setStats({ attempts, backtracks });
        newBoard[row][col] = false;
        setBoard(newBoard.map(r => [...r]));
        await sleep(100);

        // Remover el bit usado
        availableMask &= availableMask - 1;
      }

      return false;
    };

    await solve(0, 0, 0, 0);
    setSolving(false);
  };

  const reset = () => {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(false)));
    setQueens([]);
    setStats({ attempts: 0, backtracks: 0 });
  };

  const codes = {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

class NQueensBitmask {
public:
    vector<vector<int>> solutions;
    int n;
    
    void solveNQueens(int n) {
        this->n = n;
        vector<int> queens(n);
        solve(0, 0, 0, 0, queens);
    }
    
    void solve(int col, int colMask, int diagMask, int antiDiagMask, 
               vector<int>& queens) {
        if (col >= n) {
            solutions.push_back(queens);
            return;
        }
        
        // Máscara de posiciones disponibles
        // (1 << n) - 1 crea una máscara con n bits en 1
        int availableMask = ((1 << n) - 1) & 
                           ~(colMask | diagMask | antiDiagMask);
        
        while (availableMask) {
            // Obtener bit menos significativo
            int bit = availableMask & -availableMask;
            int row = __builtin_ctz(bit); // Count trailing zeros
            
            queens[col] = row;
            
            // Recursión con máscaras actualizadas
            solve(col + 1,
                 colMask | bit,
                 (diagMask | bit) << 1,
                 (antiDiagMask | bit) >> 1,
                 queens);
            
            // Remover bit usado
            availableMask &= availableMask - 1;
        }
    }
    
    void printSolution(vector<int>& queens) {
        for (int row : queens) {
            for (int col = 0; col < n; col++) {
                cout << (col == row ? "Q " : ". ");
            }
            cout << endl;
        }
        cout << endl;
    }
};

int main() {
    NQueensBitmask solver;
    solver.solveNQueens(8);
    
    cout << "Total soluciones: " << solver.solutions.size() << endl;
    if (!solver.solutions.empty()) {
        cout << "Primera solución:" << endl;
        solver.printSolution(solver.solutions[0]);
    }
    
    return 0;
}`,
    python: `class NQueensBitmask:
    def __init__(self, n):
        self.n = n
        self.solutions = []
    
    def solve_n_queens(self):
        self.solve(0, 0, 0, 0, [])
        return self.solutions
    
    def solve(self, col, col_mask, diag_mask, anti_diag_mask, queens):
        if col >= self.n:
            self.solutions.append(queens[:])
            return
        
        # Máscara de posiciones disponibles
        available_mask = ((1 << self.n) - 1) & \
                        ~(col_mask | diag_mask | anti_diag_mask)
        
        while available_mask:
            # Obtener bit menos significativo
            bit = available_mask & -available_mask
            row = (bit - 1).bit_length() - 1
            
            queens.append(row)
            
            # Recursión con máscaras actualizadas
            self.solve(
                col + 1,
                col_mask | bit,
                (diag_mask | bit) << 1,
                (anti_diag_mask | bit) >> 1,
                queens
            )
            
            queens.pop()
            
            # Remover bit usado
            available_mask &= available_mask - 1
    
    def print_solution(self, queens):
        for row in queens:
            line = ""
            for col in range(self.n):
                line += "Q " if col == row else ". "
            print(line)
        print()

# Uso
solver = NQueensBitmask(8)
solutions = solver.solve_n_queens()

print(f"Total soluciones: {len(solutions)}")
if solutions:
    print("Primera solución:")
    solver.print_solution(solutions[0])`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Backtracking con Bitmask - 8 Reinas</h2>

      <div className="explanation-section">
        <h3>Optimización con Máscaras de Bits</h3>
        <p>
          El problema de las 8 reinas consiste en colocar 8 reinas en un tablero de ajedrez 8×8 
          de manera que ninguna reina amenace a otra. Esta versión utiliza <strong>máscaras de bits</strong> 
          para optimizar el algoritmo de backtracking tradicional.
        </p>
        <p>
          <strong>Ventajas del Bitmask:</strong>
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li>Operaciones más rápidas usando operaciones bit a bit</li>
          <li>Menor uso de memoria al representar estados con bits</li>
          <li>Verificación de conflictos en O(1) en lugar de O(n)</li>
          <li>Tres máscaras para columnas, diagonales y anti-diagonales</li>
        </ul>
        <p>
          Complejidad: <strong>O(N!)</strong> pero con mejor rendimiento que backtracking tradicional.
        </p>
      </div>

      <div className="stats-section" style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        marginBottom: '1rem',
        padding: '1rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Intentos:</strong> <span style={{ color: '#a78bfa' }}>{stats.attempts}</span>
        </div>
        <div>
          <strong>Retrocesos:</strong> <span style={{ color: '#f59e0b' }}>{stats.backtracks}</span>
        </div>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={solveNQueensBitmask} disabled={solving}>
          {solving ? 'Resolviendo...' : 'Resolver'}
        </button>
        <button className="btn btn-secondary" onClick={reset} disabled={solving}>
          Reiniciar
        </button>
      </div>

      <div className="visualization-area">
        <div className="chess-board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="chess-row">
              {row.map((hasQueen, colIndex) => (
                <div
                  key={colIndex}
                  className={`chess-cell ${
                    (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'
                  } ${hasQueen ? 'has-queen' : ''}`}
                >
                  {hasQueen && <span className="queen">♛</span>}
                </div>
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
