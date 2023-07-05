import React, { useContext } from 'react'
import useKeyPress from '../hooks/useKeyPress'
import { AppContext } from '@/context'

const KeyboardInput = () => {
  const [state, dispatch] = useContext(AppContext)

  const setAction = (action, value) => () => dispatch({ type: 'ACTION_SET', payload: { action, value } })

  const keyActionMap = {
    w: 'forward',
    W: 'forward',
    ArrowUp: 'forward',
    s: 'backward',
    S: 'backward',
    ArrowDown: 'backward',
    a: 'left',
    A: 'left',
    ArrowLeft: 'left',
    d: 'right',
    D: 'right',
    ArrowRight: 'right',
    f: 'fish',
    F: 'fish',
    e: 'interact',
    E: 'interact',
    i: 'inventoryToggle',
    I: 'inventoryToggle',
    c: 'settingsToggle',
    C: 'settingsToggle',
    ' ': 'boost',
    Escape: 'cancel',
  }

  Object.entries(keyActionMap).forEach(([key, action]) => {
    useKeyPress(key, null, setAction(action, true), setAction(action, false))
  })

  return null
}

export default KeyboardInput
