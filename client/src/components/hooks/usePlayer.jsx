import { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { PLAYER } from '@/graphql/player'
import { useAppContext } from '@/context'

function usePlayer() {
  const [state, dispatch] = useAppContext()

  const [getPlayer, {
    loading: loadingPlayer,
    data: playerData,
    error: playerError,
    startPolling: playerStartPolling,
    stopPolling: playerStopPolling
  }] = useLazyQuery(PLAYER, {
    fetchPolicy: 'no-cache'
  });

  // 👀 Watch for changes in state.player.id
  useEffect(() => {
    console.log('Current player:', state.player)
  }, [state.player?.id])

  useEffect(() => {
    if (!loadingPlayer && playerData && playerData.player) {
      if (!state.player.id) {
        dispatch({ type: 'LOGIN', payload: playerData.player })
      }
      console.log(playerData)
    }
  }, [loadingPlayer, playerData])

  useEffect(() => {
    if (!loadingPlayer && playerData && playerData.player) {
      dispatch({ type: 'PLAYER_UPDATE', payload: playerData.player })
    }
  }, [loadingPlayer, playerData])

  return [getPlayer, playerStartPolling, { loadingPlayer, playerData, playerError }];
}

usePlayer.displayName = 'usePlayer';

export default usePlayer;
