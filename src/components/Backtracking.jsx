import { useState } from 'react';
import '../styles/common.css';
import '../styles/chess.css';

export function Backtracking() {
  const [board, setBoard] = useState(Array(8).fill(null).map(() => Array(8).fill(false)));
  const [queens, setQueens] = useState([]);
  const [solving, setSolving] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const isSafe = (board, row, col) => {
    for (let i = 0; i < col; i++) {
      if (board[row][i]) return false;
    }

    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j]) return false;
    }

    for (let i = row, j = col; i < 8 && j >= 0; i++, j--) {
      if (board[i][j]) return false;
    }

    return true;
  };

  const solveNQueens = async (board, col) => {
    if (col >= 8) {
      return true;
    }

    for (let i = 0; i < 8; i++) {
      if (isSafe(board, i, col)) {
        board[i][col] = true;
        setBoard(board.map(row => [...row]));
        await sleep(200);

        if (await solveNQueens(board, col + 1)) {
          return true;
        }

        board[i][col] = false;
        setBoard(board.map(row => [...row]));
        await sleep(100);
      }
    }

    return false;
  };

  const solve = async () => {
    setSolving(true);
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(false));
    setBoard(newBoard);
    await solveNQueens(newBoard, 0);
    setSolving(false);
  };

  const clear = () => {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(false)));
    setQueens([]);
  };

  const cppCode = `#include <iostream>
#include <vector>
using namespace std;

bool isSafe(vector<vector<int>>& board, int row, int col, int N) {
    // Verificar fila a la izquierda
    for (int i = 0; i < col; i++)
        if (board[row][i])
            return false;
    
    // Verificar diagonal superior izquierda
    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--)
        if (board[i][j])
            return false;
    
    // Verificar diagonal inferior izquierda
    for (int i = row, j = col; i < N && j >= 0; i++, j--)
        if (board[i][j])
            return false;
    
    return true;
}

bool solveNQueens(vector<vector<int>>& board, int col, int N) {
    if (col >= N)
        return true;
    
    for (int i = 0; i < N; i++) {
        if (isSafe(board, i, col, N)) {
            board[i][col] = 1;
            
            if (solveNQueens(board, col + 1, N))
                return true;
            
            board[i][col] = 0; // Backtrack
        }
    }
    
    return false;
}

int main() {
    int N = 8;
    vector<vector<int>> board(N, vector<int>(N, 0));
    
    if (solveNQueens(board, 0, N)) {
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                cout << (board[i][j] ? "Q " : ". ");
            }
            cout << endl;
        }
    }
    
    return 0;
}`;

  const pythonCode = `def is_safe(board, row, col, N):
    # Verificar fila a la izquierda
    for i in range(col):
        if board[row][i]:
            return False
    
    # Verificar diagonal superior izquierda
    i, j = row, col
    while i >= 0 and j >= 0:
        if board[i][j]:
            return False
        i -= 1
        j -= 1
    
    # Verificar diagonal inferior izquierda
    i, j = row, col
    while i < N and j >= 0:
        if board[i][j]:
            return False
        i += 1
        j -= 1
    
    return True

def solve_n_queens(board, col, N):
    if col >= N:
        return True
    
    for i in range(N):
        if is_safe(board, i, col, N):
            board[i][col] = 1
            
            if solve_n_queens(board, col + 1, N):
                return True
            
            board[i][col] = 0  # Backtrack
    
    return False

# Uso
N = 8
board = [[0 for _ in range(N)] for _ in range(N)]

if solve_n_queens(board, 0, N):
    for row in board:
        print(' '.join('Q' if cell else '.' for cell in row))`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Backtracking - Problema de las 8 Reinas</h2>

      <div className="explanation-section">
        <h3>¿Qué es Backtracking?</h3>
        <p>
          Backtracking es una técnica algorítmica para resolver problemas de forma recursiva, 
          intentando construir una solución incrementalmente y abandonando soluciones parciales 
          tan pronto como determina que no pueden conducir a una solución válida.
        </p>
        <p>
          El problema de las 8 reinas consiste en colocar 8 reinas en un tablero de ajedrez 8x8 
          de tal manera que ninguna reina amenace a otra. Dos reinas se amenazan si están en la 
          misma fila, columna o diagonal.
        </p>
        <p>
          <strong>Complejidad:</strong> O(N!) en el peor caso, donde N es el número de reinas.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={solve} disabled={solving}>
          {solving ? 'Resolviendo...' : 'Resolver'}
        </button>
        <button className="btn btn-secondary" onClick={clear} disabled={solving}>
          Limpiar
        </button>
      </div>

      <div className="visualization-area">
        <div className="chess-board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="chess-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`chess-cell ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'} ${
                    cell ? 'has-queen' : ''
                  }`}
                >
                  {cell && <span className="queen">♛</span>}
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
