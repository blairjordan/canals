import { CanalWater } from './CanalWater'
import { Player } from './Player'
import { useCallback, useContext, useEffect } from 'react'
import {Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AppContext } from '@/context'
import { Terrain } from './Terrain'
import { MARKERS } from '@/graphql/marker'
import { useLazyQuery, useMutation } from '@apollo/client'
import { DebugMarker } from './DebugMarker'
import { RemotePlayer } from './RemotePlayer'
import TWEEN from '@tweenjs/tween.js'
import { Seagull } from './Seagulls'
import { FISH } from '@/graphql/action'

export default function Game({ route, ...props }) {
  const [state, dispatch] = useContext(AppContext)
  const [getMarkers, { loading: loadingMarkers, data: markerData, error: markerError }] = useLazyQuery(MARKERS)

  // 🎣 Fish mutation
  const [fish] = useMutation(FISH)

  // 👀 Watch for changes in state.player.id
  useEffect(() => {
    console.log('Current player:', state.player)
  }, [state.player?.id])

  // 🎣 Start fishing when player is in fishing state
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }

    const doFishing = () => {
      fish({ variables: { playerId: parseInt(state.player.id) } })
    }

    if (state.player.isFishing) {
      doFishing()
      const intervalId = setInterval(() => {
        doFishing()
      }, 5_000)
  
      return () => clearInterval(intervalId)
    }
  }, [state.player?.isFishing])

  
  // 📡 Fetch all markers when loading is complete
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
      <RemotePlayer id={0} />
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
