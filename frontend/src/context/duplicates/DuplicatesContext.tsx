import { findDuplicates, listenForProgress, ProgressUpdate } from "@/lib/api";
import {
  createContext,
  useReducer,
  ReactNode,
  useContext,
  Dispatch,
  useEffect,
} from "react";

// Define the Duplicate type
export type Duplicate = {
  path: string;
  name: string;
  size: number;
  hash: string;
};

// Define the type for the initial state
export interface DuplicatesState {
  path?: string;
  finding: boolean;
  progress?: ProgressUpdate
  found: boolean;
  error?: string;
  duplicates: Duplicate[];
}

// Define context types
type DuplicatesContextType = DuplicatesState;
type DuplicatesDispatchContextType = Dispatch<Action>;

// Create the context
export const DuplicatesContext = createContext<
  DuplicatesContextType | undefined
>(undefined);
export const DuplicatesDispatchContext = createContext<
  DuplicatesDispatchContextType | undefined
>(undefined);

// Define possible action types
export type Action =
  | { type: "change_path"; path: string }
  | { type: "find_duplicates" }
  | { type: "find_progress"; progress: ProgressUpdate }
  | { type: "found_duplicates"; duplicates: Duplicate[] }
  | { type: "find_duplicates_error"; error: string }
  | { type: "delete"; path: string };

// Reducer function with type annotations
function duplicatesReducer(
  state: DuplicatesState,
  action: Action
): DuplicatesState {
  switch (action.type) {
    case "change_path": {
      return {
        ...state,
        path: action.path,
        duplicates: [],
      };
    }
    case "find_duplicates": {
      if (state.finding) {
        return state;
      }
      console.log("Finding duplicates in", state.path);
      if (!state.path) {
        console.log("Please select a directory");
        return {
          ...state,
          finding: false,
          error: "Please select a directory",
        };
      }

      return {
        ...state,
        error: undefined,
        finding: true,
      };
    }
    case "find_progress": {
      return {
        ...state,
        progress: action.progress,
      };
    }
    case "find_duplicates_error": {
      return {
        ...state,
        finding: false,
        error: action.error,
      };
    }
    case "found_duplicates": {
      return {
        ...state,
        finding: false,
        found: true,
        duplicates: action.duplicates,
      };
    }
    case "delete": {
      if (state.finding) {
        return state;
      }
      // TODO: call server to delete duplicate
      return {
        ...state,
        duplicates: state.duplicates.filter((t) => t.path !== action.path),
      };
    }
    default: {
      throw new Error("Unknown action: " + (action as any).type);
    }
  }
}

// Initial duplicates
const initialDuplicates: DuplicatesState = {
  finding: false,
  found: false,
  duplicates: [
    // {
    //   path: "this/is/a/long/ish/name.jpg",
    //   name: "name.jpg",
    //   size: 10,
    //   hash: "hash",
    // },
    // { path: "path2", name: "name2", size: 10, hash: "hash" },
  ],
};

async function handleFindDuplicates(dispatch: Dispatch<Action>, path: string) {
  try {
    const dupes = await findDuplicates(path);
    dispatch({ type: "found_duplicates", duplicates: dupes });
  } catch (error: any) {
    dispatch({ type: "find_duplicates_error", error: error.message });
  }
}

// Define props type for the provider
type DuplicatesProviderProps = {
  children: ReactNode;
};

// DuplicatesProvider component with types
export function DuplicatesProvider({ children }: DuplicatesProviderProps) {
  const [duplicates, dispatch] = useReducer(
    duplicatesReducer,
    initialDuplicates
  );

  const { finding, path } = duplicates;

  useEffect(() => {
    if (finding && path) {
      handleFindDuplicates(dispatch, path);
    }
  }, [finding, path]);

  useEffect(() => {
    listenForProgress((progress) => {
      dispatch({ type: "find_progress", progress });
    });
  }, []);

  return (
    <DuplicatesContext.Provider value={duplicates}>
      <DuplicatesDispatchContext.Provider value={dispatch}>
        {children}
      </DuplicatesDispatchContext.Provider>
    </DuplicatesContext.Provider>
  );
}

export function useDuplicatesContext() {
  const context = useContext(DuplicatesContext);
  if (context === undefined) {
    throw new Error("useDuplicates must be used within a DuplicatesProvider");
  }
  return context;
}

export function useDispatch() {
  const context = useContext(DuplicatesDispatchContext);
  if (context === undefined) {
    throw new Error("useDispatch must be used within a DuplicatesProvider");
  }
  return context;
}
