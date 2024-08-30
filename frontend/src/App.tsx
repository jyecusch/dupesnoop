import "./App.css";
import DuplicatesFinder from "@/screens/DuplicatesFinder";
import { DuplicatesProvider } from "@/context/duplicates/DuplicatesContext";

interface ProgressUpdate {
  processed: number;
  total: number;
  current: string;
  status: string;
}

function App() {
  return (
    <DuplicatesProvider>
      <DuplicatesFinder />
    </DuplicatesProvider>
  );
}

export default App;
