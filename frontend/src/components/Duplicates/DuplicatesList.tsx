import {
  Duplicate,
  useDispatch,
  useDuplicatesContext,
} from "@/context/duplicates/DuplicatesContext";
import { bytesToHumanReadable } from "@/lib/humanize";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { CSSProperties, useState } from "react";
import { createPortal } from "react-dom";
import { List, AutoSizer } from "react-virtualized";
import Button from "../Button";
import Checkbox from "../Checkbox";

const ROW_HEIGHT = 25; // Height of each row in pixels

const SortIcon = ({ direction }: { direction: "asc" | "desc" }) => {
  const className = "w-4 h-4 m-auto";

  return direction === "asc" ? (
    <ChevronDownIcon className={className} />
  ) : (
    <ChevronUpIcon className={className} />
  );
};

const Header = () => {
  const { duplicates, sortOption, sortDirection } = useDuplicatesContext();
  const dispatch = useDispatch();

  const allChecked =
    duplicates.length > 0 && !duplicates.some((d) => !d.selected);

  return (
    <div
      className={
        "grid grid-cols-12 max-w-full border-b border-gray-200 text-slate-400 text-sm py-1"
      }
    >
      <div className="col-span-1 overflow-hidden text-ellipsis whitespace-nowrap border-r flex items-center">
        <Checkbox
          className="mx-auto bg-red-400"
          id="all-check"
          name="all-check"
          checked={allChecked}
          onChange={(e) => {
            dispatch({
              type: allChecked ? "deselect_all" : "select_all",
            });
          }}
        />
      </div>
      <div className="col-span-1 overflow-hidden text-ellipsis whitespace-nowrap border-r"></div>
      <div className="col-span-4 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        File name
      </div>
      <div className="col-span-4 overflow-hidden pl-2 text-ellipsis whitespace-nowrap border-x border-gray-200">
        File path
      </div>
      <div className="col-span-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap border-r">
        <div className="flex align-middle cursor-pointer" onClick={() => dispatch({ type: "sort", option: "size" })}>
          Size{" "}
          {sortOption === "size" && (
            <SortIcon direction={sortDirection || "asc"} />
          )}
        </div>
      </div>
      <div className="col-span-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap text-center"></div>
    </div>
  );
};

interface DeleteModelProps {
  onClose: () => void;
  duplicate: Duplicate;
}

const DeleteModel = ({ onClose, duplicate }: DeleteModelProps) => {
  const dispatch = useDispatch();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <div className="text-md text-center">
          Are you sure you want to delete{" "}
          <span className="text-indigo-600">{duplicate.path}</span>?
        </div>
        <div className="flex justify-center mt-4 gap-2">
          <Button
            elevated
            color="secondary"
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            elevated
            color="primary"
            onClick={() => {
              onClose();
              console.log("Deleting", duplicate.path);
              dispatch({
                type: "delete_duplicate",
                paths: [duplicate.path],
              });
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

interface DuplicateRowProps {
  index: number;
  duplicate: Duplicate;
  borderTop?: boolean;
  borderBottom?: boolean;
  color?: string;
}

const DuplicateRow = ({
  index,
  duplicate,
  borderTop = false,
  borderBottom = false,
  color,
}: DuplicateRowProps) => {
  const dispatch = useDispatch();

  const [deletePath, setDeletePath] = useState("");

  if (duplicate.deleting) {
    color = "bg-red-500";
  }

  return (
    <div
      className={
        "grid items-center grid-cols-12 w-full border-gray-200 text-sm h-full " +
        (borderTop ? "border-t " : "") +
        (borderBottom ? "border-b " : "") +
        (duplicate.deleting ? "bg-gray-200 line-through " : "")
      }
    >
      <div className="col-span-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
        <Checkbox
          className="mx-auto bg-red-400"
          id={duplicate.path}
          name={duplicate.path}
          checked={duplicate.selected}
          onChange={(e) => {
            dispatch({
              type: "toggle_duplicate",
              index: index,
            });
          }}
        />
      </div>
      <div className="col-span-1 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="relative flex h-3 w-3 mx-auto">
          {duplicate.deleting && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span
            className={"relative inline-flex rounded-full h-3 w-3 " + color}
          ></span>
        </span>
      </div>
      <div className="col-span-4 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {duplicate.name}
      </div>
      <div className="col-span-4 overflow-hidden pl-2 text-indigo-600 cursor-pointer text-ellipsis whitespace-nowrap hover:underline">
        {duplicate.path}
      </div>
      <div className="col-span-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {bytesToHumanReadable(duplicate.size)}
      </div>
      <div className="col-span-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {/* TODO: disable delete button while deleting */}
        <TrashIcon
          className="w-4 h-4 mx-auto text-red-400 hover:text-red-600 cursor-pointer"
          onClick={() => setDeletePath(duplicate.path)}
        />
        {deletePath &&
          createPortal(
            <DeleteModel
              duplicate={duplicate}
              onClose={() => setDeletePath("")}
            />,
            document.body
          )}
      </div>
    </div>
  );
};

const DuplicatesList = () => {
  const { duplicates } = useDuplicatesContext();

  const rows = duplicates.reduce((acc, dupe, ix) => {
    const previousHash = acc[acc.length - 1]?.hash;
    const previousColor = acc[acc.length - 1]?.color || "bg-indigo-500";

    const sameHash = dupe.hash === previousHash;

    const color = sameHash
      ? previousColor
      : previousColor === "bg-indigo-500"
      ? "bg-emerald-500"
      : "bg-indigo-500";

    return [
      ...acc,
      {
        hasBorder: !sameHash && ix > 0,
        color: color,
        ...dupe,
      },
    ];
  }, [] as any);

  // Row renderer function for react-virtualized
  const rowRenderer = ({
    key,
    index,
    style,
  }: {
    key: string;
    index: number;
    style: CSSProperties;
  }) => {
    const duplicate = rows[index]; // Access the duplicate at the given index

    return (
      <div key={key} style={style}>
        {duplicate && (
          <DuplicateRow
            key={key}
            index={index}
            duplicate={duplicate}
            borderTop={duplicate.hasBorder}
            borderBottom={index === duplicates.length - 1}
            color={duplicate.color}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex-auto flex flex-col bg-white border border-gray-200 rounded">
      <Header />
      <div className="flex-auto">
        <AutoSizer>
          {({ height, width }) => {
            return (
              <List
                width={width} // Auto-width
                height={height} // Auto-height
                rowCount={duplicates.length} // Number of rows to render
                rowHeight={ROW_HEIGHT} // Height of each row
                rowRenderer={rowRenderer} // The row renderer function
              />
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
};

export default DuplicatesList;
