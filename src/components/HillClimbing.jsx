import React, { useState, useEffect, useRef } from 'react';
import '../styles/common.css';
import '../styles/hillclimbing.css';

const HillClimbing = () => {
  const canvasRef = useRef(null);
  const [cities, setCities] = useState([]);
  const [currentRoute, setCurrentRoute] = useState([]);
  const [bestRoute, setBestRoute] = useState([]);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [bestDistance, setBestDistance] = useState(Infinity);
  const [iterations, setIterations] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [numCities, setNumCities] = useState(10);
  const [message, setMessage] = useState('');
  const [stuckCounter, setStuckCounter] = useState(0);
  const animationRef = useRef(null);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Update canvas size based on window size
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setCanvasSize({ width: 280, height: 250 });
      } else if (width < 768) {
        setCanvasSize({ width: 400, height: 300 });
      } else {
        setCanvasSize({ width: 600, height: 400 });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  // Generate random cities
  const generateCities = (n) => {
    const newCities = [];
    for (let i = 0; i < n; i++) {
      newCities.push({
        x: Math.random() * (canvasWidth - 60) + 30,
        y: Math.random() * (canvasHeight - 60) + 30,
        id: i
      });
    }
    return newCities;
  };

  // Calculate distance between two cities
  const distance = (city1, city2) => {
    const dx = city1.x - city2.x;
    const dy = city1.y - city2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate total route distance
  const calculateDistance = (route, cityList) => {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += distance(cityList[route[i]], cityList[route[i + 1]]);
    }
    // Return to start
    total += distance(cityList[route[route.length - 1]], cityList[route[0]]);
    return total;
  };

  // Generate neighbor by swapping two random cities
  const generateNeighbor = (route) => {
    const newRoute = [...route];
    const i = Math.floor(Math.random() * route.length);
    let j = Math.floor(Math.random() * route.length);
    while (i === j) {
      j = Math.floor(Math.random() * route.length);
    }
    // Swap
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    return newRoute;
  };

  // Draw on canvas
  const draw = (route, cityList, isBest = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw route lines
    ctx.strokeStyle = isBest ? '#10b981' : '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (route.length > 0) {
      ctx.moveTo(cityList[route[0]].x, cityList[route[0]].y);
      for (let i = 1; i < route.length; i++) {
        ctx.lineTo(cityList[route[i]].x, cityList[route[i]].y);
      }
      // Return to start
      ctx.lineTo(cityList[route[0]].x, cityList[route[0]].y);
      ctx.stroke();
    }

    // Draw cities
    cityList.forEach((city, index) => {
      // City circle
      ctx.beginPath();
      ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // City label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index, city.x, city.y);
    });
  };

  // Initialize
  const initialize = () => {
    const newCities = generateCities(numCities);
    const initialRoute = newCities.map((_, i) => i);
    
    setCities(newCities);
    setCurrentRoute(initialRoute);
    setBestRoute(initialRoute);
    
    const dist = calculateDistance(initialRoute, newCities);
    setCurrentDistance(dist);
    setBestDistance(dist);
    setIterations(0);
    setStuckCounter(0);
    setMessage('Inicializado con ruta aleatoria');
    
    draw(initialRoute, newCities);
  };

  // Hill Climbing Algorithm
  const hillClimbingStep = () => {
    if (cities.length === 0) return;

    // Generate neighbor
    const neighbor = generateNeighbor(currentRoute);
    const neighborDistance = calculateDistance(neighbor, cities);

    // If neighbor is better, accept it
    if (neighborDistance < currentDistance) {
      setCurrentRoute(neighbor);
      setCurrentDistance(neighborDistance);
      setStuckCounter(0);
      
      if (neighborDistance < bestDistance) {
        setBestRoute(neighbor);
        setBestDistance(neighborDistance);
        setMessage(`¡Nueva mejor solución encontrada! Distancia: ${neighborDistance.toFixed(2)}`);
        draw(neighbor, cities, true);
      } else {
        setMessage(`Vecino mejor aceptado. Distancia: ${neighborDistance.toFixed(2)}`);
        draw(neighbor, cities);
      }
    } else {
      // Stuck in local optimum
      setStuckCounter(prev => prev + 1);
      setMessage(`Vecino rechazado (${neighborDistance.toFixed(2)} >= ${currentDistance.toFixed(2)})`);
    }

    setIterations(prev => prev + 1);

    // Stop if stuck for too long
    if (stuckCounter >= 100) {
      setIsRunning(false);
      setMessage(`Convergencia alcanzada. Óptimo local encontrado: ${bestDistance.toFixed(2)}`);
    }
  };

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(() => {
        hillClimbingStep();
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRunning, currentRoute, cities, currentDistance, stuckCounter]);

  // Start algorithm
  const start = () => {
    if (cities.length === 0) {
      initialize();
    }
    setIsRunning(true);
    setMessage('Hill Climbing ejecutándose...');
  };

  // Stop algorithm
  const stop = () => {
    setIsRunning(false);
    setMessage('Algoritmo detenido');
  };

  // Reset
  const reset = () => {
    setIsRunning(false);
    setCities([]);
    setCurrentRoute([]);
    setBestRoute([]);
    setCurrentDistance(0);
    setBestDistance(Infinity);
    setIterations(0);
    setStuckCounter(0);
    setMessage('');
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <random>
using namespace std;

struct City {
    double x, y;
};

// Calculate distance between two cities
double distance(const City& a, const City& b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}

// Calculate total route distance
double calculateDistance(const vector<int>& route, 
                        const vector<City>& cities) {
    double total = 0;
    for (size_t i = 0; i < route.size() - 1; i++) {
        total += distance(cities[route[i]], cities[route[i + 1]]);
    }
    // Return to start
    total += distance(cities[route.back()], cities[route[0]]);
    return total;
}

// Generate neighbor by swapping two random cities
vector<int> generateNeighbor(const vector<int>& route) {
    vector<int> neighbor = route;
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(0, route.size() - 1);
    
    int i = dis(gen);
    int j = dis(gen);
    while (i == j) j = dis(gen);
    
    swap(neighbor[i], neighbor[j]);
    return neighbor;
}

// Hill Climbing Algorithm
pair<vector<int>, double> hillClimbing(vector<City>& cities, 
                                      int maxIterations = 10000) {
    // Initialize with random route
    vector<int> current(cities.size());
    for (size_t i = 0; i < cities.size(); i++) {
        current[i] = i;
    }
    random_shuffle(current.begin(), current.end());
    
    double currentDist = calculateDistance(current, cities);
    vector<int> best = current;
    double bestDist = currentDist;
    
    int stuckCounter = 0;
    
    for (int iter = 0; iter < maxIterations; iter++) {
        // Generate neighbor
        vector<int> neighbor = generateNeighbor(current);
        double neighborDist = calculateDistance(neighbor, cities);
        
        // Accept if better
        if (neighborDist < currentDist) {
            current = neighbor;
            currentDist = neighborDist;
            stuckCounter = 0;
            
            if (neighborDist < bestDist) {
                best = neighbor;
                bestDist = neighborDist;
            }
        } else {
            stuckCounter++;
        }
        
        // Stop if stuck in local optimum
        if (stuckCounter >= 100) {
            cout << "Convergencia alcanzada" << endl;
            break;
        }
    }
    
    return {best, bestDist};
}

int main() {
    // Example usage
    vector<City> cities = {
        {10, 10}, {20, 50}, {80, 30}, 
        {50, 70}, {90, 90}
    };
    
    auto [bestRoute, bestDist] = hillClimbing(cities);
    
    cout << "Mejor distancia: " << bestDist << endl;
    cout << "Mejor ruta: ";
    for (int city : bestRoute) {
        cout << city << " ";
    }
    cout << endl;
    
    return 0;
}`;

  const pythonCode = `import math
import random
from typing import List, Tuple

class City:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

def distance(city1: City, city2: City) -> float:
    """Calculate Euclidean distance between two cities"""
    dx = city1.x - city2.x
    dy = city1.y - city2.y
    return math.sqrt(dx * dx + dy * dy)

def calculate_distance(route: List[int], cities: List[City]) -> float:
    """Calculate total route distance"""
    total = 0
    for i in range(len(route) - 1):
        total += distance(cities[route[i]], cities[route[i + 1]])
    # Return to start
    total += distance(cities[route[-1]], cities[route[0]])
    return total

def generate_neighbor(route: List[int]) -> List[int]:
    """Generate neighbor by swapping two random cities"""
    neighbor = route.copy()
    i = random.randint(0, len(route) - 1)
    j = random.randint(0, len(route) - 1)
    while i == j:
        j = random.randint(0, len(route) - 1)
    
    # Swap
    neighbor[i], neighbor[j] = neighbor[j], neighbor[i]
    return neighbor

def hill_climbing(cities: List[City], 
                 max_iterations: int = 10000) -> Tuple[List[int], float]:
    """
    Hill Climbing Algorithm for TSP
    
    Time Complexity: O(n² * iterations)
    Space Complexity: O(n)
    """
    # Initialize with random route
    current = list(range(len(cities)))
    random.shuffle(current)
    
    current_dist = calculate_distance(current, cities)
    best = current.copy()
    best_dist = current_dist
    
    stuck_counter = 0
    
    for iteration in range(max_iterations):
        # Generate neighbor
        neighbor = generate_neighbor(current)
        neighbor_dist = calculate_distance(neighbor, cities)
        
        # Accept if better
        if neighbor_dist < current_dist:
            current = neighbor
            current_dist = neighbor_dist
            stuck_counter = 0
            
            if neighbor_dist < best_dist:
                best = neighbor.copy()
                best_dist = neighbor_dist
        else:
            stuck_counter += 1
        
        # Stop if stuck in local optimum
        if stuck_counter >= 100:
            print("Convergencia alcanzada")
            break
    
    return best, best_dist

# Example usage
if __name__ == "__main__":
    cities = [
        City(10, 10), City(20, 50), City(80, 30),
        City(50, 70), City(90, 90)
    ]
    
    best_route, best_dist = hill_climbing(cities)
    
    print(f"Mejor distancia: {best_dist:.2f}")
    print(f"Mejor ruta: {best_route}")`;

  return (
    <div className="algo-container">
      <h2 className="section-title">Hill Climbing - Problema del Viajante (TSP)</h2>

      <div className="explanation-section">
        <h3>¿Qué es Hill Climbing?</h3>
        <p>
          Hill Climbing es un algoritmo de búsqueda local que busca encontrar el óptimo 
          en un espacio de búsqueda. Comienza con una solución inicial y explora vecinos, 
          moviéndose siempre hacia soluciones mejores. El algoritmo se detiene cuando no 
          encuentra ningún vecino mejor, alcanzando un óptimo local.
        </p>
        <p>
          <strong>Ventajas:</strong> Simple, rápido, bajo uso de memoria.
          <br />
          <strong>Desventajas:</strong> Puede quedarse atrapado en óptimos locales, no 
          garantiza encontrar el óptimo global.
        </p>
        <p>
          <strong>Complejidad:</strong> O(n² × iteraciones) donde n es el número de ciudades.
        </p>
      </div>

      <div className="controls">
        <input
          type="number"
          min="3"
          max="20"
          value={numCities}
          onChange={(e) => setNumCities(parseInt(e.target.value))}
          disabled={isRunning}
          className="input-field"
          placeholder="Número de ciudades"
        />
        <button onClick={initialize} disabled={isRunning} className="btn btn-primary">
          Generar Ciudades
        </button>
        <button onClick={start} disabled={isRunning || cities.length === 0} className="btn btn-success">
          Iniciar
        </button>
        <button onClick={stop} disabled={!isRunning} className="btn btn-warning">
          Detener
        </button>
        <button onClick={reset} className="btn btn-danger">
          Reiniciar
        </button>
      </div>

      {message && (
        <div className="animation-message">
          {message}
        </div>
      )}

      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-label">Iteraciones</div>
          <div className="stat-value">{iterations}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Distancia Actual</div>
          <div className="stat-value current">{currentDistance.toFixed(2)}</div>
        </div>
        <div className="stat-box best">
          <div className="stat-label">Mejor Distancia</div>
          <div className="stat-value">{bestDistance === Infinity ? '∞' : bestDistance.toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Iteraciones Estancadas</div>
          <div className="stat-value stuck">{stuckCounter}</div>
        </div>
      </div>

      <div className="visualization-area">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="tsp-canvas"
        />
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
          <pre>{codeLanguage === 'cpp' ? cppCode : pythonCode}</pre>
        </div>
      </div>
    </div>
  );
};

export default HillClimbing;