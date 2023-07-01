import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppContext } from '@/context'

const DEBOUNCE_TIMEOUT = 250

const Dialog = ({ markerKey, name, data }) => {
  const [state, dispatch] = useAppContext()
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [isNextKeyPressed, setIsNextKeyPressed] = useState(0)
  const [openDebounced, setOpenDebounced] = useState(false)

  if (data.length === 0) {
    return null
  }

  const debounce = useCallback((cb) => {
    const debounceTimeout = setTimeout(cb, DEBOUNCE_TIMEOUT)
    return () => clearTimeout(debounceTimeout)
  })

  useEffect(() => {
    debounce(() => {
      setOpenDebounced(true)
    })
  }, [])

  const dialogPages = useMemo(
    () =>
      Array.from(
        data
          .reduce((map, dialog) => map.set(dialog.order, [...(map.get(dialog.order) || []), dialog]), new Map())
          .values(),
        // 🎲 If multiple dialog entries have the same order, one of them will be randomly selected
        (dialogs) => dialogs[Math.floor(Math.random() * dialogs.length)],
      ),
    [data],
  )

  const lastPageIdx = useMemo(
    () =>
      data.reduce((acc, dialog) => {
        return dialog.order > acc ? dialog.order : acc
      }, 0),
    [data],
  )

  useEffect(() => {
    if (!openDebounced) {
      return
    }
    setIsNextKeyPressed(state.actions.interact)
  }, [state.actions.interact])

  useEffect(() => {
    debounce(() => {
      if (isNextKeyPressed) {
        if (currentPageIdx + 1 < dialogPages.length) {
          setCurrentPageIdx(currentPageIdx + 1)
        } else {
          dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'npc' } })
        }
        setIsNextKeyPressed(false)
      }
    })
  }, [isNextKeyPressed])

  return (
    <div>
      <div className='flex items-start py-4'>
        <img
          className='h-13 w-13 rounded-full bg-gray-400 mr-4'
          src={`img/npcs/${markerKey}.png`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.style.display = 'none'
          }}
          style={{ maxHeight: '150px', maxWidth: '150px' }}
        />
        <div className='bg-gray-200 rounded-lg px-4 py-3'>
          <p className='font-semibold text-gray-800 mb-4'>{name}</p>
          <div className='text-gray-800'>{dialogPages[currentPageIdx].text}</div>
        </div>
      </div>
      <div className='flex justify-end'>
        <a className={`kbc-button ${isNextKeyPressed ? 'active' : ''}`} onClick={() => setIsNextKeyPressed(true)}>
          {currentPageIdx !== lastPageIdx ? 'Next' : 'Close'}
        </a>
      </div>
    </div>
  )
}

Dialog.displayName = 'Dialog'

export { Dialog }
