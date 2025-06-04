import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const platformOptions = [
  { value: "web", label: "Web Application" },
  { value: "mobile", label: "Mobile Application" },
  { value: "desktop", label: "Desktop Application" },
];

export const languageOptions = {
  web: [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "php", label: "PHP" },
    { value: "python", label: "Python" },
  ],
  mobile: [
    { value: "swift", label: "Swift (iOS)" },
    { value: "kotlin", label: "Kotlin (Android)" },
    { value: "reactnative", label: "React Native" },
    { value: "flutter", label: "Flutter" },
    { value: "ionic", label: "Ionic" },
  ],
  desktop: [
    { value: "electron", label: "Electron" },
    { value: "java", label: "Java" },
    { value: "qt", label: "Qt" },
  ],
};

export type UserRole = "viewer" | "editor" | "developer" | "admin";

export type Platform = "web" | "mobile" | "desktop";

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  collaborators?: { uid: string; role: UserRole }[];
}; 