import { useState, useEffect, useRef } from 'react';
import '../styles/common.css';
import '../styles/grid.css';

export function VoronoiDiagram() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [numPoints, setNumPoints] = useState(8);
  const [showPoints, setShowPoints] = useState(true);
  const [showVoronoi, setShowVoronoi] = useState(true);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(2); // radio de expansión por frame
  const [currentPixel, setCurrentPixel] = useState({ x: 0, y: 0 });
  const WIDTH = 600;
  const HEIGHT = 400;

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#a855f7'
  ];

  useEffect(() => {
    generatePoints();
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      drawVoronoi();
    }
  }, [points, showPoints, showVoronoi, isAnimating]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const generatePoints = () => {
    const newPoints = [];
    for (let i = 0; i < numPoints; i++) {
      newPoints.push({
        x: Math.random() * (WIDTH - 40) + 20,
        y: Math.random() * (HEIGHT - 40) + 20,
        color: colors[i % colors.length]
      });
    }
    setPoints(newPoints);
    setAnimationProgress(0);
  };

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };

  const drawVoronoi = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Dibujar el diagrama de Voronoi
    if (showVoronoi && points.length > 0) {
      const imageData = ctx.createImageData(WIDTH, HEIGHT);
      const data = imageData.data;

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          let minDist = Infinity;
          let closestPoint = 0;

          // Encontrar el punto más cercano
          for (let i = 0; i < points.length; i++) {
            const dist = distance(x, y, points[i].x, points[i].y);
            if (dist < minDist) {
              minDist = dist;
              closestPoint = i;
            }
          }

          // Colorear el pixel
          const color = points[closestPoint].color;
          const rgb = hexToRgb(color);
          const index = (y * WIDTH + x) * 4;
          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 128; // Transparencia
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Dibujar bordes entre regiones
      drawBorders(ctx);
    }

    // Dibujar puntos
    if (showPoints) {
      drawPoints(ctx);
    }
  };

  const drawBorders = (ctx) => {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    
    for (let y = 1; y < HEIGHT - 1; y++) {
      for (let x = 1; x < WIDTH - 1; x++) {
        let minDist = Infinity;
        let closestPoint = 0;

        for (let i = 0; i < points.length; i++) {
          const dist = distance(x, y, points[i].x, points[i].y);
          if (dist < minDist) {
            minDist = dist;
            closestPoint = i;
          }
        }

        // Verificar vecinos
        const neighbors = [
          [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
          let nMinDist = Infinity;
          let nClosestPoint = 0;

          for (let i = 0; i < points.length; i++) {
            const dist = distance(nx, ny, points[i].x, points[i].y);
            if (dist < nMinDist) {
              nMinDist = dist;
              nClosestPoint = i;
            }
          }

          if (closestPoint !== nClosestPoint) {
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(x, y, 1, 1);
            break;
          }
        }
      }
    }
  };

  const drawPoints = (ctx) => {
    points.forEach((point, index) => {
      // Círculo exterior
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = point.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Círculo interior
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Etiqueta
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`P${index + 1}`, point.x + 12, point.y + 4);
    });
  };

  const animateVoronoi = () => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    let radius = 0;
    const maxRadius = Math.sqrt(WIDTH * WIDTH + HEIGHT * HEIGHT);

    const animate = () => {
      if (radius >= maxRadius) {
        // Animación completa
        setIsAnimating(false);
        setAnimationProgress(100);
        drawBorders(ctx);
        if (showPoints) {
          drawPoints(ctx);
        }
        return;
      }

      // Expandir desde cada punto
      points.forEach((point, index) => {
        const color = point.color;
        const rgb = hexToRgb(color);
        
        // Dibujar círculo de expansión
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        
        // Dibujar solo los píxeles en el borde del círculo actual
        const innerRadius = Math.max(0, radius - animationSpeed);
        
        for (let angle = 0; angle < 360; angle += 1) {
          const rad = (angle * Math.PI) / 180;
          
          for (let r = innerRadius; r <= radius; r += 0.5) {
            const x = Math.round(point.x + r * Math.cos(rad));
            const y = Math.round(point.y + r * Math.sin(rad));
            
            if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
              // Verificar si este punto está más cerca de este sitio que de otros
              let isClosest = true;
              const currentDist = distance(x, y, point.x, point.y);
              
              for (let j = 0; j < points.length; j++) {
                if (j !== index) {
                  const otherDist = distance(x, y, points[j].x, points[j].y);
                  if (otherDist < currentDist) {
                    isClosest = false;
                    break;
                  }
                }
              }
              
              if (isClosest) {
                ctx.fillRect(x, y, 1, 1);
              }
            }
          }
        }
      });

      // Dibujar puntos encima
      if (showPoints) {
        drawPoints(ctx);
      }

      // Actualizar progreso
      const progress = (radius / maxRadius) * 100;
      setAnimationProgress(progress);
      setCurrentPixel({ x: Math.round(radius), y: 0 });

      radius += animationSpeed;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const startAnimation = () => {
    if (points.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    setIsAnimating(true);
    setAnimationProgress(0);
    animateVoronoi();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    drawVoronoi();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const handleCanvasClick = (e) => {
    if (isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints([...points, {
      x,
      y,
      color: colors[points.length % colors.length]
    }]);
  };

  const codes = {
    cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
using namespace std;

struct Point {
    double x, y;
    int id;
};

class VoronoiDiagram {
public:
    vector<Point> sites;
    int width, height;
    
    VoronoiDiagram(int w, int h) : width(w), height(h) {}
    
    void addSite(double x, double y) {
        sites.push_back({x, y, (int)sites.size()});
    }
    
    double distance(double x1, double y1, double x2, double y2) {
        return sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
    
    int findClosestSite(double x, double y) {
        double minDist = 1e9;
        int closestId = -1;
        
        for (const auto& site : sites) {
            double dist = distance(x, y, site.x, site.y);
            if (dist < minDist) {
                minDist = dist;
                closestId = site.id;
            }
        }
        
        return closestId;
    }
    
    // Generar diagrama de Voronoi
    // Retorna una matriz donde cada celda contiene el ID del sitio más cercano
    vector<vector<int>> generateDiagram() {
        vector<vector<int>> diagram(height, vector<int>(width));
        
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                diagram[y][x] = findClosestSite(x, y);
            }
        }
        
        return diagram;
    }
    
    void printRegionSizes() {
        auto diagram = generateDiagram();
        vector<int> regionSizes(sites.size(), 0);
        
        for (const auto& row : diagram) {
            for (int siteId : row) {
                if (siteId >= 0) {
                    regionSizes[siteId]++;
                }
            }
        }
        
        cout << "Tamaños de regiones de Voronoi:" << endl;
        for (size_t i = 0; i < regionSizes.size(); i++) {
            cout << "Sitio " << i << ": " << regionSizes[i] << " píxeles" << endl;
        }
    }
};

int main() {
    VoronoiDiagram voronoi(600, 400);
    
    // Agregar sitios
    voronoi.addSite(100, 100);
    voronoi.addSite(500, 100);
    voronoi.addSite(300, 300);
    voronoi.addSite(100, 350);
    voronoi.addSite(500, 350);
    
    // Generar y analizar diagrama
    voronoi.printRegionSizes();
    
    return 0;
}`,
    python: `import numpy as np
import math

class Point:
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.id = id

class VoronoiDiagram:
    def __init__(self, width, height):
        self.sites = []
        self.width = width
        self.height = height
    
    def add_site(self, x, y):
        self.sites.append(Point(x, y, len(self.sites)))
    
    def distance(self, x1, y1, x2, y2):
        return math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
    
    def find_closest_site(self, x, y):
        min_dist = float('inf')
        closest_id = -1
        
        for site in self.sites:
            dist = self.distance(x, y, site.x, site.y)
            if dist < min_dist:
                min_dist = dist
                closest_id = site.id
        
        return closest_id
    
    def generate_diagram(self):
        """Genera el diagrama de Voronoi"""
        diagram = np.zeros((self.height, self.width), dtype=int)
        
        for y in range(self.height):
            for x in range(self.width):
                diagram[y][x] = self.find_closest_site(x, y)
        
        return diagram
    
    def print_region_sizes(self):
        diagram = self.generate_diagram()
        region_sizes = [0] * len(self.sites)
        
        for row in diagram:
            for site_id in row:
                if site_id >= 0:
                    region_sizes[site_id] += 1
        
        print("Tamaños de regiones de Voronoi:")
        for i, size in enumerate(region_sizes):
            print(f"Sitio {i}: {size} píxeles")

# Uso
voronoi = VoronoiDiagram(600, 400)

# Agregar sitios
voronoi.add_site(100, 100)
voronoi.add_site(500, 100)
voronoi.add_site(300, 300)
voronoi.add_site(100, 350)
voronoi.add_site(500, 350)

# Generar y analizar diagrama
voronoi.print_region_sizes()`
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Diagrama de Voronoi</h2>

      <div className="explanation-section">
        <h3>¿Qué es un Diagrama de Voronoi?</h3>
        <p>
          Un diagrama de Voronoi es una partición del plano en regiones basadas en la distancia 
          a un conjunto específico de puntos (llamados sitios). Cada región consiste en todos los 
          puntos más cercanos a un sitio particular que a cualquier otro.
        </p>
        <p>
          <strong>Aplicaciones:</strong>
        </p>
        <ul style={{ marginLeft: '2rem', lineHeight: '1.8' }}>
          <li>Planificación urbana (zonas de influencia)</li>
          <li>Biología (patrones de crecimiento celular)</li>
          <li>Gráficos por computadora (generación de texturas)</li>
          <li>Robótica (partición del espacio)</li>
          <li>Meteorología (interpolación de datos)</li>
        </ul>
        <p>
          Complejidad: <strong>O(n log n)</strong> usando algoritmo de Fortune.
          Esta implementación usa fuerza bruta: <strong>O(n × width × height)</strong>.
        </p>
      </div>

      <div className="controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Número de puntos:</span>
          <input
            type="number"
            className="input-field"
            value={numPoints}
            onChange={(e) => setNumPoints(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
            min="1"
            max="12"
            disabled={isAnimating}
            style={{ width: '80px' }}
          />
        </label>
        <button 
          className="btn btn-primary" 
          onClick={generatePoints}
          disabled={isAnimating}
        >
          🎲 Generar Puntos
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setPoints([])}
          disabled={isAnimating}
        >
          🗑️ Limpiar
        </button>
      </div>

      <div className="controls" style={{ marginTop: '0.5rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={startAnimation}
          disabled={isAnimating || points.length === 0}
          style={{
            background: isAnimating ? '#9ca3af' : '#10b981',
            cursor: (isAnimating || points.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {isAnimating ? '⏳ Animando...' : '▶️ Correr Animación'}
        </button>
        <button 
          className="btn btn-danger" 
          onClick={stopAnimation}
          disabled={!isAnimating}
          style={{
            opacity: !isAnimating ? 0.6 : 1,
            cursor: !isAnimating ? 'not-allowed' : 'pointer'
          }}
        >
          ⏹️ Detener
        </button>
      </div>

      <div className="controls" style={{ marginTop: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showVoronoi}
            onChange={(e) => setShowVoronoi(e.target.checked)}
            disabled={isAnimating}
          />
          <span>Mostrar Voronoi</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          <span>Mostrar Puntos</span>
        </label>
      </div>

      <div className="explanation-section" style={{ 
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          💡 <strong>Tip:</strong> Haz clic en el canvas para agregar puntos manualmente. 
          La animación muestra cómo cada punto expande su región de influencia simultáneamente, 
          creando los bordes del diagrama de Voronoi donde se encuentran.
        </p>
      </div>

      <div className="visualization-area">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onClick={handleCanvasClick}
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: '4px',
              cursor: isAnimating ? 'wait' : 'crosshair'
            }}
          />
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          Puntos activos: {points.length} | Estado: {isAnimating ? '🔄 Animando...' : '✅ Listo'}
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