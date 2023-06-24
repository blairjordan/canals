import dynamic from 'next/dynamic'
import crypto from 'crypto'
import PopupManager from '@/components/dom/PopupManager'
import PlayerInfo from '@/components/dom/PlayerInfo'
import ChatBox from '@/components/dom/ChatBox'
import { useAppContext } from '@/context'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { PLAYERS_ALL, PLAYER_UPDATES } from '@/graphql/player'
import { CHAT_GLOBAL, MESSAGE_CREATE } from '@/graphql/message'
import { MARKERS, MARKER_UPDATED } from '@/graphql/marker'
import { useCallback, useEffect } from 'react'
import usePlayer from '../components/hooks/usePlayer'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [state, dispatch] = useAppContext()
  const [getPlayerSelf] = usePlayer()

  const [getRemotePlayers, { loading: loadingRemotePlayers, data: remotePlayersData, error: remotePlayersError }] =
    useLazyQuery(PLAYERS_ALL)
  const [getMarkers, { loading: loadingMarkers, data: markerData, error: markerError }] = useLazyQuery(MARKERS)
  const [createMessage, { loading: loadingCreateMessage, data: createMessageData, error: createMessageError }] =
    useMutation(MESSAGE_CREATE)

  useSubscription(CHAT_GLOBAL, {
    onData: (payload) => {
      if (!payload.data) {
        return
      }
      const {
        data: {
          data: {
            listen: { relatedNode: messageNode },
          },
        },
      } = payload
      handleMessage(messageNode)
    },
  })

  useSubscription(MARKER_UPDATED, {
    onData: (payload) => {
      if (!payload.data) {
        return
      }
      const {
        data: {
          data: {
            listen: { relatedNode: markerNode },
          },
        },
      } = payload
      handleMarkerUpdate(markerNode)
    },
  })

  useSubscription(PLAYER_UPDATES, {
    onData: (payload) => {
      if (!payload.data) {
        return
      }
      const {
        data: {
          data: {
            listen: { relatedNode: playerNode },
          },
        },
      } = payload
      if (!playerNode) {
        return
      }
      handlePlayerUpdate(playerNode)
    },
  })

  // #️⃣ Hash the player items to determine if they've changed without deep comparing
  const hashplayerItems = useCallback(
    (playerItems) => crypto.createHash('sha256').update(JSON.stringify(playerItems)).digest('hex'),
    [],
  )

  const handleMessage = useCallback(
    (message) => {
      if (!(state.player && state.player.id)) {
        return
      }
      dispatch({ type: 'MESSAGE_ADD', payload: message })
    },
    [dispatch, state.player],
  )

  const handleMessageSend = useCallback(
    (message) => {
      if (!(state.player && state.player.id)) {
        return
      }
      createMessage({ variables: { playerId: state.player.id, message } })
    },
    [dispatch, state.player],
  )

  const handlePlayerUpdate = useCallback(
    (updatedPlayer) => {
      if (!(state.player && state.player.id)) {
        return
      }

      const playerItemsHashed = hashplayerItems(updatedPlayer.playerItems.nodes)
      const { playerItems, fuel, balance, package: packageItem, ...updatedPlayerBase } = updatedPlayer

      console.log(updatedPlayer)
      if (updatedPlayer.id === state.player.id) {
        dispatch({ type: 'PLAYER_UPDATE', payload: { playerItems, fuel, balance, packageItem, playerItemsHashed } })
      } else {
        dispatch({ type: 'REMOTE_PLAYER_UPDATE', payload: { ...updatedPlayerBase, playerItems, playerItemsHashed } })
      }
    },
    [dispatch, state.player],
  )

  const handleMarkerUpdate = useCallback(
    (updatedMarker) => {
      dispatch({ type: 'MARKER_UPDATE', payload: updatedMarker })
    },
    [dispatch, state.markers],
  )

  useEffect(() => {
    getPlayerSelf()
  }, [])

  // Fetch remote players on login
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }
    getRemotePlayers()
    getMarkers({ variables: { markerType: '%' } })
  }, [state.player?.id])

  // 🗺️ Add markers to the state when the data is fetched
  useEffect(() => {
    if (markerData && markerData.markers && markerData.markers.nodes) {
      markerData.markers.nodes.forEach((marker) => {
        if (!state.markers.some((existingMarker) => existingMarker.id === marker.id)) {
          dispatch({ type: 'MARKER_ADD', payload: marker })
        }
      })
    }
  }, [markerData])

  // 📡 Update remote players
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }

    if (!loadingRemotePlayers && remotePlayersData) {
      dispatch({
        type: 'REMOTE_PLAYERS_SET',
        payload: remotePlayersData.players.nodes
          .filter((player) => player.id !== state.player.id)
          .reduce(
            (prev, remotePlayer) => ({
              ...prev,
              [remotePlayer.id]: {
                ...remotePlayer,
                playerItemsHashed: hashplayerItems(remotePlayer.playerItems.nodes),
              },
            }),
            {},
          ),
      })
    }
  }, [loadingRemotePlayers])

  return (
    <>
      <PopupManager />
      <PlayerInfo />
      <ChatBox handleMessageSend={handleMessageSend} />
    </>
  )
}

Page.canvas = (props) => <Game />

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
