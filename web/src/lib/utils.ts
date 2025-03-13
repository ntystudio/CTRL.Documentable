import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TreeItemConfig } from "../types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleHomeClick = (e: React.MouseEvent, setSelectedClass: (selectedClass: TreeItemConfig | null) => void, navigate: (path: string) => void) => {
  e.preventDefault();
  setSelectedClass(null);
  navigate('/');
};