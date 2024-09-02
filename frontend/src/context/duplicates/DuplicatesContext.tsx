import {
  deleteDuplicates,
  findDuplicates,
  listenForProgress,
  ProgressUpdate,
} from "@/lib/api";
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
  deleting?: boolean;
  selected?: boolean;
};

export type SortOption = "name" | "size" | "hash";
export type SortDirection = "asc" | "desc";

// Define the type for the initial state
export interface DuplicatesState {
  path?: string;
  finding: boolean;
  deleting: boolean;
  progress?: ProgressUpdate;
  found: boolean;
  error?: string;
  duplicates: Duplicate[];

  sortOption?: SortOption;
  sortDirection?: SortDirection;
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

export type Action =
  | { type: "change_path"; path: string }
  | { type: "find_duplicates" }
  | { type: "find_progress"; progress: ProgressUpdate }
  | { type: "toggle_duplicate"; index: number }
  | { type: "select_all" }
  | { type: "deselect_all" }
  | { type: "delete_duplicate"; paths: string[] }
  | { type: "deleted_duplicate"; paths: string[] }
  | { type: "found_duplicates"; duplicates: Duplicate[] }
  | { type: "find_duplicates_error"; error: string }
  | { type: "sort"; option: SortOption; direction?: SortDirection }
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
        sortOption: undefined,
        sortDirection: undefined,
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
    case "sort": {
      if (action.direction === undefined) {
        if (state.sortOption === action.option) {
          action.direction = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          action.direction = "asc";
        }
      }

      // TODO: Move to server if paging is implemented
      return {
        ...state,
        sortOption: action.option,
        sortDirection: action.direction,
        duplicates: state.duplicates.sort((a, b) => {
          if (action.direction === "desc") {
            const temp = a;
            a = b;
            b = temp;
          }

          let compare = 0;
          if (action.option === "name") {
            compare = a.name.localeCompare(b.name);
          } else if (action.option === "size") {
            compare = a.size - b.size;
          }

          // If the values are the same, sort by hash to maintain grouping
          if (compare === 0 || action.option === "hash") {
            compare = a.hash.localeCompare(b.hash);
          }
          return compare;
        }),
      };
    }
    case "toggle_duplicate": {
      return {
        ...state,
        duplicates: [
          ...state.duplicates.slice(0, action.index),
          {
            ...state.duplicates[action.index],
            selected: !state.duplicates[action.index].selected,
          },
          ...state.duplicates.slice(action.index + 1),
        ],
      };
    }
    case "select_all": {
      return {
        ...state,
        duplicates: state.duplicates.map((d) => ({ ...d, selected: true })),
      };
    }
    case "deselect_all": {
      return {
        ...state,
        duplicates: state.duplicates.map((d) => ({ ...d, selected: false })),
      };
    }
    case "delete_duplicate": {
      if (state.duplicates.length === 0) {
        return state;
      }
      if (!action.paths || action.paths.length === 0) {
        return state;
      }

      return {
        ...state,
        deleting: true,
        duplicates: state.duplicates.map((t, i) =>
          action.paths.includes(t.path) ? { ...t, deleting: true } : t
        ),
      };
    }
    case "deleted_duplicate": {
      return {
        ...state,
        deleting: false,
        duplicates: state.duplicates.filter(
          (t) => !action.paths.includes(t.path)
        ),
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
  deleting: false,
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

async function handleDeleteDuplicates(
  dispatch: Dispatch<Action>,
  paths: string[]
) {
  try {
    await deleteDuplicates(paths);
    dispatch({ type: "deleted_duplicate", paths });
  } catch (error: any) {
    console.error("Error deleting duplicates", error);
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

  const { finding, path, deleting } = duplicates;

  useEffect(() => {
    if (finding && path) {
      handleFindDuplicates(dispatch, path);
    }
  }, [finding, path]);

  useEffect(() => {
    const filesToDelete = duplicates.duplicates.filter((d) => d.deleting);
    if (duplicates.deleting && filesToDelete.length > 0) {
      handleDeleteDuplicates(
        dispatch,
        filesToDelete.map((d) => d.path)
      );
    }
  }, [deleting]);

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
