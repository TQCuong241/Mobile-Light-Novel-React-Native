import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Font = string

interface FontStore {
    font: Font
    setFont: (newFont: Font) => void
    loadFont: () => Promise<void>
}

const useFontStore = create<FontStore>((set) => ({
    font: "serif",

    setFont: async (newFont: Font) => {
        set({ font: newFont })
        await AsyncStorage.setItem("font", newFont)
    },

    loadFont: async () => {
        const savedFont = await AsyncStorage.getItem("font")
        if (savedFont) {
            set({ font: savedFont })
        }
    }
    
}))

export default useFontStore
