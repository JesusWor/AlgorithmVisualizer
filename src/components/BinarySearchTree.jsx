import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/tree.css';

export function BinarySearchTree() {
  const [tree, setTree] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  class TreeNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  const insertNode = (root, value) => {
    if (!root) return new TreeNode(value);
    
    if (value < root.value) {
      root.left = insertNode(root.left, value);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value);
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
  };

  const renderTree = (node, x = 400, y = 50, level = 0) => {
    if (!node) return null;

    const horizontalSpacing = 200 / Math.pow(2, level);
    const verticalSpacing = 80;

    const leftX = x - horizontalSpacing;
    const leftY = y + verticalSpacing;
    const rightX = x + horizontalSpacing;
    const rightY = y + verticalSpacing;

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
        <circle cx={x} cy={y} r="25" fill="url(#gradient)" />
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
      </>
    );
  };

  const cppCode = `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

class BST {
private:
    Node* root;
    
    Node* insert(Node* node, int data) {
        if (!node) return new Node(data);
        
        if (data < node->data)
            node->left = insert(node->left, data);
        else if (data > node->data)
            node->right = insert(node->right, data);
        
        return node;
    }
    
    bool search(Node* node, int data) {
        if (!node) return false;
        if (node->data == data) return true;
        
        if (data < node->data)
            return search(node->left, data);
        return search(node->right, data);
    }
    
    void inorder(Node* node) {
        if (!node) return;
        inorder(node->left);
        cout << node->data << " ";
        inorder(node->right);
    }
    
public:
    BST() : root(nullptr) {}
    
    void insert(int data) {
        root = insert(root, data);
    }
    
    bool search(int data) {
        return search(root, data);
    }
    
    void display() {
        inorder(root);
        cout << endl;
    }
};

int main() {
    BST tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.display();
    return 0;
}`;

  const pythonCode = `class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, data):
        if not self.root:
            self.root = Node(data)
        else:
            self._insert_recursive(self.root, data)
    
    def _insert_recursive(self, node, data):
        if data < node.data:
            if node.left is None:
                node.left = Node(data)
            else:
                self._insert_recursive(node.left, data)
        elif data > node.data:
            if node.right is None:
                node.right = Node(data)
            else:
                self._insert_recursive(node.right, data)
    
    def search(self, data):
        return self._search_recursive(self.root, data)
    
    def _search_recursive(self, node, data):
        if node is None:
            return False
        if node.data == data:
            return True
        if data < node.data:
            return self._search_recursive(node.left, data)
        return self._search_recursive(node.right, data)
    
    def inorder(self, node=None):
        if node is None:
            node = self.root
        if node:
            self.inorder(node.left)
            print(node.data, end=" ")
            self.inorder(node.right)

# Uso
tree = BST()
tree.insert(50)
tree.insert(30)
tree.insert(70)
tree.insert(20)
tree.insert(40)
tree.inorder()`;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="algo-container">
      <h2 className="section-title">Árbol Binario de Búsqueda (BST)</h2>
      
      <div className="explanation-section">
        <h3>¿Qué es un BST?</h3>
        <p>
          Un Árbol Binario de Búsqueda es una estructura de datos jerárquica donde cada nodo 
          tiene como máximo dos hijos. Para cada nodo, todos los valores en el subárbol izquierdo 
          son menores que el valor del nodo, y todos los valores en el subárbol derecho son mayores.
        </p>
        <p>
          <strong>Complejidad temporal:</strong> Búsqueda/Inserción/Eliminación: O(log n) en promedio, 
          O(n) en el peor caso (árbol degenerado). <strong>Espacio:</strong> O(n).
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
        />
        <button className="btn btn-primary" onClick={addNode}>
          Insertar Nodo
        </button>
        <button className="btn btn-success" onClick={generateRandom}>
          Generar Aleatorio
        </button>
        <button className="btn btn-secondary" onClick={clearTree}>
          Limpiar
        </button>
      </div>

      <div className="visualization-area">
        {!tree ? (
          <div className="empty-message">Árbol vacío - Inserta nodos para visualizar</div>
        ) : (
          <svg width="800" height="400" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
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
