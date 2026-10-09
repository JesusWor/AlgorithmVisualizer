import { useEffect, useState } from 'react';
import '../styles/common.css';
import '../styles/home.css';

export function Home({ onSelectAlgorithm }) {
  const [stats, setStats] = useState({ algorithms: 0, categories: 0, languages: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    // Animación de contador
    const targets = { algorithms: 16, categories: 5, languages: 2 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        algorithms: Math.floor(targets.algorithms * progress),
        categories: Math.floor(targets.categories * progress),
        languages: Math.floor(targets.languages * progress)
      });

      if (currentStep >= steps) {
        setStats(targets);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (itemId) => {
    setSelectedCard(itemId);
    setTimeout(() => {
      onSelectAlgorithm(itemId);
    }, 300);
  };
  const algorithms = [
    {
      category: 'Estructuras de Datos',
      color: '#3b82f6',
      items: [
        {
          id: 'linkedlist',
          name: 'Lista Enlazada',
          description: 'Estructura lineal donde cada elemento apunta al siguiente',
          icon: '🔗',
          complexity: "O(1) inserción, O(n) búsqueda"
        },
        {
          id: 'bst',
          name: 'Árbol Binario (BST)',
          description: 'Árbol ordenado con máximo dos hijos por nodo',
          icon: '🌳',
          complexity: 'O(log n) promedio'
        },
        {
          id: 'avl',
          name: 'Árbol AVL',
          description: 'BST auto-balanceado con factor de balance',
          icon: '⚖️',
          complexity: 'O(log n) garantizado'
        }
      ]
    },
    {
      category: 'Algoritmos de Búsqueda',
      color: '#10b981',
      items: [
        {
          id: 'astar',
          name: 'A* (A-Star)',
          description: 'Búsqueda de camino más corto usando heurística',
          icon: '🎯',
          complexity: 'O((V+E) log V)'
        },
        {
          id: 'idastar',
          name: 'IDA* (Iterative Deepening A*)',
          description: 'Variante de A* que optimiza el uso de memoria',
          icon: '🔄',
          complexity: 'O(b^d) con menor memoria'
        },
        {
          id: 'binarysearch',
          name: 'Búsqueda Binaria',
          description: 'Búsqueda eficiente en arrays ordenados',
          icon: '🔍',
          complexity: 'O(log n)'
        },
        {
          id: 'sequential',
          name: 'Búsqueda Secuencial',
          description: 'Búsqueda lineal elemento por elemento',
          icon: '➡️',
          complexity: 'O(n)'
        }
      ]
    },
    {
      category: 'Algoritmos de Ordenamiento',
      color: '#f59e0b',
      items: [
        {
          id: 'mergesort',
          name: 'Merge Sort',
          description: 'Divide y conquista ordenando mitades',
          icon: '🔀',
          complexity: 'O(n log n) siempre'
        },
        {
          id: 'quicksort',
          name: 'Quick Sort',
          description: 'Ordenamiento rápido usando pivote',
          icon: '⚡',
          complexity: 'O(n log n) promedio'
        },
        {
          id: 'bubblesort',
          name: 'Bubble Sort',
          description: 'Ordenamiento por comparación de adyacentes',
          icon: '🫧',
          complexity: 'O(n²)'
        }
      ]
    },
    {
      category: 'Algoritmos Avanzados',
      color: '#a78bfa',
      items: [
        {
          id: 'backtracking',
          name: 'Backtracking',
          description: 'Búsqueda exhaustiva con poda (8 Reinas)',
          icon: '♛',
          complexity: 'O(N!) exponencial'
        },
        {
          id: 'backtracking-bitmask',
          name: 'Backtracking con Bitmask',
          description: 'Optimización usando máscaras de bits',
          icon: '🎭',
          complexity: 'O(2^n) optimizado'
        },
        {
          id: 'branchandbound',
          name: 'Branch and Bound',
          description: 'Optimización con poda de soluciones (Mochila 0/1)',
          icon: '🌿',
          complexity: 'O(2^n) con poda'
        },
        {
          id: 'mitm',
          name: 'Meet in the Middle',
          description: 'Divide problema exponencial en dos mitades',
          icon: '🤝',
          complexity: 'O(2^(n/2))',
        },
        {
          id: 'annealing',
          name: 'Simulated Annealing',
          description: 'Optimización probabilística (TSP)',
          icon: '🔥',
          complexity: 'Heurística',
        },
        {
          id: 'hillclimbing',
          name: 'Hill Climbing',
          description: 'Búsqueda local de mejora iterativa',
          icon: '⛰️',
          complexity: 'Heurística'
        },
        {
          id: 'voronoi',
          name: 'Diagrama de Voronoi',
          description: 'Partición del espacio en regiones',
          icon: '🗺️',
          complexity: 'O(n log n)'
        }
      ]
    },
    {
      category: 'Comparación',
      color: '#ef4444',
      items: [
        {
          id: 'comparison',
          name: 'Comparación de Búsqueda',
          description: 'Compara A*, Dijkstra, BFS y Greedy Best-First',
          icon: '📊',
          complexity: 'Analítico'
        },
        {
          id: 'advanced-comparison',
          name: 'Comparación Avanzada',
          description: 'Compara optimizaciones: Bitmask y Meet in the Middle',
          icon: '⚡',
          complexity: 'Analítico',
        }
      ]
    }
  ];

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-background">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">AlgoVisual</h1>
          <p className="hero-subtitle">
            Visualiza y aprende estructuras de datos y algoritmos de forma interactiva
          </p>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="section-header">
          <h2>Selecciona una Categoría</h2>
          <p>Haz clic en cualquier tarjeta para comenzar la visualización</p>
        </div>

        {algorithms.map((category, categoryIndex) => (
          <div key={categoryIndex} className="category-section">
            <div className="category-header">
              <div 
                className="category-badge" 
                style={{ background: category.color }}
              >
                {category.category}
              </div>
              <div className="category-count">
                {category.items.length} algoritmo{category.items.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="cards-grid">
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`algo-card ${selectedCard === item.id ? 'selected' : ''}`}
                  onClick={() => handleCardClick(item.id)}
                  style={{ '--card-color': category.color }}
                >
                  {/* <div className="card-icon" style={{ background: category.color }}>
                    <span>{item.icon}</span>
                  </div> */}
                  <div className="card-content">
                    <h3 className="card-title">{item.name}</h3>
                    <p className="card-description">{item.description}</p>
                    <div className="card-footer">
                      <span className="complexity-badge">
                        {item.complexity.split(",").map((part, i) => (
                          <div key={i}>{part.trim()}</div>
                        ))}
                      </span>

                      <span className="explore-link">
                        Explorar →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="home-footer">
        <div className="footer-bottom">
          <p>© 2025 AlgoVisual. Herramienta educativa para el aprendizaje de algoritmos.</p>
        </div>
      </footer>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}
