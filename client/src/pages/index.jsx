import dynamic from 'next/dynamic'
import PopupManager from '@/components/dom/PopupManager'
import PlayerInfo from '@/components/dom/PlayerInfo'
import { useAppContext } from '@/context'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import {  PLAYERS_ALL, PLAYERS_NEARBY } from '@/graphql/player'
import { MARKERS } from '@/graphql/marker'
import { useCallback, useEffect } from 'react'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [state, dispatch] = useAppContext()

  const [getRemotePlayers, { loading: loadingRemotePlayers, data: remotePlayersData, error: remotePlayersError }] = useLazyQuery(PLAYERS_ALL)
  const [getMarkers, { loading: loadingMarkers, data: markerData, error: markerError }] = useLazyQuery(MARKERS)

  useSubscription(PLAYERS_NEARBY, {
    onData: (payload) => {
      if (!(payload.data && payload.data.listen && payload.data.listen.query)) {
        return
      }
      const { data: { listen: { query: { players: { nodes: playerNodes } } } } } = payload
      handlePlayerUpdate(playerNodes)
    },
  })

  const handlePlayerUpdate = useCallback(
    (updatedPlayers) => {
      if (!(state.player && state.player.id)) {
        return
      }
      updatedPlayers.map((updatedPlayer) => {
        if (updatedPlayer.id !== state.player.id) {
          dispatch({ type: 'REMOTE_PLAYER_UPDATE_POSITION', payload: updatedPlayer })
        }
      })
    },
    [dispatch, state.player]
  )

  // Fetch remote players on login
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }
    getRemotePlayers()
  }, [state.player?.id])


  // 🗺 Fetch all markers
  useEffect(() => {
    if (!loadingMarkers && !markerData && !markerError) {
      getMarkers({ variables: { markerType: '%' } })
    }
  }, [loadingMarkers, markerData, markerError])

  // 🗺️ Add markers to the state when the data is fetched
  useEffect(() => {
    if (markerData && markerData.markers && markerData.markers.nodes) {
      markerData.markers.nodes.forEach((marker) => {
        // TODO: put radius into the database
        dispatch({ type: 'MARKER_ADD', payload: { ...marker, radius: 10 } })
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
        payload: remotePlayersData.players.nodes.filter((player) => player.id !== state.player.id),
      })
    }
  }, [loadingRemotePlayers, remotePlayersData, state.player, dispatch])

  return (
    <>
      <PopupManager />
      <PlayerInfo />
    </>
  )
}

Page.canvas = (props) => <Game />

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
