import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Size = number

interface SizeTextStore {
    size: Size
    setSize: (newSize: Size) => void
    loadSize: () => Promise<void>
}

const useSizeText = create<SizeTextStore>((set) => ({
    size: 14,

    setSize: async (newSize: Size) => {
        set({ size: newSize })
        await AsyncStorage.setItem("size", newSize.toString())
    },

    loadSize: async () => {
        const savedSize = await AsyncStorage.getItem("size")
        if (savedSize) {
            set({ size: parseInt(savedSize) })
        }
    }
    
}))

export default useSizeText