import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TRANSLATIONS } from "../lib/translations";

export type Language = "en" | "id";

interface SettingsStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "triple-triad-settings",
    }
  )
);

// Helper hook for translations
export const useTranslation = () => {
  const language = useSettingsStore((state) => state.language);
  return TRANSLATIONS[language];
};
