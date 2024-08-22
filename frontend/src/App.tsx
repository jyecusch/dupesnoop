// import wailsLogo from './assets/wails.png'
import "./App.css";
import Header from "./components/Header";
import Button from "./components/Button";
import { FindDuplicates } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime";
import { useEffect, useState } from "react";
import FileBrowser from "./components/FileBrowser";
import ProgressBar from "./components/ProgressBar";
import Table from "./components/Table";

function percentage(value: number, total: number) {
  const result = Math.floor((value / total) * 100);

  if (isNaN(result)) {
    return 0;
  }

  return result;
}

interface ProgressUpdate {
  processed: number;
  total: number;
  current: string;
  status: string;
}

const truncate = (str: string, n: number) =>
  str.length > n ? str.substr(0, n - 1) + "..." : str;


const updateToMessage = (update: ProgressUpdate) => {
  if (update.status === "done") {
    return "Done";
  }
  if (update.status === "error") {
    return "Error";
  }
  if (update.status === "counting") {
    return `Finding files, found ${update.total}`;
  }
  if (update.status === "processing") {
    return `Detecting duplicates ${update.processed}/${update.total}`;
  }
  return `${update.current} (${update.processed}/${update.total})`;
};

function App() {
  const [selectedDir, setSelectedDir] = useState<string | undefined>(undefined);
  const [foundDuplicates, setFoundDuplicates] = useState<
    Awaited<ReturnType<typeof FindDuplicates>> | undefined
  >(undefined);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressUpdate>({
    processed: 0,
    total: 0,
    current: "",
    status: "",
  });
  useEffect(() => {
    EventsOn("progress", (p) => {
      setProgress(p);
      setMessage(updateToMessage(p));
    });

    EventsOn("duplicate", (dupeKey, dupeVals) => {
      setFoundDuplicates((previous) => ({
        ...(previous || {}),
        [dupeKey]: dupeVals,
      }));
    });
  }, []);

  const dupes = async (path: string) => {
    if (loading) {
      return;
    }
    console.log("Finding duplicates in", path);

    if (!path) {
      setError("Please select a folder");
      console.log("Please select a folder");
      return;
    }

    try {
      setError(undefined);
      setLoading(true);
      setFoundDuplicates({});
      const found = await FindDuplicates(path);
      setFoundDuplicates(found);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  const listDuplicates = () => {
    if (foundDuplicates) {
      const keys = Object.keys(foundDuplicates);

      if (keys.length === 0 && progress.status === "done") {
        return <div>No duplicates found</div>;
      }

      return (
        <Table
          data={{
            headings: ["Name", "Path", "Size", "Controls"],
            rows: Object.values(foundDuplicates).reduce((acc, dupe) => {
              return [
                ...acc,
                ...dupe.map((file) => [file.name, file.path, file.size, <Button variant="link">delete</Button>]),
              ];
            }, [] as React.ReactNode[]),
          }}
        />
      );
    }
  };

  const setSelected = (path: string) => {
    setError(undefined);
    setSelectedDir(path);
  };

  return (
    <div className="min-h-screen w-full px-10 bg-white flex flex-col place-items-center justify-items-center py-8">
      <Header title="Pete's DupeSnoop"></Header>
      <div className="w-full flex px-5 flex-col gap-3 pt-10">
        <FileBrowser value={selectedDir} onSelected={setSelected} />
        <div>
          <Button onClick={() => dupes(selectedDir || "")}>
            Find duplicates
          </Button>
        </div>
        {progress && progress.status && progress.status !== "done" && (
          <ProgressBar
            percentage={percentage(progress.processed, progress.total)}
            // stages={["Stage 1", "Stage 2", "Stage 3"]}
            message={message}
          />
        )}
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex flex-col">
          {foundDuplicates && listDuplicates()}
        </div>
      </div>
    </div>
  );
}

export default App;
