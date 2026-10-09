import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/mitm.css';

const MAX_N = 12;
const PHASES = ['1. Dividir', '2. Generar sumas', '3. Buscar complemento'];

const STYLES = `
.mm-phases { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.mm-phase { padding: 0.4rem 0.9rem; border-radius: 999px; background: #1e293b; color: #94a3b8; font-size: 0.85rem; }
.mm-phase.on { background: #7c6bd6; color: #fff; }
.mm-array { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 1rem 0 1.5rem; }
.mm-num { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #1e293b; color: #94a3b8; border: 2px solid transparent; transition: background 0.2s, color 0.2s; }
.mm-num.gap { margin-left: 22px; }
.mm-num.left { border-color: #10b981; }
.mm-num.right { border-color: #ef4444; }
.mm-num.left.active { background: #10b981; color: #fff; }
.mm-num.right.active { background: #ef4444; color: #fff; }
.mm-lists { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.mm-items { display: flex; flex-wrap: wrap; gap: 6px; max-height: 320px; overflow-y: auto; padding: 4px; }
.mm-item { min-width: 62px; padding: 4px 8px; border-radius: 6px; background: #1e293b; text-align: center; animation: mm-in 0.25s ease-out; }
.mm-item b { display: block; color: #e2e8f0; }
.mm-item small { color: #94a3b8; font-size: 0.7rem; }
.mm-item.current { background: #7c6bd6; }
.mm-item.match { background: #10b981; }
.mm-item.current b, .mm-item.current small, .mm-item.match b, .mm-item.match small { color: #fff; }
.mm-explain { margin: 1.5rem 0 1rem; padding: 1rem; border-radius: 8px; background: rgba(124, 107, 214, 0.12); border: 1px solid rgba(124, 107, 214, 0.35); }
.mm-count { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.mm-result { margin-top: 1rem; padding: 1rem; border-radius: 8px; }
.mm-result.ok { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.4); }
.mm-result.no { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); }
@keyframes mm-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
`;

