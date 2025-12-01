import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/sorting.css';

export function SearchAlgorithms({ initialAlgorithm = 'binary' }) {
  const [array, setArray] = useState([11, 12, 22, 25, 34, 64, 90]);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentAlgo, setCurrentAlgo] = useState(initialAlgorithm);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [searchRange, setSearchRange] = useState({ left: -1, right: -1 });
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialAlgorithm) {
      setCurrentAlgo(initialAlgorithm);
    }
  }, [initialAlgorithm]);

  const generateRandom = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    newArray.sort((a, b) => a - b);
    setArray(newArray);
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setSearchRange({ left: -1, right: -1 });
    setMessage('');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const sequentialSearch = async () => {
    setSearching(true);
    setFoundIndex(-1);
    setMessage('');
    const target = parseInt(searchValue);
    
    if (isNaN(target)) {
      setMessage('Por favor ingresa un número válido');
      setSearching(false);
      return;
    }

    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      await sleep(500);
      
      if (array[i] === target) {
        setFoundIndex(i);
        setMessage(`¡Elemento ${target} encontrado en la posición ${i}!`);
        setCurrentIndex(-1);
        setSearching(false);
        return;
      }
    }
    
    setMessage(`Elemento ${target} no encontrado en el arreglo`);
    setCurrentIndex(-1);
    setSearching(false);
  };

  const binarySearch = async () => {
    setSearching(true);
    setFoundIndex(-1);
    setMessage('');
    const target = parseInt(searchValue);
    
    if (isNaN(target)) {
      setMessage('Por favor ingresa un número válido');
      setSearching(false);
      return;
    }

    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setSearchRange({ left, right });
      setCurrentIndex(mid);
      await sleep(800);

      if (array[mid] === target) {
        setFoundIndex(mid);
        setMessage(`¡Elemento ${target} encontrado en la posición ${mid}!`);
        setCurrentIndex(-1);
        setSearchRange({ left: -1, right: -1 });
        setSearching(false);
        return;
      }

      if (array[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setMessage(`Elemento ${target} no encontrado en el arreglo`);
    setCurrentIndex(-1);
    setSearchRange({ left: -1, right: -1 });
    setSearching(false);
  };

  const startSearch = () => {
    setFoundIndex(-1);
    setCurrentIndex(-1);
    setSearchRange({ left: -1, right: -1 });
    if (currentAlgo === 'sequential') sequentialSearch();
    else if (currentAlgo === 'binary') binarySearch();
  };

  const codes = {
    sequential: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int sequentialSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i; // Elemento encontrado
        }
    }
    return -1; // Elemento no encontrado
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    int target = 22;
    int result = sequentialSearch(arr, target);
    
    if (result != -1) {
        cout << "Elemento encontrado en posición: " << result << endl;
    } else {
        cout << "Elemento no encontrado" << endl;
    }
    return 0;
}`,
      python: `def sequential_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Elemento encontrado
    return -1  # Elemento no encontrado

# Uso
arr = [64, 34, 25, 12, 22, 11, 90]
target = 22
result = sequential_search(arr, target)

if result != -1:
    print(f"Elemento encontrado en posición: {result}")
else:
    print("Elemento no encontrado")`
    },
    binary: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid; // Elemento encontrado
        }
        
        if (arr[mid] < target) {
            left = mid + 1; // Buscar en mitad derecha
        } else {
            right = mid - 1; // Buscar en mitad izquierda
        }
    }
    return -1; // Elemento no encontrado
}

int main() {
    vector<int> arr = {11, 12, 22, 25, 34, 64, 90}; // Array ordenado
    int target = 25;
    int result = binarySearch(arr, target);
    
    if (result != -1) {
        cout << "Elemento encontrado en posición: " << result << endl;
    } else {
        cout << "Elemento no encontrado" << endl;
    }
    return 0;
}`,
      python: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Elemento encontrado
        
        if arr[mid] < target:
            left = mid + 1  # Buscar en mitad derecha
        else:
            right = mid - 1  # Buscar en mitad izquierda
    
    return -1  # Elemento no encontrado

# Uso
arr = [11, 12, 22, 25, 34, 64, 90]  # Array ordenado
target = 25
result = binary_search(arr, target)

if result != -1:
    print(f"Elemento encontrado en posición: {result}")
else:
    print("Elemento no encontrado")`
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Algoritmos de Búsqueda</h2>

      <div className="explanation-section">
        <h3>Algoritmos Disponibles</h3>
        <p>
          <strong>Búsqueda Secuencial:</strong> Recorre el arreglo elemento por elemento hasta encontrar 
          el valor buscado. Simple pero puede ser lento. 
          Complejidad: O(n).
        </p>
        <p>
          <strong>Búsqueda Binaria:</strong> Divide repetidamente el arreglo a la mitad, descartando 
          la mitad donde el elemento no puede estar. Requiere arreglo ordenado. 
          Complejidad: O(log n).
        </p>
      </div>

      <div className="controls">
        <select
          className="input-field"
          value={currentAlgo}
          onChange={(e) => setCurrentAlgo(e.target.value)}
          disabled={searching}
        >
          <option value="sequential">Búsqueda Secuencial</option>
          <option value="binary">Búsqueda Binaria</option>
        </select>
        <input
          type="number"
          className="input-field"
          placeholder="Valor a buscar"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={searching}
          style={{ width: '150px' }}
        />
        <button className="btn btn-primary" onClick={startSearch} disabled={searching || !searchValue}>
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
        <button className="btn btn-success" onClick={generateRandom} disabled={searching}>
          Generar Aleatorio
        </button>
      </div>

      {message && (
        <div className="explanation-section" style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          background: foundIndex !== -1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${foundIndex !== -1 ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          color: foundIndex !== -1 ? '#10b981' : '#ef4444'
        }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}

      <div className="visualization-area">
        <div className="bars-container">
          {array.map((value, index) => {
            let barClass = 'bar';
            if (index === foundIndex) barClass += ' sorted';
            else if (index === currentIndex) barClass += ' comparing';
            else if (currentAlgo === 'binary' && 
                     searchRange.left !== -1 && 
                     index >= searchRange.left && 
                     index <= searchRange.right) {
              barClass += ' visited';
            }

            return (
              <div key={index} className="bar-wrapper">
                <div
                  className={barClass}
                  style={{ height: `${value * 3}px` }}
                >
                  <span className="bar-value">{value}</span>
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem', 
                  color: '#9ca3af' 
                }}>
                  [{index}]
                </div>
              </div>
            );
          })}
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
            onClick={() => copyCode(codes[currentAlgo][codeLanguage])}
          >
            Copiar
          </button>
          <pre>{codes[currentAlgo][codeLanguage]}</pre>
        </div>
      </div>
    </div>
  );
}
