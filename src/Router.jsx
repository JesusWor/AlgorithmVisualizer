import { Routes, Route } from "react-router-dom";
import App from "./App"; // tu página principal
import AStar from "./components/algorithms/astar";
import IDAStar from "./components/algorithms/idastar";
import MeetInMiddle from "./components/algorithms/mitm";
// import TopologicalSort from "./components/algorithms/topologicalsort
import HillClimbing from "./components/algorithms/hill_climbing";
import SimulatedAnnealing from "./components/algorithms/simulated_annealing";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/algorithms/astar" element={<AStar />} />
      <Route path="/algorithms/idastar" element={<IDAStar />} />
      <Route path="/algorithms/mitm" element={<MeetInMiddle />} />
      {/* <Route path="/algorithms/topologicalsort" element={<TopologicalSort />} /> */}
      <Route path="/algorithms/hill_climbing" element={<HillClimbing />} />
      <Route path="/algorithms/simulated_annealing" element={<SimulatedAnnealing />} />
    </Routes>
  );
}
