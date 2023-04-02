import { create } from 'zustand'
import { persist, createJSONStorage } from "zustand/middleware"

const controls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  fish: false,
}

const useStore = create(
  persist(
    (set, get) => ({
      controls,
      setforward: (value) => set((state) => ({ controls: { ...state.controls, forward: value } })),
      setbackward: (value) => set((state) => ({ controls: { ...state.controls, backward: value } })),
      setleft: (value) => set((state) => ({ controls: { ...state.controls, left: value } })),
      setright: (value) => set((state) => ({ controls: { ...state.controls, right: value } })),
      setfish: (value) => set((state) => ({ controls: { ...state.controls, fish: value } })),
    }),
    {
      name: 'control-storage', // unique name
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
)

export default useStore