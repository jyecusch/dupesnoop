import {
  useDispatch,
  useDuplicatesContext,
} from "@/context/duplicates/DuplicatesContext";
import FileBrowser from "../FileBrowser";

function DuplicateFilesBrowser() {
  const ctx = useDuplicatesContext();
  const dispatch = useDispatch();

  return (
    <FileBrowser
      value={ctx?.path}
      onSelected={(path) =>
        dispatch({
          type: "change_path",
          path,
        })
      }
    />
  );
}

export default DuplicateFilesBrowser;
