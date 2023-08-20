import { create } from "zustand"
import { MapConfig } from "../figma-map-config"

export interface StairsRef {
    fromId: string
    toId: string[]
}

interface MapConfigStore {
    config: MapConfig
    setConfig: (config: MapConfig) => void
    editerFloor: number
    setEditerFloor: (floor: number) => void
    stairsRef: StairsRef[]
}

export const useMapConfigStore = create<MapConfigStore>((set) => ({
    config: {
        components: [],
        objects: [],
    } as MapConfig,
    setConfig: (config) => set({ config }),
    editerFloor: 0,
    setEditerFloor: (floor) => set({ editerFloor: floor }),
    stairsRef: [],
}))