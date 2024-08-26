// import wailsLogo from './assets/wails.png'
import "./App.css";
import Header from "./components/Header";
import Button from "./components/Button";
import { FindDuplicates, GetPage, DeleteFile } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime";
import { useEffect, useState } from "react";
import FileBrowser from "./components/FileBrowser";
import ProgressBar from "./components/ProgressBar";
import Table from "./components/Table";
import PageControls from "./components/PageControls";

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

const PAGE_SIZE = 10;

function App() {
  const [selectedDir, setSelectedDir] = useState<string | undefined>(undefined);
  const [resultsPage, setResultsPage] = useState<
    Awaited<ReturnType<typeof FindDuplicates>> | undefined
  >(undefined);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
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

    // EventsOn("duplicate", (dupeKey, dupeVals) => {
    //   setResultsPage((previous) => ({
    //     ...(previous || {}),
    //     [dupeKey]: dupeVals,
    //   }));
    // });
  }, []);

  const fetchPage = async () => {
    if (selectedDir) {
      const pageData = await GetPage(page, PAGE_SIZE);
      setResultsPage(pageData);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [page]);

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
      setResultsPage(undefined);
      const found = await FindDuplicates(path, 0, PAGE_SIZE);
      setPage(0);
      setResultsPage(found);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  const deleteFile = async (path: string) => {
    await DeleteFile(path);
    await fetchPage();
    // console.log("Deleting file", path);
  };

  const listDuplicates = () => {
    if (resultsPage) {
      const keys = Object.keys(resultsPage);

      if (keys.length === 0 && progress.status === "done") {
        return <div>No duplicates found</div>;
      }

      return (
        <Table
          data={{
            headings: ["", "Name", "Path", "Size", "Controls"],
            rows: Object.values(resultsPage.duplicates).reduce(
              (acc, dupe, ix) => {
                const previousHash = acc[acc.length - 1]?.hash;
                const previousColor = acc[acc.length - 1]?.color || "bg-indigo-500";

                const color = dupe.hash === previousHash ? previousColor : previousColor === "bg-indigo-500" ? "bg-emerald-500" : "bg-indigo-500";

                return [
                  ...acc,
                  {
                    color: color,
                    hash: dupe.hash,
                    className: ix % 2 === 0 ? "bg-gray-50" : "",
                    cells: [
                      <div
                        className={
                          "rounded-sm w-3 h-3 ml-3 " + color
                        }
                      />,
                      <span className="pl-2">{dupe.name}</span>,
                      dupe.path,
                      dupe.humanSize,
                      <Button
                        variant="link"
                        onClick={() => deleteFile(dupe.path)}
                      >
                        delete
                      </Button>,
                    ],
                  },
                ];
              },
              [] as any
            ),
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
        <div className="flex flex-col gap-4">
          {resultsPage && listDuplicates()}
          <div className="flex">
            {resultsPage && resultsPage.total > 0 && (
              <PageControls
                page={page}
                onPageChange={setPage}
                totalPages={resultsPage?.total || 0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
