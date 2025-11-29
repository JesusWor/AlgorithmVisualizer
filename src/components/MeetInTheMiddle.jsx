import { useState } from 'react';
import '../styles/common.css';
import '../styles/mitm.css';

export function MeetInTheMiddle() {
  const [array, setArray] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [target, setTarget] = useState(15);
  const [result, setResult] = useState(null);
  const [leftSums, setLeftSums] = useState([]);
  const [rightSums, setRightSums] = useState([]);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  const generateSubsetSums = (arr, start, end) => {
    const sums = [];
    const size = end - start;
    const totalSubsets = 1 << size;

    for (let mask = 0; mask < totalSubsets; mask++) {
      let sum = 0;
      const subset = [];
      for (let i = 0; i < size; i++) {
        if (mask & (1 << i)) {
          sum += arr[start + i];
          subset.push(arr[start + i]);
        }
      }
      sums.push({ sum, subset, mask });
    }
    return sums;
  };

  const findSubsetSum = () => {
    const n = array.length;
    const mid = Math.floor(n / 2);

    const left = generateSubsetSums(array, 0, mid);
    const right = generateSubsetSums(array, mid, n);

    setLeftSums(left);
    setRightSums(right);

    const rightMap = new Map();
    for (const item of right) {
      rightMap.set(item.sum, item);
    }

    for (const leftItem of left) {
      const needed = target - leftItem.sum;
      if (rightMap.has(needed)) {
        const rightItem = rightMap.get(needed);
        setResult({
          found: true,
          leftSubset: leftItem.subset,
          rightSubset: rightItem.subset,
          leftSum: leftItem.sum,
          rightSum: rightItem.sum,
          total: leftItem.sum + rightItem.sum
        });
        return;
      }
    }

    setResult({
      found: false,
      message: 'No se encontró un subconjunto con la suma objetivo'
    });
  };

  const handleArrayChange = (value) => {
    const numbers = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    setArray(numbers);
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

// Generar todas las sumas de subconjuntos para una mitad del array
vector<pair<int, int>> generateSubsetSums(vector<int>& arr, int start, int end) {
    vector<pair<int, int>> sums; // {suma, máscara de bits}
    int size = end - start;
    int totalSubsets = 1 << size;
    
    for (int mask = 0; mask < totalSubsets; mask++) {
        int sum = 0;
        for (int i = 0; i < size; i++) {
            if (mask & (1 << i)) {
                sum += arr[start + i];
            }
        }
        sums.push_back({sum, mask});
    }
    return sums;
}

bool meetInTheMiddle(vector<int>& arr, int target) {
    int n = arr.size();
    int mid = n / 2;
    
    // Dividir el array en dos mitades
    auto left = generateSubsetSums(arr, 0, mid);
    auto right = generateSubsetSums(arr, mid, n);
    
    // Guardar sumas derechas en un mapa para búsqueda O(1)
    unordered_map<int, int> rightMap;
    for (auto& p : right) {
        rightMap[p.first] = p.second;
    }
    
    // Buscar combinaciones que sumen el objetivo
    for (auto& leftPair : left) {
        int needed = target - leftPair.first;
        if (rightMap.count(needed)) {
            cout << "Encontrado! Suma izquierda: " << leftPair.first;
            cout << ", Suma derecha: " << needed << endl;
            
            // Imprimir subconjunto izquierdo
            cout << "Subconjunto izquierdo: ";
            for (int i = 0; i < mid; i++) {
                if (leftPair.second & (1 << i)) {
                    cout << arr[i] << " ";
                }
            }
            cout << endl;
            
            // Imprimir subconjunto derecho
            cout << "Subconjunto derecho: ";
            int rightMask = rightMap[needed];
            for (int i = 0; i < n - mid; i++) {
                if (rightMask & (1 << i)) {
                    cout << arr[mid + i] << " ";
                }
            }
            cout << endl;
            
            return true;
        }
    }
    
    return false;
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8};
    int target = 15;
    
    if (meetInTheMiddle(arr, target)) {
        cout << "Subconjunto encontrado!" << endl;
    } else {
        cout << "No existe subconjunto con suma " << target << endl;
    }
    
    return 0;
}`;

  const pythonCode = `def generate_subset_sums(arr, start, end):
    """Generar todas las sumas de subconjuntos para una mitad del array"""
    sums = []  # Lista de (suma, máscara)
    size = end - start
    total_subsets = 1 << size
    
    for mask in range(total_subsets):
        current_sum = 0
        subset = []
        for i in range(size):
            if mask & (1 << i):
                current_sum += arr[start + i]
                subset.append(arr[start + i])
        sums.append((current_sum, mask, subset))
    
    return sums

def meet_in_the_middle(arr, target):
    """Encontrar un subconjunto que sume el valor objetivo"""
    n = len(arr)
    mid = n // 2
    
    # Dividir el array en dos mitades
    left = generate_subset_sums(arr, 0, mid)
    right = generate_subset_sums(arr, mid, n)
    
    # Guardar sumas derechas en un diccionario para búsqueda O(1)
    right_map = {sum_val: (mask, subset) for sum_val, mask, subset in right}
    
    # Buscar combinaciones que sumen el objetivo
    for left_sum, left_mask, left_subset in left:
        needed = target - left_sum
        if needed in right_map:
            right_mask, right_subset = right_map[needed]
            print(f"Encontrado! Suma izquierda: {left_sum}, Suma derecha: {needed}")
            print(f"Subconjunto izquierdo: {left_subset}")
            print(f"Subconjunto derecho: {right_subset}")
            print(f"Subconjunto completo: {left_subset + right_subset}")
            return True
    
    return False

# Uso
arr = [1, 2, 3, 4, 5, 6, 7, 8]
target = 15

if meet_in_the_middle(arr, target):
    print("Subconjunto encontrado!")
else:
    print(f"No existe subconjunto con suma {target}")`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Encontrarse en el Medio (Meet in the Middle)</h2>

      <div className="explanation-section">
        <h3>¿Qué es Meet in the Middle?</h3>
        <p>
          Meet in the Middle es una técnica de optimización que divide un problema en dos partes más pequeñas, 
          resuelve cada parte independientemente, y luego combina las soluciones. Esto reduce significativamente 
          la complejidad exponencial.
        </p>
        <p>
          Para el problema de suma de subconjuntos: en lugar de generar todos los 2^n subconjuntos posibles, 
          dividimos el array en dos mitades y generamos 2^(n/2) sumas para cada mitad. Luego buscamos pares 
          de sumas que juntas alcancen el objetivo.
        </p>
        <p>
          <strong>Complejidad:</strong> O(2^(n/2)) en lugar de O(2^n). Para n=40, esto reduce de 
          ~1 billón a ~1 millón de operaciones.
        </p>
      </div>

      <div className="controls">
        <input
          type="text"
          className="input-field"
          placeholder="Array (separado por comas)"
          defaultValue={array.join(', ')}
          onChange={(e) => handleArrayChange(e.target.value)}
          style={{ minWidth: '300px' }}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Suma objetivo"
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
        />
        <button className="btn btn-primary" onClick={findSubsetSum}>
          Buscar Subconjunto
        </button>
      </div>

      <div className="visualization-area">
        <div style={{ width: '100%', padding: '2rem' }}>
          <div className="mitm-visualization">
            <div className="mitm-section">
              <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Mitad Izquierda</h4>
              <div className="array-display">
                {array.slice(0, Math.floor(array.length / 2)).map((num, i) => (
                  <div key={i} className="array-item left">
                    {num}
                  </div>
                ))}
              </div>
              <div className="sums-info">
                {leftSums.length > 0 && (
                  <p>Subconjuntos generados: {leftSums.length}</p>
                )}
              </div>
            </div>

            <div className="mitm-divider">
              <div className="arrow-down">↓</div>
              <div className="meet-text">MEET</div>
              <div className="arrow-down">↓</div>
            </div>

            <div className="mitm-section">
              <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>Mitad Derecha</h4>
              <div className="array-display">
                {array.slice(Math.floor(array.length / 2)).map((num, i) => (
                  <div key={i} className="array-item right">
                    {num}
                  </div>
                ))}
              </div>
              <div className="sums-info">
                {rightSums.length > 0 && (
                  <p>Subconjuntos generados: {rightSums.length}</p>
                )}
              </div>
            </div>
          </div>

          {result && (
            <div className={`result-box ${result.found ? 'success' : 'fail'}`}>
              {result.found ? (
                <>
                  <h4>✓ ¡Subconjunto Encontrado!</h4>
                  <p><strong>Objetivo:</strong> {target}</p>
                  <p>
                    <strong>Subconjunto Izquierdo:</strong> [{result.leftSubset.join(', ')}] 
                    = {result.leftSum}
                  </p>
                  <p>
                    <strong>Subconjunto Derecho:</strong> [{result.rightSubset.join(', ')}] 
                    = {result.rightSum}
                  </p>
                  <p>
                    <strong>Total:</strong> {result.leftSum} + {result.rightSum} = {result.total}
                  </p>
                </>
              ) : (
                <>
                  <h4>✗ No Encontrado</h4>
                  <p>{result.message}</p>
                </>
              )}
            </div>
          )}
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
