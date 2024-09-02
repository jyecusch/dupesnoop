import "./App.css";
import DuplicatesFinder from "@/screens/DuplicatesFinder";
import { DuplicatesProvider } from "@/context/duplicates/DuplicatesContext";

function App() {
  return (
    <DuplicatesProvider>
      <DuplicatesFinder />
    </DuplicatesProvider>
  );
}

export default App;
