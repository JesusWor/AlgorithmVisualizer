import { useState } from 'react';
import '../styles/common.css';
import '../styles/branchbound.css';

export function BranchAndBound() {
  const [items, setItems] = useState([
    { id: 1, weight: 2, value: 10, selected: false },
    { id: 2, weight: 5, value: 20, selected: false },
    { id: 3, weight: 10, value: 30, selected: false },
    { id: 4, weight: 5, value: 15, selected: false }
  ]);
  const [capacity, setCapacity] = useState(16);
  const [isAnimating, setIsAnimating] = useState(false);
  const [treeNodes, setTreeNodes] = useState([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [bestSolution, setBestSolution] = useState(null);
  const [animationMessage, setAnimationMessage] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [stats, setStats] = useState({ nodesExplored: 0, nodesPruned: 0 });

  const calculateBound = (level, currentWeight, currentValue, items, capacity) => {
    if (currentWeight >= capacity) return 0;

    let bound = currentValue;
    let totalWeight = currentWeight;
    let j = level + 1;

    while (j < items.length && totalWeight + items[j].weight <= capacity) {
      totalWeight += items[j].weight;
      bound += items[j].value;
      j++;
    }

    if (j < items.length) {
      bound += (capacity - totalWeight) * (items[j].value / items[j].weight);
    }

    return bound;
  };

  const solveBranchAndBound = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTreeNodes([]);
    setCurrentNodeIndex(-1);
    setBestSolution(null);
    setAnimationMessage('Iniciando Branch and Bound...');
    setStats({ nodesExplored: 0, nodesPruned: 0 });

    // Ordenar items por relación valor/peso (descendente)
    const sortedItems = [...items].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

    let maxValue = 0;
    let bestSelection = [];
    let nodes = [];
    let nodesExplored = 0;
    let nodesPruned = 0;

    // Nodo raíz
    const rootNode = {
      level: -1,
      value: 0,
      weight: 0,
      bound: calculateBound(-1, 0, 0, sortedItems, capacity),
      included: [],
      x: 400,
      y: 50,
      id: 0,
      status: 'exploring'
    };

    nodes.push(rootNode);
    setTreeNodes([...nodes]);
    await new Promise(resolve => setTimeout(resolve, 800));

    const queue = [rootNode];
    let nodeIdCounter = 1;

    while (queue.length > 0) {
      const node = queue.shift();
      
      setCurrentNodeIndex(node.id);
      nodes[node.id].status = 'current';
      setTreeNodes([...nodes]);
      setAnimationMessage(`Explorando nodo ${node.id}: Nivel ${node.level + 1}, Valor=${node.value}, Peso=${node.weight}`);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      nodesExplored++;
      setStats({ nodesExplored, nodesPruned });

      if (node.bound <= maxValue) {
        nodes[node.id].status = 'pruned';
        setTreeNodes([...nodes]);
        nodesPruned++;
        setStats({ nodesExplored, nodesPruned });
        setAnimationMessage(`❌ Nodo ${node.id} podado: bound ${node.bound.toFixed(1)} ≤ mejor valor ${maxValue}`);
        await new Promise(resolve => setTimeout(resolve, 600));
        continue;
      }

      if (node.level === sortedItems.length - 1) {
        nodes[node.id].status = 'leaf';
        setTreeNodes([...nodes]);
        continue;
      }

      const nextLevel = node.level + 1;
      const item = sortedItems[nextLevel];

      // Rama izquierda: incluir item
      if (node.weight + item.weight <= capacity) {
        const leftValue = node.value + item.value;
        const leftWeight = node.weight + item.weight;
        const leftBound = calculateBound(nextLevel, leftWeight, leftValue, sortedItems, capacity);
        
        const leftNode = {
          level: nextLevel,
          value: leftValue,
          weight: leftWeight,
          bound: leftBound,
          included: [...node.included, item.id],
          x: node.x - (300 / Math.pow(2, nextLevel + 1)),
          y: node.y + 80,
          id: nodeIdCounter++,
          parentId: node.id,
          status: 'pending',
          isLeft: true
        };

        nodes.push(leftNode);
        setTreeNodes([...nodes]);
        await new Promise(resolve => setTimeout(resolve, 400));

        if (leftValue > maxValue) {
          maxValue = leftValue;
          bestSelection = leftNode.included;
          setBestSolution({ value: maxValue, items: [...bestSelection] });
          setAnimationMessage(`✅ ¡Nueva mejor solución! Valor: ${maxValue}`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        if (leftBound > maxValue) {
          queue.push(leftNode);
        } else {
          nodes[leftNode.id].status = 'pruned';
          setTreeNodes([...nodes]);
          nodesPruned++;
          setStats({ nodesExplored, nodesPruned });
        }
      }

      // Rama derecha: no incluir item
      const rightBound = calculateBound(nextLevel, node.weight, node.value, sortedItems, capacity);
      
      if (rightBound > maxValue) {
        const rightNode = {
          level: nextLevel,
          value: node.value,
          weight: node.weight,
          bound: rightBound,
          included: [...node.included],
          x: node.x + (300 / Math.pow(2, nextLevel + 1)),
          y: node.y + 80,
          id: nodeIdCounter++,
          parentId: node.id,
          status: 'pending',
          isLeft: false
        };

        nodes.push(rightNode);
        setTreeNodes([...nodes]);
        await new Promise(resolve => setTimeout(resolve, 400));

        queue.push(rightNode);
      }

      nodes[node.id].status = 'explored';
      setTreeNodes([...nodes]);
    }

    setAnimationMessage(`🎉 ¡Completado! Valor máximo: ${maxValue} | Nodos explorados: ${nodesExplored} | Nodos podados: ${nodesPruned}`);
    setIsAnimating(false);
  };

  const generateRandomItems = () => {
    const newItems = [];
    const count = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 1; i <= count; i++) {
      newItems.push({
        id: i,
        weight: 2 + Math.floor(Math.random() * 10),
        value: 10 + Math.floor(Math.random() * 40),
        selected: false
      });
    }
    
    setItems(newItems);
    setCapacity(20 + Math.floor(Math.random() * 15));
    resetVisualization();
  };

  const resetVisualization = () => {
    setTreeNodes([]);
    setCurrentNodeIndex(-1);
    setBestSolution(null);
    setAnimationMessage('');
    setStats({ nodesExplored: 0, nodesPruned: 0 });
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: parseInt(value) || 0 } : item
    ));
    resetVisualization();
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, weight: 5, value: 15, selected: false }]);
    resetVisualization();
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      resetVisualization();
    }
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

