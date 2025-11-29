import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/annealing.css';

export function SimulatedAnnealing() {
  const [cities, setCities] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [bestPath, setBestPath] = useState([]);
  const [temperature, setTemperature] = useState(1000);
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  useEffect(() => {
    generateCities();
  }, []);

  const generateCities = () => {
    const newCities = [];
    for (let i = 0; i < 10; i++) {
      newCities.push({
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50,
        id: i
      });
    }
    setCities(newCities);
    const initialPath = newCities.map((_, i) => i);
    setCurrentPath(initialPath);
    setBestPath(initialPath);
    setTemperature(1000);
    setIteration(0);
  };

  const calculateDistance = (path, cities) => {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const city1 = cities[path[i]];
      const city2 = cities[path[i + 1]];
      distance += Math.sqrt(
        Math.pow(city2.x - city1.x, 2) + Math.pow(city2.y - city1.y, 2)
      );
    }
    const first = cities[path[0]];
    const last = cities[path[path.length - 1]];
    distance += Math.sqrt(
      Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
    );
    return distance;
  };

  const swap = (path, i, j) => {
    const newPath = [...path];
    [newPath[i], newPath[j]] = [newPath[j], newPath[i]];
    return newPath;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runSimulatedAnnealing = async () => {
    setRunning(true);
    let current = [...currentPath];
    let best = [...current];
    let temp = 1000;
    let iter = 0;
    const coolingRate = 0.995;
    const maxIterations = 1000;

    let currentDistance = calculateDistance(current, cities);
    let bestDistance = currentDistance;

    while (temp > 1 && iter < maxIterations) {
      const i = Math.floor(Math.random() * current.length);
      const j = Math.floor(Math.random() * current.length);
      
      const newPath = swap(current, i, j);
      const newDistance = calculateDistance(newPath, cities);
      
      const delta = newDistance - currentDistance;
      
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        current = newPath;
        currentDistance = newDistance;
        
        if (currentDistance < bestDistance) {
          best = [...current];
          bestDistance = currentDistance;
          setBestPath(best);
        }
      }

      setCurrentPath([...current]);
      setTemperature(temp);
      setIteration(iter);
      
      temp *= coolingRate;
      iter++;

      if (iter % 10 === 0) {
        await sleep(20);
      }
    }

    setRunning(false);
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;

struct City {
    double x, y;
};

double calculateDistance(const vector<int>& path, const vector<City>& cities) {
    double distance = 0;
    for (size_t i = 0; i < path.size() - 1; i++) {
        const City& c1 = cities[path[i]];
        const City& c2 = cities[path[i + 1]];
        distance += sqrt(pow(c2.x - c1.x, 2) + pow(c2.y - c1.y, 2));
    }
    // Cerrar el ciclo
    const City& first = cities[path[0]];
    const City& last = cities[path.back()];
    distance += sqrt(pow(first.x - last.x, 2) + pow(first.y - last.y, 2));
    return distance;
}

vector<int> simulatedAnnealing(vector<City>& cities) {
    int n = cities.size();
    vector<int> current(n);
    for (int i = 0; i < n; i++) current[i] = i;
    
    vector<int> best = current;
    double currentDist = calculateDistance(current, cities);
    double bestDist = currentDist;
    
    double temp = 1000.0;
    double coolingRate = 0.995;
    int maxIterations = 1000;
    
    for (int iter = 0; iter < maxIterations && temp > 1; iter++) {
        // Generar vecino intercambiando dos ciudades
        int i = rand() % n;
        int j = rand() % n;
        swap(current[i], current[j]);
        
        double newDist = calculateDistance(current, cities);
        double delta = newDist - currentDist;
        
        // Aceptar si es mejor o con probabilidad basada en temperatura
        if (delta < 0 || ((double)rand() / RAND_MAX) < exp(-delta / temp)) {
            currentDist = newDist;
            
            if (currentDist < bestDist) {
                best = current;
                bestDist = currentDist;
            }
        } else {
            // Revertir el intercambio
            swap(current[i], current[j]);
        }
        
        temp *= coolingRate;
    }
    
    return best;
}

int main() {
    vector<City> cities = {{0, 0}, {1, 5}, {5, 2}, {6, 6}, {8, 3}};
    vector<int> bestPath = simulatedAnnealing(cities);
    
    cout << "Mejor ruta: ";
    for (int city : bestPath) {
        cout << city << " ";
    }
    cout << endl;
    
    return 0;
}`;

  const pythonCode = `import random
import math

class City:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def calculate_distance(path, cities):
    distance = 0
    for i in range(len(path) - 1):
        c1 = cities[path[i]]
        c2 = cities[path[i + 1]]
        distance += math.sqrt((c2.x - c1.x)**2 + (c2.y - c1.y)**2)
    
    # Cerrar el ciclo
    first = cities[path[0]]
    last = cities[path[-1]]
    distance += math.sqrt((first.x - last.x)**2 + (first.y - last.y)**2)
    return distance

def simulated_annealing(cities):
    n = len(cities)
    current = list(range(n))
    best = current.copy()
    
    current_dist = calculate_distance(current, cities)
    best_dist = current_dist
    
    temp = 1000.0
    cooling_rate = 0.995
    max_iterations = 1000
    
    for iteration in range(max_iterations):
        if temp <= 1:
            break
        
        # Generar vecino intercambiando dos ciudades
        i = random.randint(0, n - 1)
        j = random.randint(0, n - 1)
        current[i], current[j] = current[j], current[i]
        
        new_dist = calculate_distance(current, cities)
        delta = new_dist - current_dist
        
        # Aceptar si es mejor o con probabilidad basada en temperatura
        if delta < 0 or random.random() < math.exp(-delta / temp):
            current_dist = new_dist
            
            if current_dist < best_dist:
                best = current.copy()
                best_dist = current_dist
        else:
            # Revertir el intercambio
            current[i], current[j] = current[j], current[i]
        
        temp *= cooling_rate
    
    return best

# Uso
cities = [City(0, 0), City(1, 5), City(5, 2), City(6, 6), City(8, 3)]
best_path = simulated_annealing(cities)
print("Mejor ruta:", best_path)
print("Distancia:", calculate_distance(best_path, cities))`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Recocido Simulado (Simulated Annealing)</h2>

      <div className="explanation-section">
        <h3>¿Qué es Simulated Annealing?</h3>
        <p>
          El Recocido Simulado es una técnica de optimización metaheurística inspirada en el proceso 
          de recocido en metalurgia. Permite escapar de óptimos locales aceptando ocasionalmente 
          soluciones peores con una probabilidad que disminuye con el tiempo (temperatura).
        </p>
        <p>
          Este ejemplo resuelve el Problema del Viajante (TSP): encontrar la ruta más corta que 
          visite todas las ciudades exactamente una vez y regrese al origen.
        </p>
        <p>
          <strong>Probabilidad de aceptación:</strong> P = e^(-ΔE/T), donde ΔE es el cambio en energía 
          (distancia) y T es la temperatura. A mayor temperatura, mayor probabilidad de aceptar soluciones peores.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={runSimulatedAnnealing} disabled={running}>
          {running ? `Iteración ${iteration}...` : 'Ejecutar Recocido'}
        </button>
        <button className="btn btn-success" onClick={generateCities} disabled={running}>
          Nuevas Ciudades
        </button>
        <div className="temp-display">
          Temperatura: {temperature.toFixed(2)}°
        </div>
      </div>

      <div className="visualization-area">
        <svg width="600" height="400" className="tsp-canvas">
          {/* Dibujar camino actual */}
          {currentPath.length > 0 && cities.length > 0 && (
            <>
              {currentPath.map((cityIndex, i) => {
                if (i === currentPath.length - 1) {
                  const city1 = cities[cityIndex];
                  const city2 = cities[currentPath[0]];
                  return (
                    <line
                      key={`line-${i}`}
                      x1={city1.x}
                      y1={city1.y}
                      x2={city2.x}
                      y2={city2.y}
                      stroke="#64748b"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  );
                }
                const city1 = cities[cityIndex];
                const city2 = cities[currentPath[i + 1]];
                return (
                  <line
                    key={`line-${i}`}
                    x1={city1.x}
                    y1={city1.y}
                    x2={city2.x}
                    y2={city2.y}
                    stroke="#64748b"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                );
              })}
            </>
          )}

          {/* Dibujar ciudades */}
          {cities.map((city, index) => (
            <g key={`city-${index}`}>
              <circle
                cx={city.x}
                cy={city.y}
                r="8"
                fill="#667eea"
                stroke="#a78bfa"
                strokeWidth="2"
              />
              <text
                x={city.x}
                y={city.y - 15}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="12"
                fontWeight="bold"
              >
                {index}
              </text>
            </g>
          ))}
        </svg>
        <div className="distance-display">
          Distancia actual: {cities.length > 0 ? calculateDistance(currentPath, cities).toFixed(2) : 0}
          <br />
          Mejor distancia: {cities.length > 0 ? calculateDistance(bestPath, cities).toFixed(2) : 0}
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
