import React, { useEffect, useState } from 'react'
import Uppy from '@uppy/core'
import { Dashboard } from '@uppy/react'
import Transloadit from '@uppy/transloadit'
import { useAppContext } from '@/context'

import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'

function FlagUploader() {
  const [state, dispatch] = useAppContext()

  const [uppy, setUppy] = useState(null)

  useEffect(() => {
    const uppyInstance = new Uppy({
      meta: { type: 'avatar' },
      restrictions: { maxNumberOfFiles: 1 },
    }).use(Transloadit, {
      waitForEncoding: true,
      waitForCompletion: true,
      assemblyOptions: {
        params: {
          auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY },
          template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID,
        },
        fields: {
          playerId: state.player.id,
        },
      },
    })

    setUppy(uppyInstance)

    return () => {
      if (uppyInstance) {
        uppyInstance.close()
      }
    }
  }, [])

  if (!uppy) {
    return null
  }

  return <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} note='Flag propotions are 1:2' />
}

export { FlagUploader }