struct Item {
    int weight, value;
    int id;
};

struct Node {
    int level;
    int value;
    int weight;
    double bound;
    vector<int> included;
};

bool compareItems(Item a, Item b) {
    return (double)a.value / a.weight > (double)b.value / b.weight;
}

double calculateBound(Node u, int capacity, vector<Item>& items) {
    if (u.weight >= capacity) return 0;
    
    double bound = u.value;
    int j = u.level + 1;
    int totalWeight = u.weight;
    
    while (j < items.size() && totalWeight + items[j].weight <= capacity) {
        totalWeight += items[j].weight;
        bound += items[j].value;
        j++;
    }
    
    if (j < items.size()) {
        bound += (capacity - totalWeight) * 
                 ((double)items[j].value / items[j].weight);
    }
    
    return bound;
}

int knapsackBranchBound(int capacity, vector<Item>& items) {
    sort(items.begin(), items.end(), compareItems);
    
    queue<Node> Q;
    Node root = {-1, 0, 0, 0.0};
    root.bound = calculateBound(root, capacity, items);
    Q.push(root);
    
    int maxValue = 0;
    
    while (!Q.empty()) {
        Node u = Q.front();
        Q.pop();
        
        if (u.bound <= maxValue) continue;
        if (u.level == items.size() - 1) continue;
        
        // Include item
        Node left;
        left.level = u.level + 1;
        left.weight = u.weight + items[left.level].weight;
        left.value = u.value + items[left.level].value;
        left.included = u.included;
        left.included.push_back(items[left.level].id);
        
        if (left.weight <= capacity && left.value > maxValue) {
            maxValue = left.value;
        }
        
        left.bound = calculateBound(left, capacity, items);
        if (left.bound > maxValue) {
            Q.push(left);
        }
        
        // Exclude item
        Node right;
        right.level = u.level + 1;
        right.weight = u.weight;
        right.value = u.value;
        right.included = u.included;
        right.bound = calculateBound(right, capacity, items);
        
        if (right.bound > maxValue) {
            Q.push(right);
        }
    }
    
    return maxValue;
}

