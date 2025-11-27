import { Search, Network, Shuffle } from "lucide-react"

export const algorithms = [
  {
    id: "astar",
    title: "A* (A-Star)",
    description: "Algoritmo de búsqueda de camino más corto que utiliza heurísticas para encontrar la ruta óptima",
    category: "Búsqueda",
    icon: Search,
    color: "#3B82F6", // blue-500
    href: "/algorithms/astar",
  },
  {
    id: "idastar",
    title: "IDA* (Iterative Deepening A*)",
    description: "Variante de A* que utiliza búsqueda en profundidad iterativa para optimizar el uso de memoria",
    category: "Búsqueda",
    icon: Search,
    color: "#22C55E", // green-500
    href: "/algorithms/idastar",
  },
  {
    id: "topological",
    title: "Topological Sort",
    description: "Algoritmo de ordenamiento para grafos dirigidos acíclicos (DAG)",
    category: "Ordenamiento",
    icon: Network,
    color: "#F97316", // orange-500
    href: "/algorithms/topological",
  },
  {
    id: "mitm",
    title: "Meet in the Middle",
    description: "Técnica de optimización que divide el problema en dos partes para reducir la complejidad",
    category: "Optimización",
    icon: Shuffle,
    color: "#A855F7", // purple-500
    href: "/algorithms/mitm",
  },
  {
    id: "backtracking_pruning",
    title: "Branch & Bound con Poda",
    description: "Algoritmo de B&B que utiliza técnicas de poda para reducir el espacio de búsqueda",
    category: "Optimización",
    icon: Shuffle,
    color: "#10B981", // emerald-500
    href: "/algorithms/branchPruning",
  },
  {
    id: "backtracking_bitmask",
    title: "Backtracking con Bitmask",
    description: "Algoritmo de backtracking optimizado utilizando máscaras de bits para representar el estado del tablero",
    category: "Búsqueda",
    icon: Shuffle,
    color: "#F59E0B", // amber-500
    href: "/algorithms/backtrackingBitmask",
  },
]

export const IterativeImprovementAlgorithms = [
  {
    id: "hill_climbing",
    title: "Hill Climbing",
    description: "Algoritmo de optimización local que busca soluciones mejores mediante movimientos incrementales",
    category: "Optimización",
    icon: Shuffle,
    color: "#EF4444", // red-500
    href: "/algorithms/MejoraIterativa/hill_climbing",
  }
]
