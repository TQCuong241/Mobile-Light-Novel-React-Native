import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark"; 

interface ThemeStore {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  loadTheme: () => Promise<void>;
}

const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",

  setTheme: async (newTheme: Theme) => {
    set({ theme: newTheme });
    await AsyncStorage.setItem("theme", newTheme);
  },
  
  loadTheme: async () => {
    const savedTheme = await AsyncStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      set({ theme: savedTheme });
    }
  },
}));

export default useThemeStore;
