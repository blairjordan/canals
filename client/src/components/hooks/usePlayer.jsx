import { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { PLAYER_SELF } from '@/graphql/player'
import { useAppContext } from '@/context'

function usePlayer() {
  const [state, dispatch] = useAppContext()

  const [getPlayerSelf, { loading: loadingPlayerSelf, data: playerSelfData, error: playerSelfError }] = useLazyQuery(
    PLAYER_SELF,
    {
      fetchPolicy: 'no-cache',
    },
  )

  // 👀 Watch for changes in state.player.id
  useEffect(() => {
    console.log('Current player:', state.player)
  }, [state.player?.id])

  useEffect(() => {
    if (!loadingPlayerSelf && playerSelfData && playerSelfData.currentPlayer) {
      dispatch({ type: 'PLAYER_UPDATE', payload: playerSelfData.currentPlayer })
    }
  }, [loadingPlayerSelf, playerSelfData])

  return [getPlayerSelf, { loadingPlayer: loadingPlayerSelf, playerData: playerSelfData, playerError: playerSelfError }]
}

usePlayer.displayName = 'usePlayer'

export default usePlayer
