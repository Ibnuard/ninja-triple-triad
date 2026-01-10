import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TRANSLATIONS } from "../lib/translations";

export type Language = "en" | "id";

interface SettingsStore {
  language: Language;
  showFPS: boolean;
  showBoardAnimation: boolean;
  setLanguage: (lang: Language) => void;
  toggleFPS: () => void;
  toggleBoardAnimation: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: "en",
      showFPS: false,
      showBoardAnimation: true,
      setLanguage: (lang) => set({ language: lang }),
      toggleFPS: () => set((state) => ({ showFPS: !state.showFPS })),
      toggleBoardAnimation: () =>
        set((state) => ({ showBoardAnimation: !state.showBoardAnimation })),
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
