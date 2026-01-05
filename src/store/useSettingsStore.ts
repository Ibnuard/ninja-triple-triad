import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "id";

interface SettingsStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: "en", // Default to English
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "triple-triad-settings", // Persist to localStorage
    }
  )
);
