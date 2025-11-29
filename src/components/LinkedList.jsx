import { useState } from 'react';
import '../styles/common.css';
import '../styles/linkedlist.css';

export function LinkedList() {
  const [list, setList] = useState([10, 20, 30, 40]);
  const [inputValue, setInputValue] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  const addNode = () => {
    if (inputValue.trim() === '') return;
    setList([...list, parseInt(inputValue) || 0]);
    setInputValue('');
  };

  const removeNode = () => {
    if (list.length > 0) {
      setList(list.slice(0, -1));
    }
  };

  const clearList = () => {
    setList([]);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const cppCode = `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
    
public:
    LinkedList() : head(nullptr) {}
    
    // Insertar al final
    void append(int data) {
        Node* newNode = new Node(data);
        if (!head) {
            head = newNode;
            return;
        }
        Node* temp = head;
        while (temp->next) {
            temp = temp->next;
        }
        temp->next = newNode;
    }
    
    // Insertar al inicio
    void prepend(int data) {
        Node* newNode = new Node(data);
        newNode->next = head;
        head = newNode;
    }
    
    // Eliminar nodo
    void deleteNode(int data) {
        if (!head) return;
        
        if (head->data == data) {
            Node* temp = head;
            head = head->next;
            delete temp;
            return;
        }
        
        Node* current = head;
        while (current->next && current->next->data != data) {
            current = current->next;
        }
        
        if (current->next) {
            Node* temp = current->next;
            current->next = current->next->next;
            delete temp;
        }
    }
    
    // Mostrar lista
    void display() {
        Node* temp = head;
        while (temp) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        cout << "NULL" << endl;
    }
};

int main() {
    LinkedList ll;
    ll.append(10);
    ll.append(20);
    ll.append(30);
    ll.display();
    return 0;
}`;

  const pythonCode = `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    # Insertar al final
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    # Insertar al inicio
    def prepend(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    # Eliminar nodo
    def delete_node(self, data):
        if not self.head:
            return
        
        if self.head.data == data:
            self.head = self.head.next
            return
        
        current = self.head
        while current.next and current.next.data != data:
            current = current.next
        
        if current.next:
            current.next = current.next.next
    
    # Mostrar lista
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements) + " -> NULL")

# Uso
ll = LinkedList()
ll.append(10)
ll.append(20)
ll.append(30)
ll.display()`;

  return (
    <div className="algo-container">
      <h2 className="section-title">Lista Enlazada (Linked List)</h2>
      
      <div className="explanation-section">
        <h3>¿Qué es una Lista Enlazada?</h3>
        <p>
          Una lista enlazada es una estructura de datos lineal donde cada elemento (nodo) 
          contiene un valor y una referencia (puntero) al siguiente nodo en la secuencia. 
          A diferencia de los arrays, los elementos no se almacenan en posiciones contiguas 
          de memoria, lo que permite inserciones y eliminaciones eficientes.
        </p>
        <p>
          <strong>Complejidad temporal:</strong> Inserción/Eliminación al inicio: O(1), 
          Búsqueda/Acceso: O(n), Inserción/Eliminación al final: O(n) sin puntero tail.
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
          Agregar Nodo
        </button>
        <button className="btn btn-danger" onClick={removeNode}>
          Eliminar Último
        </button>
        <button className="btn btn-secondary" onClick={clearList}>
          Limpiar
        </button>
      </div>

      <div className="visualization-area">
        <div className="linked-list-container">
          {list.length === 0 ? (
            <div className="empty-message">Lista vacía - Agrega nodos para visualizar</div>
          ) : (
            <>
              <div className="head-label">HEAD</div>
              <div className="nodes-wrapper">
                {list.map((value, index) => (
                  <div key={index} className="node-group">
                    <div className="node">
                      <div className="node-data">{value}</div>
                      <div className="node-pointer">→</div>
                    </div>
                    {index < list.length - 1 && <div className="node-connector"></div>}
                  </div>
                ))}
                <div className="null-node">NULL</div>
              </div>
            </>
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
