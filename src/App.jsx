import { useState } from 'react';
import './styles/globals.css';
import './styles/App.css';
import { Home } from './components/Home';
import { LinkedList } from './components/LinkedList';
import { BinarySearchTree } from './components/BinarySearchTree';
import { AVLTree } from './components/AVLTree';
import { SearchAlgorithms } from './components/SearchAlgorithms';
import { SortingAlgorithms } from './components/SortingAlgorithms';
import { AStarGrid } from './components/AStarGrid';
import { IDAStarGrid } from './components/IDAStarGrid';
import { BreadthFirstSearch } from './components/BFS';
import { DepthFirstSearch } from './components/DFS';
import { Dijkstra } from './components/Dijkstra';
import { Backtracking } from './components/Backtracking';
import { BacktrackingBitmask } from './components/BacktrackingBitmask';
import { BranchAndBound } from './components/BranchAndBound';
import { MeetInTheMiddle } from './components/MeetInTheMiddle';
import { SimulatedAnnealing } from './components/SimulatedAnnealing';
import HillClimbing from './components/HillClimbing';
import { VoronoiDiagram } from './components/VoronoiDiagram';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { AdvancedComparison } from './components/AdvancedComparison';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  const tabs = [
    { id: 'home', label: 'Inicio' },
    // Estructuras de datos
    { id: 'linkedlist', label: 'Lista Enlazada' },
    { id: 'bst', label: 'BST' },
    { id: 'avl', label: 'AVL' }, 
    // Algoritmos de busqueda
    { id: 'binarysearch', label: 'Búsqueda Binaria' },
    { id: 'sequential', label: 'Búsqueda Secuencial' },
    // Algoritmos de ordenamiento
    { id: 'mergesort', label: 'Merge sort' },
    { id: 'quicksort', label: 'Quick sort' },
    { id: 'bubblesort', label: 'Bubble sort' },
    // Algoritmos de busqueda en grafos
    { id: 'astar', label: 'A*' },
    { id: 'idastar', label: 'IDA*' },
    { id: 'bfs', label: 'BFS'},
    { id: 'dfs', label: 'DFS'},
    { id: "dijkstra", label: 'Dijkstra'},
    // Algoritmos avanzados
    { id: 'backtracking', label: 'Backtracking' },
    { id: 'backtracking-bitmask', label: 'Backtracking Bitmask' },
    { id: 'branchandbound', label: 'Branch and Bound' },
    { id: 'mitm', label: 'Meet in Middle' },
    { id: 'annealing', label: 'Simulated Annealing' },
    { id: 'hillclimbing', label: 'Hill Climbing' },
    { id: 'voronoi', label: 'Voronoi' },
    // Comparacion
    { id: 'comparison', label: 'Comparación' },
    { id: 'advanced-comparison', label: 'Comparación Avanzada' },
  ];

  const handleSelectAlgorithm = (algorithmId) => {
    const mappings = {
      'mergesort': { tab: 'mergesort', algo: null },
      'quicksort': { tab: 'quicksort', algo: null },
      'bubblesort': { tab: 'bubblesort', algo: null },
      'binarysearch': { tab: 'binarysearch', algo: null },
      'sequential': { tab: 'sequential', algo: null },
      'astar': { tab: 'astar', algo: null },
      'idastar': { tab: 'idastar', algo: null },
      'backtracking-bitmask': { tab: 'backtracking-bitmask', algo: null },
      'annealing': { tab: 'annealing', algo: null },
      'hillclimbing': { tab: 'hillclimbing', algo: null },
      'voronoi': { tab: 'voronoi', algo: null },
      'comparison': { tab: 'comparison', algo: null },
      'advanced-comparison': { tab: 'advanced-comparison', algo: null }
    };

    const mapping = mappings[algorithmId];
    if (mapping) {
      setActiveTab(mapping.tab);
      setSelectedAlgorithm(mapping.algo);
    } else {
      setActiveTab(algorithmId);
      setSelectedAlgorithm(null);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSelectAlgorithm={handleSelectAlgorithm} />
      case 'linkedlist':
        return <LinkedList />
      case 'bst':
        return <BinarySearchTree />
      case 'avl':
        return <AVLTree />
      case 'binarysearch':
        return <SearchAlgorithms initialAlgorithm="binary" />
      case 'sequential':
        return <SearchAlgorithms initialAlgorithm="sequential" />
      case 'mergesort':
        return <SortingAlgorithms initialAlgorithm="merge" />
      case 'quicksort':
        return <SortingAlgorithms initialAlgorithm="quick" />
      case 'bubblesort':
        return <SortingAlgorithms initialAlgorithm="bubble" />
      case 'astar':
        return <AStarGrid />
      case 'idastar':
        return <IDAStarGrid />
      case 'bfs':
        return <BreadthFirstSearch />
      case 'dfs':
        return <DepthFirstSearch />
      case 'dijkstra':
        return <Dijkstra />
      case 'backtracking':
        return <Backtracking />
      case 'backtracking-bitmask':
        return <BacktrackingBitmask />
      case 'branchandbound':
        return <BranchAndBound />
      case 'mitm':
        return <MeetInTheMiddle />
      case 'hillclimbing':
        return <HillClimbing />;
      case 'annealing':
        return <SimulatedAnnealing />
      case 'voronoi':
        return <VoronoiDiagram />
      case 'comparison':
        return <AlgorithmComparison />
      case 'advanced-comparison':
        return <AdvancedComparison />
      default:
        return <Home onSelectAlgorithm={handleSelectAlgorithm} />
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedAlgorithm(null);
                  }}
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