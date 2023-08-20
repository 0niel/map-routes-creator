import { create } from "zustand"
import { MapConfig } from "../figma-map-config"
import { dia } from "jointjs"
import { createGraph, createPaper } from "../joint-utils"

interface JointCanvasStore {
    graph: dia.Graph,
    paper: dia.Paper | null,
    setGraph: (graph: dia.Graph) => void,
    setPaper: (paper: dia.Paper) => void,

}

export const useJointCanvasStore = create<JointCanvasStore>((set) => ({
    graph: createGraph(),
    paper: null,
    setGraph: (graph) => set({ graph }),
    setPaper: (paper) => set({ paper }),
}))