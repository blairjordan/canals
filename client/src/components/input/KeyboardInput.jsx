import React, { useCallback, useEffect, useState } from "react"
import useKeyPress from "../hooks/useKeyPress" 
import useStore from "../helpers/store"

// Component that checks for keyboard input and updates Zustand store
const KeyboardInput = (props) => {
  const movePlayerUp = () => {
    // We have to get the latest state here because if we use the React hook
    // and try to access data here, it will be stale
    // Makes a case for a centralized input class that can share store
    // instead of grabbing store each key and each keypress!
    const { controls, setforward} = useStore.getState()
    // console.log('actions', setforward)
    setforward?.(true);
  }
  const movePlayerUpDone = () => {
    const { setforward } = useStore.getState()
    setforward?.(false);
  }
  const movePlayerDown = () => {
    const { setbackward } = useStore.getState()
    setbackward?.(true);
  }
  const movePlayerDownDone = () => {
    const { setbackward } = useStore.getState()
    setbackward?.(false);
  }
  const movePlayerLeft = () => {
    const { setleft } = useStore.getState()
    setleft?.(true);
  }
  const movePlayerLeftDone = () => {
    const { setleft } = useStore.getState()
    setleft?.(false);
  }
  const movePlayerRight = () => {
    const { setright } = useStore.getState()
    setright?.(true);
  }
  const movePlayerRightDone = () => {
    const { setright } = useStore.getState()
    setright?.(false);
  }
  const fish = () => {
    const { setfish } = useStore.getState()
    setfish?.(true);
  }
  const fishDone = () => {
    const { setfish } = useStore.getState()
    setfish?.(false);
  }
  useKeyPress("w", null, movePlayerUp, movePlayerUpDone)
  useKeyPress("W", null, movePlayerUp, movePlayerUpDone)
  useKeyPress("ArrowUp", null, movePlayerUp, movePlayerUpDone)
  useKeyPress("s", null, movePlayerDown, movePlayerDownDone)
  useKeyPress("S", null, movePlayerDown, movePlayerDownDone)
  useKeyPress("ArrowDown", null, movePlayerDown, movePlayerDownDone)
  useKeyPress("a", null, movePlayerLeft, movePlayerLeftDone)
  useKeyPress("A", null, movePlayerLeft, movePlayerLeftDone)
  useKeyPress("ArrowLeft", null, movePlayerLeft, movePlayerLeftDone)
  useKeyPress("d", null, movePlayerRight, movePlayerRightDone)
  useKeyPress("D", null, movePlayerRight, movePlayerRightDone)
  useKeyPress("ArrowRight", null, movePlayerRight, movePlayerRightDone)
  useKeyPress("f", null, fish, fishDone)
  useKeyPress("F", null, fish, fishDone)

  // Debug
  // if (players[0].module.getPadId()) console.log("is pressed?", pressed)

  return <></>
}

export default KeyboardInput
