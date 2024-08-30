import { FindDuplicates } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime";

export const findDuplicates = async (path: string) => {
  return FindDuplicates(path);
}

export interface ProgressUpdate {
  processed: number;
  total: number;
  current: string;
  status: string;
}

export const listenForProgress = (callback: (progress: ProgressUpdate) => void) => {
  EventsOn("progress", callback);
}