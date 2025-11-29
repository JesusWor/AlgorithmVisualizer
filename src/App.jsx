import { useState } from 'react';
import './styles/globals.css';
import './styles/App.css';
import { Home } from './components/Home';
import { LinkedList } from './components/LinkedList';
import { BinarySearchTree } from './components/BinarySearchTree';
import { SortingAlgorithms } from './components/SortingAlgorithms';
import { AStarPathfinding } from './components/AStarPathfinding';
import { Backtracking } from './components/Backtracking';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { SimulatedAnnealing } from './components/SimulatedAnnealing';
import { MeetInTheMiddle } from './components/MeetInTheMiddle';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: '🏠 Inicio' },
    { id: 'linkedlist', label: 'Lista Enlazada' },
    { id: 'bst', label: 'BST / AVL' },
    { id: 'sorting', label: 'Ordenamiento' },
    { id: 'astar', label: 'A* / IDA*' },
    { id: 'backtracking', label: 'Backtracking' },
    { id: 'mitm', label: 'Meet in Middle' },
    { id: 'annealing', label: 'Simulated Annealing' },
    { id: 'comparison', label: 'Comparación' },
  ];

  const handleSelectAlgorithm = (algorithmId) => {
    // Mapear IDs de la página home a los IDs de tabs
    const mappings = {
      'mergesort': 'sorting',
      'quicksort': 'sorting',
      'bubblesort': 'sorting',
      'binarysearch': 'sorting',
      'sequential': 'sorting',
      'ida': 'astar',
      'avl': 'bst',
      'backtracking-bitmask': 'backtracking',
      'hillclimbing': 'annealing',
      'voronoi': 'comparison'
    };

    const targetTab = mappings[algorithmId] || algorithmId;
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      case 'linkedlist':
        return <LinkedList />;
      case 'bst':
        return <BinarySearchTree />;
      case 'sorting':
        return <SortingAlgorithms />;
      case 'astar':
        return <AStarPathfinding />;
      case 'backtracking':
        return <Backtracking />;
      case 'mitm':
        return <MeetInTheMiddle />;
      case 'annealing':
        return <SimulatedAnnealing />;
      case 'comparison':
        return <AlgorithmComparison />;
      default:
        return <Home onSelectAlgorithm={handleSelectAlgorithm} />;
    }
  };

  return (
    <div className="app-container">
      {activeTab !== 'home' && (
        <>
          <header className="header">
            <div className="header-content">
              <h1>AlgoVisual</h1>
              <p>Visualizador de Estructuras de Datos y Algoritmos</p>
            </div>
          </header>

          <nav className="nav-container">
            <div className="nav-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}

      <main className={activeTab === 'home' ? '' : 'main-content'}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
