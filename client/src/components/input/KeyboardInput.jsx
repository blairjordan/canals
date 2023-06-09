import React, { useContext } from 'react'
import useKeyPress from '../hooks/useKeyPress'
import { AppContext } from '@/context'

const KeyboardInput = () => {
  const [state, dispatch] = useContext(AppContext)

  const setAction = (action, value) => () => dispatch({ type: 'ACTION_SET', payload: { action, value } })

  useKeyPress('w', null, setAction('forward', true), setAction('forward', false))
  useKeyPress('W', null, setAction('forward', true), setAction('forward', false))
  useKeyPress('ArrowUp', null, setAction('forward', true), setAction('forward', false))
  useKeyPress('s', null, setAction('backward', true), setAction('backward', false))
  useKeyPress('S', null, setAction('backward', true), setAction('backward', false))
  useKeyPress('ArrowDown', null, setAction('backward', true), setAction('backward', false))
  useKeyPress('a', null, setAction('left', true), setAction('left', false))
  useKeyPress('A', null, setAction('left', true), setAction('left', false))
  useKeyPress('ArrowLeft', null, setAction('left', true), setAction('left', false))
  useKeyPress('d', null, setAction('right', true), setAction('right', false))
  useKeyPress('D', null, setAction('right', true), setAction('right', false))
  useKeyPress('ArrowRight', null, setAction('right', true), setAction('right', false))
  useKeyPress('f', null, setAction('fish', true), setAction('fish', false))
  useKeyPress('F', null, setAction('fish', true), setAction('fish', false))
  useKeyPress('e', null, setAction('interact', true), setAction('interact', false))
  useKeyPress('E', null, setAction('interact', true), setAction('interact', false))
  useKeyPress('i', null, setAction('inventoryToggle', true), setAction('inventoryToggle', false))
  useKeyPress('I', null, setAction('inventoryToggle', true), setAction('inventoryToggle', false))
  useKeyPress(' ', null, setAction('boost', true), setAction('boost', false))
  useKeyPress('Escape', null, setAction('cancel', true), setAction('cancel', false))

  return <></>
}

export default KeyboardInput