int main() {
    vector<Item> items = {{2, 10, 1}, {5, 20, 2}, {10, 30, 3}, {5, 15, 4}};
    int capacity = 16;
    
    cout << "Valor máximo: " << knapsackBranchBound(capacity, items) << endl;
    return 0;
}`;

  const pythonCode = `from queue import Queue
from dataclasses import dataclass
from typing import List

@dataclass
class Item:
    weight: int
    value: int
    id: int

@dataclass
class Node:
    level: int
    value: int
    weight: int
    bound: float
    included: List[int]

def calculate_bound(node: Node, capacity: int, items: List[Item]) -> float:
    if node.weight >= capacity:
        return 0
    
    bound = node.value
    j = node.level + 1
    total_weight = node.weight
    
    while j < len(items) and total_weight + items[j].weight <= capacity:
        total_weight += items[j].weight
        bound += items[j].value
        j += 1
    
    if j < len(items):
        bound += (capacity - total_weight) * (items[j].value / items[j].weight)
    
    return bound

def knapsack_branch_bound(capacity: int, items: List[Item]) -> int:
    # Sort by value/weight ratio
    items.sort(key=lambda x: x.value / x.weight, reverse=True)
    
    Q = Queue()
    root = Node(-1, 0, 0, 0.0, [])
    root.bound = calculate_bound(root, capacity, items)
    Q.put(root)
    
    max_value = 0
    
    while not Q.empty():
        u = Q.get()
        
        if u.bound <= max_value:
            continue
        
        if u.level == len(items) - 1:
            continue
        
        # Include item
        left = Node(
            level=u.level + 1,
            weight=u.weight + items[u.level + 1].weight,
            value=u.value + items[u.level + 1].value,
            bound=0.0,
            included=u.included + [items[u.level + 1].id]
        )
        
        if left.weight <= capacity and left.value > max_value:
            max_value = left.value
        
        left.bound = calculate_bound(left, capacity, items)
        if left.bound > max_value:
            Q.put(left)
        
        # Exclude item
        right = Node(
            level=u.level + 1,
            weight=u.weight,
            value=u.value,
            bound=0.0,
            included=u.included[:]
        )
        
        right.bound = calculate_bound(right, capacity, items)
        if right.bound > max_value:
            Q.put(right)
    
    return max_value

