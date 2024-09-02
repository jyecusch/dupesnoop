import Button from "../components/Button";
import DefaultLayout from "../layouts/DefaultLayout";
import {
  useDispatch,
  useDuplicatesContext,
} from "@/context/duplicates/DuplicatesContext";
import DuplicateList from "@/components/Duplicates/DuplicatesList";
import DuplicateFilesBrowser from "@/components/Duplicates/DuplicatesFileBrowser";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";

interface FooterProps {
  totalDuplicates: number;
}

const Footer = ({ totalDuplicates }: FooterProps) => {
  return (
    <div className=" text-gray-600 text-sm text-right">
      {totalDuplicates} duplicates
    </div>
  );
};

const Duplicates: React.FunctionComponent = () => {
  const ctx = useDuplicatesContext();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);

  const selected = ctx.duplicates.filter((d) => d.selected);

  return (
    <DefaultLayout>
      <div className="w-full h-full flex flex-col gap-3 pt-1 flex-auto overflow-visible">
        <DuplicateFilesBrowser />
        <div className="flex gap-2">
          <Button
            disabled={!ctx.path}
            onClick={() => dispatch({ type: "find_duplicates" })}
          >
            Find duplicates
          </Button>
          <Button
            color="warning"
            disabled={!selected.length}
            onClick={() => setShowConfirm(true)}
          >
            Delete selected
          </Button>
          {showConfirm && (
            <ConfirmDialog
              onCancel={() => setShowConfirm(false)}
              onConfirm={() => {
                setShowConfirm(false);
                dispatch({
                  type: "delete_duplicate",
                  paths: selected.map((d) => d.path),
                });
              }}
            >
              <div className="text-md text-center">
                Are you sure you want to delete <span className="text-indigo-600 font-bold">{selected.length}</span> duplicates?
              </div>
            </ConfirmDialog>
          )}
          <div className="my-auto text-sm">
            {ctx.finding &&
              ctx.progress &&
              `${ctx.progress.processed} of ${ctx.progress.total} files scanned`}
          </div>
        </div>
        {ctx.error && <div className="text-red-500">{ctx.error}</div>}
        {ctx.found && <DuplicateList />}
        {ctx.found && ctx.progress && (
          <Footer totalDuplicates={ctx.duplicates.length} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default Duplicates;
