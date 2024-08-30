import {
  Duplicate,
  useDuplicatesContext,
} from "@/context/duplicates/DuplicatesContext";
import { bytesToHumanReadable } from "@/lib/humanize";
import React from "react";
import { List, AutoSizer } from "react-virtualized"; // Import AutoSizer

const ROW_HEIGHT = 25; // Height of each row in pixels

const Header = ({ accountForScrollBar }: { accountForScrollBar?: boolean }) => {
  const scrollClass = accountForScrollBar ? " pr-[20px]" : "";

  return (
    <div
      className={
        "grid grid-cols-12 max-w-full border-b border-t border-gray-200" +
        scrollClass
      }
    >
      <div className="col-span-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap"></div>
      <div className="col-span-3 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        File name
      </div>
      <div className="col-span-6 overflow-hidden pl-2 text-ellipsis whitespace-nowrap border-x border-gray-200">
        File path
      </div>
      <div className="col-span-2 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        Size
      </div>
    </div>
  );
};

interface DuplicateRowProps {
  index?: number;
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
  color = "bg-violet-500",
}: DuplicateRowProps) => {
  return (
    <div
      className={
        "grid grid-cols-12 max-w-full border-gray-200 " +
        (borderTop ? "border-t " : "") +
        (borderBottom ? "border-b " : "")
      }
    >
      <div className="col-span-1 overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="w-full flex h-full items-center">
          <span className={" rounded-full w-3 h-3 p-1 mx-auto " + color} />
        </div>
      </div>
      <div className="col-span-3 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {duplicate.name}
      </div>
      <div className="col-span-6 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {duplicate.path}
      </div>
      <div className="col-span-2 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
        {bytesToHumanReadable(duplicate.size)}
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
    style: React.CSSProperties;
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
    <div className="w-full flex-auto flex flex-col">
      <Header accountForScrollBar={duplicates.length > ROW_HEIGHT} />
      <div className="flex-auto">
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width} // Auto-width
              height={height} // Auto-height
              rowCount={duplicates.length} // Number of rows to render
              rowHeight={ROW_HEIGHT} // Height of each row
              rowRenderer={rowRenderer} // The row renderer function
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default DuplicatesList;
