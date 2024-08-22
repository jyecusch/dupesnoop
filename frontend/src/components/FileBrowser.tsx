import { useState } from "react";
import Input from "./Input";
import { SelectDirectory } from "../../wailsjs/go/main/App";

interface FileBrowserProps {
  value?: string;
  onSelected?: (path: string) => void;
}

export default function FileBrowser({
  value,
  onSelected = () => {},
}: FileBrowserProps) {
  const select = async () => {
    try {
      const folderPath = await SelectDirectory();
      onSelected(folderPath);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Input label="Select folder" onClick={select} value={value} />
    </div>
  );
}
