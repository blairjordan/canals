import { CanalWater } from './CanalWater'
import { Player } from './Player'
import { useContext, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { Line, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AppContext } from '@/context'
import { Terrain } from './Terrain'
import { MARKERS } from '@/graphql/marker'
import { useLazyQuery } from '@apollo/client'
import { DebugMarker } from './DebugMarker'
import { RemotePlayer } from './RemotePlayer'
import TWEEN from '@tweenjs/tween.js'
import { Birds } from './Birds'

export default function Game({ route, ...props }) {
  const [state, dispatch] = useContext(AppContext)

  // 👀 Watch for changes in state.player.id
  useEffect(() => {
    console.log('Current player:', state.player)
  }, [state.player?.id])

  const [getMarkers, { loading: loadingMarkers, data: markerData, error: markerError }] = useLazyQuery(MARKERS)

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

  // Check if player is inside marker zone
  useFrame(() => {
    TWEEN.update()
    state.markers.forEach((marker) => {
      if (!state.player) return
      const { x: playerX, z: playerZ } = state.player.position
      const { x: markerX, y: markerY } = marker.position
      const distance = Math.sqrt(Math.pow(playerX - markerX, 2) + Math.pow(playerZ - markerY, 2)) * 0.5

      const isInRadius = distance < marker.radius
      const isAlreadyInGeofences = state.geofences.some((g) => g.id === marker.id)

      if (isInRadius && !isAlreadyInGeofences) {
        // FIXME: If player starts in marker zone, it gets added twice
        dispatch({ type: 'GEOFENCE_ADD', payload: marker })
      } else if (!isInRadius && isAlreadyInGeofences) {
        dispatch({ type: 'GEOFENCE_REMOVE', payload: marker })
      }
    })

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