# Uso
items = [Item(2, 10, 1), Item(5, 20, 2), Item(10, 30, 3), Item(5, 15, 4)]
capacity = 16
print(f"Valor máximo: {knapsack_branch_bound(capacity, items)}")`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Branch and Bound - Problema de la Mochila 0/1</h2>
      
      <div className="explanation-section">
        <h3>¿Qué es Branch and Bound?</h3>
        <p>
          Branch and Bound es una técnica de diseño de algoritmos que explora el espacio de 
          soluciones de manera sistemática, podando ramas que no pueden llevar a una solución 
          mejor que la actual. Es especialmente útil para problemas de optimización.
        </p>
        <p>
          <strong>Complejidad temporal:</strong> O(2^n) en el peor caso, pero con poda efectiva 
          puede ser mucho más eficiente. <strong>Espacio:</strong> O(n) para la cola de nodos.
        </p>
        <p>
          <strong>Ventaja:</strong> Encuentra la solución óptima garantizada, y la poda 
          elimina muchas soluciones subóptimas sin explorarlas completamente.
        </p>
      </div>

      <div className="items-editor">
        <h3>Configurar Problema</h3>
        <div className="capacity-control">
          <label>
            <strong>Capacidad de la mochila:</strong>
            <input
              type="number"
              value={capacity}
              onChange={(e) => {
                setCapacity(parseInt(e.target.value) || 0);
                resetVisualization();
              }}
              min="1"
              disabled={isAnimating}
              className="input-field"
            />
          </label>
        </div>

        <div className="items-list">
          <div className="items-header">
            <span>ID</span>
            <span>Peso</span>
            <span>Valor</span>
            <span>Ratio (V/P)</span>
            <span>Acción</span>
          </div>
          {items.map(item => (
            <div key={item.id} className="item-row">
              <span className="item-id">{item.id}</span>
              <input
                type="number"
                value={item.weight}
                onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                disabled={isAnimating}
                className="input-field small"
                min="1"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                disabled={isAnimating}
                className="input-field small"
                min="1"
              />
              <span className="ratio">{(item.value / item.weight).toFixed(2)}</span>
              <button
                onClick={() => removeItem(item.id)}
                disabled={isAnimating || items.length <= 1}
                className="btn btn-danger small"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          disabled={isAnimating}
          className="btn btn-success"
          style={{ marginTop: '1rem' }}
        >
          ➕ Agregar Item
        </button>
      </div>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={solveBranchAndBound}
          disabled={isAnimating}
        >
          {isAnimating ? '⏳ Resolviendo...' : '▶️ Resolver con Branch & Bound'}
        </button>
        <button
          className="btn btn-success"
          onClick={generateRandomItems}
          disabled={isAnimating}
        >
          🎲 Generar Aleatorio
        </button>
        <button
          className="btn btn-secondary"
          onClick={resetVisualization}
          disabled={isAnimating}
        >
          🔄 Reiniciar Visualización
        </button>
      </div>

      {animationMessage && (
        <div className="animation-message">
          {animationMessage}
        </div>
      )}

      {stats.nodesExplored > 0 && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Nodos Explorados:</span>
            <span className="stat-value">{stats.nodesExplored}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nodos Podados:</span>
            <span className="stat-value prune">{stats.nodesPruned}</span>
          </div>
          {bestSolution && (
            <div className="stat-item best">
              <span className="stat-label">Mejor Valor:</span>
              <span className="stat-value">{bestSolution.value}</span>
            </div>
          )}
        </div>
      )}

      <div className="visualization-area">
        {treeNodes.length === 0 ? (
          <div className="empty-message">
            Configura los items y presiona "Resolver" para ver el árbol de Branch & Bound
          </div>
        ) : (
          <svg width="800" height="600" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gradient-exploring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="gradient-explored" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            
            {treeNodes.map(node => {
              const parent = node.parentId !== undefined ? treeNodes.find(n => n.id === node.parentId) : null;
              
              return (
                <g key={node.id}>
                  {parent && (
                    <>
                      <line
                        x1={parent.x}
                        y1={parent.y}
                        x2={node.x}
                        y2={node.y}
                        stroke={node.isLeft ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <text
                        x={(parent.x + node.x) / 2}
                        y={(parent.y + node.y) / 2}
                        fill="#94a3b8"
                        fontSize="11"
                        textAnchor="middle"
                      >
                        {node.isLeft ? '✓' : '✗'}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {treeNodes.map(node => {
              let fillColor = "#64748b";
              if (node.status === 'current') fillColor = "url(#gradient-exploring)";
              else if (node.status === 'explored') fillColor = "url(#gradient-explored)";
              else if (node.status === 'pruned') fillColor = "#ef4444";
              else if (node.status === 'leaf') fillColor = "#6366f1";
              
              return (
                <g key={`node-${node.id}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="30"
                    fill={fillColor}
                    stroke={node.id === currentNodeIndex ? "#fbbf24" : "transparent"}
                    strokeWidth="3"
                  />
                  <text
                    x={node.x}
                    y={node.y - 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    V:{node.value}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    W:{node.weight}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 45}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    B:{node.bound.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {bestSolution && (
        <div className="solution-panel">
          <h3>🏆 Mejor Solución Encontrada</h3>
          <div className="solution-details">
            <p><strong>Valor Total:</strong> {bestSolution.value}</p>
            <p><strong>Items Incluidos:</strong> {bestSolution.items.join(', ')}</p>
            <div className="selected-items">
              {items.filter(item => bestSolution.items.includes(item.id)).map(item => (
                <div key={item.id} className="selected-item">
                  <span>Item {item.id}</span>
                  <span>Peso: {item.weight}</span>
                  <span>Valor: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
