import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/tree.css';

export function AVLTree() {
  const [tree, setTree] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [rotatingNodes, setRotatingNodes] = useState([]);
  const [animationMessage, setAnimationMessage] = useState('');

  class TreeNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.height = 1;
    }
  }

  const getHeight = (node) => {
    return node ? node.height : 0;
  };

  const getBalance = (node) => {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
  };

  const updateHeight = (node) => {
    if (node) {
      node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    }
  };

  const rotateRight = (y) => {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);

    return x;
  };

  const rotateLeft = (x) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    return y;
  };

  const insertNode = (root, value) => {
    if (!root) return new TreeNode(value);
    
    if (value < root.value) {
      root.left = insertNode(root.left, value);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value);
    } else {
      return root; // Duplicate values not allowed
    }

    updateHeight(root);

    const balance = getBalance(root);

    // Left Left Case
    if (balance > 1 && value < root.left.value) {
      return rotateRight(root);
    }

    // Right Right Case
    if (balance < -1 && value > root.right.value) {
      return rotateLeft(root);
    }

    // Left Right Case
    if (balance > 1 && value > root.left.value) {
      root.left = rotateLeft(root.left);
      return rotateRight(root);
    }

    // Right Left Case
    if (balance < -1 && value < root.right.value) {
      root.right = rotateRight(root.right);
      return rotateLeft(root);
    }

    return root;
  };

  const addNode = () => {
    if (inputValue.trim() === '') return;
    const value = parseInt(inputValue);
    setTree(insertNode(tree, value));
    setInputValue('');
  };

  const clearTree = () => {
    setTree(null);
    setAnimationMessage('');
    setIsAnimating(false);
  };

  const generateRandom = () => {
    let newTree = null;
    const values = [];
    for (let i = 0; i < 7; i++) {
      const val = Math.floor(Math.random() * 100);
      values.push(val);
      newTree = insertNode(newTree, val);
    }
    setTree(newTree);
    setAnimationMessage('');
    setIsAnimating(false);
  };

  // Insertar sin balancear (BST normal)
  const insertUnbalanced = (root, value) => {
    if (!root) return new TreeNode(value);
    
    if (value < root.value) {
      root.left = insertUnbalanced(root.left, value);
    } else if (value > root.value) {
      root.right = insertUnbalanced(root.right, value);
    }
    
    updateHeight(root);
    return root;
  };

  const generateUnbalancedTree = () => {
    // Generar valores ordenados para crear árbol degenerado
    const values = [];
    const startValue = Math.floor(Math.random() * 50);
    
    // Crear secuencia que generará árbol desbalanceado
    for (let i = 0; i < 7; i++) {
      values.push(startValue + i * 10);
    }

    let newTree = null;
    for (const val of values) {
      newTree = insertUnbalanced(newTree, val);
    }
    
    setTree(newTree);
    setAnimationMessage('Árbol desbalanceado generado. Presiona "Balancear con Animación" para ver el proceso.');
    setIsAnimating(false);
  };

  // Recolectar valores en orden
  const collectInorder = (node, values = []) => {
    if (!node) return values;
    collectInorder(node.left, values);
    values.push(node.value);
    collectInorder(node.right, values);
    return values;
  };

  // Construir AVL balanceado desde array ordenado
  const buildBalancedAVL = (values, start, end) => {
    if (start > end) return null;
    
    const mid = Math.floor((start + end) / 2);
    const node = new TreeNode(values[mid]);
    
    node.left = buildBalancedAVL(values, start, mid - 1);
    node.right = buildBalancedAVL(values, mid + 1, end);
    
    updateHeight(node);
    return node;
  };

  const animateBalance = async () => {
    if (!tree || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationMessage('Paso 1: Recorriendo el árbol en orden...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const values = collectInorder(tree);
    setAnimationMessage(`Paso 2: Valores recolectados: [${values.join(', ')}]`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAnimationMessage('Paso 3: Construyendo árbol balanceado desde el medio...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const balancedTree = buildBalancedAVL(values, 0, values.length - 1);
    setTree(balancedTree);
    
    setAnimationMessage('✅ ¡Árbol balanceado correctamente! Todas las alturas difieren en máximo 1.');
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  const renderTree = (node, x = 400, y = 50, level = 0) => {
    if (!node) return null;

    const horizontalSpacing = 200 / Math.pow(2, level);
    const verticalSpacing = 80;

    const leftX = x - horizontalSpacing;
    const leftY = y + verticalSpacing;
    const rightX = x + horizontalSpacing;
    const rightY = y + verticalSpacing;

    const balance = getBalance(node);
    const isBalanced = Math.abs(balance) <= 1;

    return (
      <>
        {node.left && (
          <line
            x1={x}
            y1={y}
            x2={leftX}
            y2={leftY}
            stroke="#64748b"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={x}
            y1={y}
            x2={rightX}
            y2={rightY}
            stroke="#64748b"
            strokeWidth="2"
          />
        )}
        {node.left && renderTree(node.left, leftX, leftY, level + 1)}
        {node.right && renderTree(node.right, rightX, rightY, level + 1)}
        <circle 
          cx={x} 
          cy={y} 
          r="25" 
          fill={isBalanced ? "url(#gradient-avl)" : "#ef4444"} 
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dy=".3em"
          fill="white"
          fontSize="16"
          fontWeight="bold"
        >
          {node.value}
        </text>
        <text
          x={x}
          y={y + 40}
          textAnchor="middle"
          fill="#64748b"
          fontSize="12"
        >
          h:{node.height}
        </text>
      </>
    );
  };

  const cppCode = `#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    int height;
    
    Node(int val) : data(val), left(nullptr), right(nullptr), height(1) {}
};

class AVL {
private:
    Node* root;
    
    int height(Node* node) {
        return node ? node->height : 0;
    }
    
    int getBalance(Node* node) {
        return node ? height(node->left) - height(node->right) : 0;
    }
    
    void updateHeight(Node* node) {
        if (node)
            node->height = 1 + max(height(node->left), height(node->right));
    }
    
    Node* rotateRight(Node* y) {
        Node* x = y->left;
        Node* T2 = x->right;
        
        x->right = y;
        y->left = T2;
        
        updateHeight(y);
        updateHeight(x);
        
        return x;
    }
    
    Node* rotateLeft(Node* x) {
        Node* y = x->right;
        Node* T2 = y->left;
        
        y->left = x;
        x->right = T2;
        
        updateHeight(x);
        updateHeight(y);
        
        return y;
    }
    
    Node* insert(Node* node, int data) {
        if (!node) return new Node(data);
        
        if (data < node->data)
            node->left = insert(node->left, data);
        else if (data > node->data)
            node->right = insert(node->right, data);
        else
            return node;
        
        updateHeight(node);
        
        int balance = getBalance(node);
        
        // Left Left
        if (balance > 1 && data < node->left->data)
            return rotateRight(node);
        
        // Right Right
        if (balance < -1 && data > node->right->data)
            return rotateLeft(node);
        
        // Left Right
        if (balance > 1 && data > node->left->data) {
            node->left = rotateLeft(node->left);
            return rotateRight(node);
        }
        
        // Right Left
        if (balance < -1 && data < node->right->data) {
            node->right = rotateRight(node->right);
            return rotateLeft(node);
        }
        
        return node;
    }
    
    void inorder(Node* node) {
        if (!node) return;
        inorder(node->left);
        cout << node->data << " ";
        inorder(node->right);
    }
    
public:
    AVL() : root(nullptr) {}
    
    void insert(int data) {
        root = insert(root, data);
    }
    
    void display() {
        inorder(root);
        cout << endl;
    }
};

int main() {
    AVL tree;
    tree.insert(10);
    tree.insert(20);
    tree.insert(30);
    tree.insert(40);
    tree.insert(50);
    tree.display();
    return 0;
}`;

  const pythonCode = `class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None
        self.height = 1

class AVL:
    def __init__(self):
        self.root = None
    
    def height(self, node):
        return node.height if node else 0
    
    def get_balance(self, node):
        if not node:
            return 0
        return self.height(node.left) - self.height(node.right)
    
    def update_height(self, node):
        if node:
            node.height = 1 + max(self.height(node.left), 
                                  self.height(node.right))
    
    def rotate_right(self, y):
        x = y.left
        T2 = x.right
        
        x.right = y
        y.left = T2
        
        self.update_height(y)
        self.update_height(x)
        
        return x
    
    def rotate_left(self, x):
        y = x.right
        T2 = y.left
        
        y.left = x
        x.right = T2
        
        self.update_height(x)
        self.update_height(y)
        
        return y
    
    def insert(self, data):
        self.root = self._insert_recursive(self.root, data)
    
    def _insert_recursive(self, node, data):
        if not node:
            return Node(data)
        
        if data < node.data:
            node.left = self._insert_recursive(node.left, data)
        elif data > node.data:
            node.right = self._insert_recursive(node.right, data)
        else:
            return node
        
        self.update_height(node)
        
        balance = self.get_balance(node)
        
        # Left Left
        if balance > 1 and data < node.left.data:
            return self.rotate_right(node)
        
        # Right Right
        if balance < -1 and data > node.right.data:
            return self.rotate_left(node)
        
        # Left Right
        if balance > 1 and data > node.left.data:
            node.left = self.rotate_left(node.left)
            return self.rotate_right(node)
        
        # Right Left
        if balance < -1 and data < node.right.data:
            node.right = self.rotate_right(node.right)
            return self.rotate_left(node)
        
        return node
    
    def inorder(self, node=None):
        if node is None:
            node = self.root
        if node:
            self.inorder(node.left)
            print(node.data, end=" ")
            self.inorder(node.right)

# Uso
tree = AVL()
tree.insert(10)
tree.insert(20)
tree.insert(30)
tree.insert(40)
tree.insert(50)
tree.inorder()`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Árbol AVL (Auto-balanceado)</h2>
      
      <div className="explanation-section">
        <h3>¿Qué es un Árbol AVL?</h3>
        <p>
          Un Árbol AVL es un árbol binario de búsqueda auto-balanceado donde las alturas de 
          los dos subárboles hijos de cualquier nodo difieren como máximo en uno. Si en algún 
          momento difieren en más de uno, se realizan rotaciones para rebalancear el árbol.
        </p>
        <p>
          <strong>Complejidad temporal:</strong> Búsqueda/Inserción/Eliminación: O(log n) garantizado 
          (gracias al auto-balanceo). <strong>Espacio:</strong> O(n).
        </p>
        <p>
          <strong>Ventaja sobre BST:</strong> El AVL garantiza que el árbol siempre está balanceado, 
          lo que asegura un rendimiento O(log n) en el peor caso, a diferencia del BST normal que 
          puede degradarse a O(n).
        </p>
      </div>

      <div className="controls">
        <input
          type="number"
          className="input-field"
          placeholder="Valor del nodo"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addNode()}
          disabled={isAnimating}
        />
        <button className="btn btn-primary" onClick={addNode} disabled={isAnimating}>
          Insertar Nodo
        </button>
        <button className="btn btn-success" onClick={generateRandom} disabled={isAnimating}>
          Generar Aleatorio
        </button>
        <button className="btn btn-secondary" onClick={clearTree} disabled={isAnimating}>
          Limpiar
        </button>
        <button className="btn btn-info" onClick={generateUnbalancedTree} disabled={isAnimating}>
          Generar Desbalanceado
        </button>
        <button 
          className="btn btn-warning" 
          onClick={animateBalance}
          disabled={!tree || isAnimating}
        >
          {isAnimating ? 'Balanceando...' : 'Balancear con Animación'}
        </button>
      </div>

      {animationMessage && (
        <div className="animation-message">
          {animationMessage}
        </div>
      )}

      <div className="visualization-area">
        {!tree ? (
          <div className="empty-message">Árbol vacío - Inserta nodos para visualizar el auto-balanceo</div>
        ) : (
          <svg width="800" height="400" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gradient-avl" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {renderTree(tree)}
          </svg>
        )}
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