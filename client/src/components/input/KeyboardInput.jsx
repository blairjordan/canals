import React, { useCallback, useEffect, useState, useContext } from "react"
import useKeyPress from "../hooks/useKeyPress" 
import { AppContext } from '@/context'

// Component that checks for keyboard input and updates Zustand store
const KeyboardInput = (props) => {
  const [state, dispatch] = useContext(AppContext)

  const movePlayerUp = () => {
    dispatch({ type: 'ACTION_MOVE_FORWARD', payload: true, })
  }
  const movePlayerUpDone = () => {
    dispatch({ type: 'ACTION_MOVE_FORWARD', payload: false, })
  }
  const movePlayerDown = () => {
    dispatch({ type: 'ACTION_MOVE_BACKWARD', payload: true, })
  }
  const movePlayerDownDone = () => {
    dispatch({ type: 'ACTION_MOVE_BACKWARD', payload: false, })
  }
  const movePlayerLeft = () => {
    dispatch({ type: 'ACTION_MOVE_LEFT', payload: true, })
  }
  const movePlayerLeftDone = () => {
    dispatch({ type: 'ACTION_MOVE_LEFT', payload: false, })
  }
  const movePlayerRight = () => {
    dispatch({ type: 'ACTION_MOVE_RIGHT', payload: true, })
  }
  const movePlayerRightDone = () => {
    dispatch({ type: 'ACTION_MOVE_RIGHT', payload: false, })
  }
  const fish = () => {
    dispatch({ type: 'ACTION_FISH', payload: true, })
  }
  const fishDone = () => {
    dispatch({ type: 'ACTION_FISH', payload: false, })
  }
  const interact = () => {
    dispatch({ type: 'ACTION_INTERACT', payload: true, })
  }
  const interactDone = () => {
    dispatch({ type: 'ACTION_INTERACT', payload: false, })
  }
  const boosting = () => {
    dispatch({ type: 'ACTION_BOOST', payload: true, })
  }
  const boostingDone = () => {
    dispatch({ type: 'ACTION_BOOST', payload: false, })
  }
  const cancel = () => {
    dispatch({ type: 'ACTION_CANCEL', payload: true, })
  }
  const cancelDone = () => {
    dispatch({ type: 'ACTION_CANCEL', payload: false, })
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
  useKeyPress("e", null, interact, interactDone)
  useKeyPress("E", null, interact, interactDone)
  useKeyPress(" ", null, boosting, boostingDone)
  useKeyPress("Escape", null, cancel, cancelDone)
  
  // Debug
  // if (players[0].module.getPadId()) console.log("is pressed?", pressed)

  return <></>
}

export default KeyboardInput