const generateSubsetSums = (arr, start, end) => {
  const sums = [];
  const size = end - start;

  for (let mask = 0; mask < (1 << size); mask++) {
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

const fmt = (subset) => (subset.length ? `[${subset.join(', ')}]` : 'vacío');

// Calcula todo el algoritmo y lo convierte en una lista de pasos para reproducir
const buildSteps = (arr, target) => {
  const mid = Math.floor(arr.length / 2);
  const left = generateSubsetSums(arr, 0, mid);
  const right = generateSubsetSums(arr, mid, arr.length);

  const rightIndex = new Map();
  right.forEach((item, i) => {
    if (!rightIndex.has(item.sum)) rightIndex.set(item.sum, i);
  });

  const steps = [{
    kind: 'split', left: 0, right: 0, cur: null,
    text: `Dividimos [${arr.join(', ')}] en dos mitades: [${arr.slice(0, mid).join(', ')}] y [${arr.slice(mid).join(', ')}]. Cada mitad es lo bastante pequeña para probar todos sus subconjuntos.`
  }];

  left.forEach((item, i) => steps.push({
    kind: 'left', left: i + 1, right: 0, cur: null,
    text: `Mitad izquierda: el subconjunto ${fmt(item.subset)} suma ${item.sum}.`
  }));

  right.forEach((item, i) => steps.push({
    kind: 'right', left: left.length, right: i + 1, cur: null,
    text: `Mitad derecha: el subconjunto ${fmt(item.subset)} suma ${item.sum}.`
  }));

  for (let i = 0; i < left.length; i++) {
    const needed = target - left[i].sum;
    const j = rightIndex.has(needed) ? rightIndex.get(needed) : -1;
    const question = `La suma izquierda ${left[i].sum} necesita ${needed} de la derecha (${target} - ${left[i].sum}).`;

    steps.push({
      kind: 'match', left: left.length, right: right.length, cur: { left: i, right: j },
      text: j >= 0
        ? `${question} Sí existe: ${fmt(right[j].subset)} suma ${needed}.`
        : `${question} No hay ninguna con esa suma.`
    });

    if (j >= 0) return { left, right, steps, hit: { l: left[i], r: right[j] } };
  }

  steps.push({
    kind: 'end', left: left.length, right: right.length, cur: null,
    text: 'Se revisaron todas las sumas de la izquierda y ninguna tiene complemento en la derecha.'
  });
  return { left, right, steps, hit: null };
};

export function MeetInTheMiddle() {
  const [array, setArray] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [target, setTarget] = useState(15);
  const [run, setRun] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  // Reproducción automática: la generación va rápido y la búsqueda más lento
  useEffect(() => {
    if (!playing || !run) return;
    if (stepIndex >= run.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = run.steps[stepIndex + 1].kind === 'match' ? 800 : 150;
    const id = setTimeout(() => setStepIndex(i => i + 1), delay);
    return () => clearTimeout(id);
  }, [playing, run, stepIndex]);

  const invalid = array.length === 0 || array.length > MAX_N;

  const reset = () => {
    setRun(null);
    setPlaying(false);
  };

  const start = (autoplay) => {
    setRun(buildSteps(array, target));
    setStepIndex(0);
    setPlaying(autoplay);
  };

  const next = () => {
    if (!run) return start(false);
    setPlaying(false);
    setStepIndex(i => Math.min(i + 1, run.steps.length - 1));
  };

  const handleArrayChange = (value) => {
    const numbers = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    setArray(numbers);
    reset();
  };

  const step = run ? run.steps[stepIndex] : null;
  const finished = !!run && stepIndex === run.steps.length - 1;
  const mid = Math.floor(array.length / 2);
  const phase = !step ? 0 : step.kind === 'split' ? 1 : step.kind === 'left' || step.kind === 'right' ? 2 : 3;

  let activeLeft = -1;
  let activeRight = -1;
  if (step) {
    if (step.kind === 'left') activeLeft = step.left - 1;
    else if (step.kind === 'right') activeRight = step.right - 1;
    else if (step.cur) {
      activeLeft = step.cur.left;
      activeRight = step.cur.right;
    }
  }

  const renderList = (title, color, items, shown, current, match) => (
    <div>
      <h4 style={{ color, marginBottom: '0.5rem' }}>
        {title} ({shown} de {items.length} subconjuntos)
      </h4>
      <div className="mm-items">
        {items.slice(0, shown).map((item, i) => (
          <div
            key={i}
            className={`mm-item${i === current ? ' current' : ''}${i === match ? ' match' : ''}`}
          >
            <b>{item.sum}</b>
            <small>{fmt(item.subset)}</small>
          </div>
        ))}
      </div>
    </div>
  );

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
      <style>{STYLES}</style>
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
          <ol style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
            <li><strong>Dividir:</strong> separamos el arreglo en dos mitades.</li>
            <li><strong>Generar sumas:</strong> calculamos la suma de cada subconjunto de cada mitad.</li>
            <li>
              <strong>Buscar complemento:</strong> para cada suma izquierda S buscamos
              <em> objetivo - S</em> entre las sumas derechas. Con un mapa, cada búsqueda es O(1).
            </li>
          </ol>
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
          onChange={(e) => { setTarget(parseInt(e.target.value) || 0); reset(); }}
        />
        <button className="btn btn-primary" onClick={() => start(true)} disabled={invalid}>
          Buscar
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setPlaying(p => !p)}
          disabled={!run || finished}
        >
          {playing ? 'Pausar' : 'Continuar'}
        </button>
        <button className="btn btn-secondary" onClick={next} disabled={invalid || finished}>
          Siguiente paso
        </button>
      </div>

      {invalid && (
        <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
          Ingresa entre 1 y {MAX_N} números para poder visualizar el proceso.
        </p>
      )}

      <div className="visualization-area">
        <div style={{ width: '100%', padding: '2rem' }}>
          <div className="mm-phases">
            {PHASES.map((label, i) => (
              <div key={label} className={`mm-phase${phase === i + 1 ? ' on' : ''}`}>{label}</div>
            ))}
          </div>

          <div className="mm-array">
            {array.map((num, i) => {
              const isLeft = i < mid;
              const item = run && (isLeft ? run.left[activeLeft] : run.right[activeRight]);
              const active = item && (item.mask & (1 << (isLeft ? i : i - mid)));
              return (
                <div
                  key={i}
                  className={`mm-num ${isLeft ? 'left' : 'right'}${i === mid ? ' gap' : ''}${active ? ' active' : ''}`}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {run ? (
            <>
              <div className="mm-lists">
                {renderList('Sumas izquierda', '#10b981', run.left, step.left, activeLeft, -1)}
                {renderList(
                  'Sumas derecha', '#ef4444', run.right, step.right,
                  step.kind === 'right' ? activeRight : -1,
                  step.kind === 'match' ? activeRight : -1
                )}
              </div>

              <div className="mm-explain">
                <div className="mm-count">Paso {stepIndex + 1} de {run.steps.length}</div>
                <div>{step.text}</div>
              </div>

              {finished && (run.hit ? (
                <div className="mm-result ok">
                  <h4>Subconjunto encontrado</h4>
                  <p><strong>Izquierda:</strong> {fmt(run.hit.l.subset)} = {run.hit.l.sum}</p>
                  <p><strong>Derecha:</strong> {fmt(run.hit.r.subset)} = {run.hit.r.sum}</p>
                  <p><strong>Total:</strong> {run.hit.l.sum} + {run.hit.r.sum} = {target}</p>
                </div>
              ) : (
                <div className="mm-result no">
                  <h4>No encontrado</h4>
                  <p>No existe un subconjunto con suma {target}.</p>
                </div>
              ))}
            </>
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              Presiona "Buscar" para ver el proceso, o "Siguiente paso" para avanzar manualmente.
            </p>
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
