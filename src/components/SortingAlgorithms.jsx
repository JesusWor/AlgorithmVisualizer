import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/sorting.css';

export function SortingAlgorithms() {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [sorting, setSorting] = useState(false);
  const [currentAlgo, setCurrentAlgo] = useState('bubble');
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  const generateRandom = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    setComparing([]);
    setSorted([]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    setSorting(true);
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(300);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
      }
      setSorted(prev => [...prev, n - 1 - i]);
    }
    setSorted([...Array(n).keys()]);
    setComparing([]);
    setSorting(false);
  };

  const quickSort = async () => {
    setSorting(true);
    const arr = [...array];
    
    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        setComparing([j, high]);
        await sleep(300);

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      return i + 1;
    };

    const quick = async (low, high) => {
      if (low < high) {
        const pi = await partition(low, high);
        await quick(low, pi - 1);
        await quick(pi + 1, high);
      }
    };

    await quick(0, arr.length - 1);
    setSorted([...Array(arr.length).keys()]);
    setComparing([]);
    setSorting(false);
  };

  const mergeSort = async () => {
    setSorting(true);
    const arr = [...array];

    const merge = async (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        setComparing([left + i, mid + 1 + j]);
        await sleep(300);

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        k++;
        setArray([...arr]);
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        i++;
        k++;
        setArray([...arr]);
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        j++;
        k++;
        setArray([...arr]);
      }
    };

    const mergeSortHelper = async (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSortHelper(left, mid);
        await mergeSortHelper(mid + 1, right);
        await merge(left, mid, right);
      }
    };

    await mergeSortHelper(0, arr.length - 1);
    setSorted([...Array(arr.length).keys()]);
    setComparing([]);
    setSorting(false);
  };

  const startSort = () => {
    setSorted([]);
    setComparing([]);
    if (currentAlgo === 'bubble') bubbleSort();
    else if (currentAlgo === 'quick') quickSort();
    else if (currentAlgo === 'merge') mergeSort();
  };

  const codes = {
    bubble: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    for (int num : arr) {
        cout << num << " ";
    }
    return 0;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

# Uso
arr = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(arr)
print(arr)`
    },
    quick: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr, 0, arr.size() - 1);
    for (int num : arr) {
        cout << num << " ";
    }
    return 0;
}`,
      python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

# Uso
arr = [64, 34, 25, 12, 22, 11, 90]
quick_sort(arr, 0, len(arr) - 1)
print(arr)`
    },
    merge: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    
    while (i < leftArr.size() && j < rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k++] = leftArr[i++];
        } else {
            arr[k++] = rightArr[j++];
        }
    }
    
    while (i < leftArr.size()) arr[k++] = leftArr[i++];
    while (j < rightArr.size()) arr[k++] = rightArr[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, arr.size() - 1);
    for (int num : arr) {
        cout << num << " ";
    }
    return 0;
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Uso
arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = merge_sort(arr)
print(sorted_arr)`
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Algoritmos de Ordenamiento</h2>

      <div className="explanation-section">
        <h3>Algoritmos Disponibles</h3>
        <p>
          <strong>Bubble Sort:</strong> Compara elementos adyacentes repetidamente. Simple pero ineficiente. 
          Complejidad: O(n²).
        </p>
        <p>
          <strong>Quick Sort:</strong> Algoritmo divide y conquista usando pivote. Muy eficiente en promedio. 
          Complejidad: O(n log n) promedio, O(n²) peor caso.
        </p>
        <p>
          <strong>Merge Sort:</strong> Divide el array y combina las partes ordenadas. Estable y consistente. 
          Complejidad: O(n log n) siempre.
        </p>
      </div>

      <div className="controls">
        <select
          className="input-field"
          value={currentAlgo}
          onChange={(e) => setCurrentAlgo(e.target.value)}
          disabled={sorting}
        >
          <option value="bubble">Bubble Sort</option>
          <option value="quick">Quick Sort</option>
          <option value="merge">Merge Sort</option>
        </select>
        <button className="btn btn-primary" onClick={startSort} disabled={sorting}>
          {sorting ? 'Ordenando...' : 'Ordenar'}
        </button>
        <button className="btn btn-success" onClick={generateRandom} disabled={sorting}>
          Generar Aleatorio
        </button>
      </div>

      <div className="visualization-area">
        <div className="bars-container">
          {array.map((value, index) => (
            <div key={index} className="bar-wrapper">
              <div
                className={`bar ${comparing.includes(index) ? 'comparing' : ''} ${
                  sorted.includes(index) ? 'sorted' : ''
                }`}
                style={{ height: `${value * 3}px` }}
              >
                <span className="bar-value">{value}</span>
              </div>
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
