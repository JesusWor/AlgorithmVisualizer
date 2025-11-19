import { useState, useEffect } from "react";

export default function HillClimbing() {
  const [currentValue, setCurrentValue] = useState(0);
  const [bestValue, setBestValue] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
}