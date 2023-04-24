import { CanalWater } from './CanalWater'
import { Player } from './Player'
import { useCallback, useContext, useEffect } from 'react'
import {Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useAppContext } from '@/context'
import { Terrain } from './Terrain'
import { useMutation } from '@apollo/client'
import { DebugMarker } from './DebugMarker'
import { RemotePlayer } from './RemotePlayer'
import TWEEN from '@tweenjs/tween.js'
import { Seagull } from './Seagulls'
import { FISH } from '@/graphql/action'
import usePlayer from '../hooks/usePlayer';

export default function Game({ route, ...props }) {
  const [state, dispatch] = useAppContext()
  const [getPlayer] = usePlayer();

  // 🎣 Fish mutation
  const [fish, { data: fishData, loading: fishLoading }] = useMutation(FISH)

  // 🎣 Start fishing when player is in fishing state
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }

    if (state.player.isFishing) {
      const intervalId = setInterval(() => {
        fish({ variables: { playerId: parseInt(state.player.id) } })
      }, 500)
  
      return () => clearInterval(intervalId)
    }
  }, [state.player?.isFishing])

  // 🐟 Add popup when fish is caught and update player
  useEffect(() => {
    if (fishLoading) return

    if (fishData && fishData.fish && fishData.fish.playerItem) {
      const { playerItem: { id, item } } = fishData.fish
      getPlayer({ variables: { id: state.player.id } })
      dispatch({
        type: 'UI_POPUP_ADD',
        payload: {
          id: `player-item-${id}`,
          item,
          type: 'fish_caught'
        }
      })
    }
  }, [fishLoading, fishData])

  useEffect(() => {
    if (!(state.player && state.player.id)) return
    const { x: playerX, z: playerZ } = state.player.position
    
    state.markers.map((marker) => {
      const { position: { x: markerX, y: markerY }, radius } = marker
      const distance = Math.sqrt(Math.pow(playerX - markerX, 2) + Math.pow(playerZ - markerY, 2)) * 0.5
      if (distance < radius) {
        dispatch({ type: 'GEOFENCE_ADD', payload: marker })
      } else {
        dispatch({ type: 'GEOFENCE_REMOVE', payload: marker })
      }
    })
  }, [state.markers, state.player, state.player.position, state.geofences])

  // Check if player is inside marker zone
  useFrame(() => {
    TWEEN.update()

    // 📍 Check if player is interacting with a marker
    if (state.popups.length > 0) {

      if(state.actions.interact) {

        // 🛑 Cancel any fishing activity
        dispatch({ type: 'PLAYER_SET_FISHING', payload: false })

        dispatch({
          type: 'UI_POPUP_INTERACT',
          payload: {
            popup: state.popups[state.popups.length - 1],
            interacted: true
          }
        })
      }

      // Close all popups if cancel is pressed
      state.popups.map((popup) => {
        if(state.actions.cancel) {
          dispatch({
            type: 'UI_POPUP_INTERACT',
            payload: {
              popup,
              interacted: false
            }
          })
        }
      })
    }
    
    // If cancel key pressed ...
    if(state.actions.cancel) {
      
      // Close all popups
      state.popups.map((popup) => {
        dispatch({
          type: 'UI_POPUP_INTERACT',
          payload: {
            popup,
            interacted: false
          }
        })
      })

      // 🐡 Stop fishing
      dispatch({ type: 'PLAYER_SET_FISHING', payload: false })
    }

    // 🎣 If player hits fishing key, set fishing state
    if(state.actions.fish) {
      dispatch({ type: 'PLAYER_SET_FISHING', payload: true })
    }
    
  })
  
  return (
    <>
      <Terrain />
      <CanalWater />
      <Sky scale={5000} sunPosition={[0, 750, -4500]} turbidity={0.1} />
      <Player />
      {state.remotePlayers.map(({ id }) => (
        <RemotePlayer key={`player-${id}`} id={id} />
      ))}
      <Seagull />
      {state.markers.map(({ id, position: { x, y }, radius, type }) => {
        // 🚩 Add DebugMarker for each marker
        return <DebugMarker
          key={id}
          isDebugMode={true}
          scale={2}
          position={{ x, y }}
          radius={radius}
          color={
            type === 'vendor'
              ? '#ff0000'
              : type === 'fishing_spot'
                ? '#00ff00'
                : '#0000ff'
          }
        />
      })}
    </>
  )
}
