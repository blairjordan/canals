import { CanalWater } from './CanalWater'
import { Player } from './Player'
import { useContext, useEffect, useMemo, useRef } from 'react'
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

export default function Game({ route, ...props }) {
  const [state, dispatch] = useContext(AppContext)

  // 👀 Watch for changes in state.player.id
  useEffect(() => {
    console.log('Current player:', state.player)
  }, [state.player?.id])

  const [getMarkers, { loading: loadingMarkers, data: markerData, error: markerError }] = useLazyQuery(MARKERS)

  // 📡 Fetch markers when loading is complete
  useEffect(() => {
    if (!loadingMarkers && !markerData && !markerError) {
      getMarkers({ variables: { markerType: 'vendor' } })
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

  // 🗨 Add a popup when the player is inside a marker zone
  useEffect(() => {
    const vendorGeofences = state.geofences.filter((geofence) => geofence.type === 'vendor')
    // state.player && state.player.id is truthy when the player is logged in
    if (state.player && state.player.id && vendorGeofences && vendorGeofences.length > 0) {
      // Assume there is only one vendor geofence,
      // but popup opens for the last vendor geofence in the array
      const vendorGeofence = vendorGeofences[vendorGeofences.length - 1]
      const popupId = `vendor-${vendorGeofence.id}`
      const popupExists = state.popups.some((popup) => popup.id === popupId)
      if (!popupExists) {
        dispatch({
          type: 'UI_POPUP_ADD',
          payload: {
            id: popupId,
            message: `Press E to interact with ${vendorGeofence.props.name}`,
          },
        })
      }
    } else {
      dispatch({ type: 'UI_POPUP_CLEAR' })
    }
  }, [state.player, state.geofences])

  // Check if player is inside marker zone
  useFrame(() => {
    TWEEN.update()
    state.markers.forEach((marker) => {
      if (!state.player) return
      const { x: playerX, z: playerZ } = state.player.position
      const { x: markerX, y: markerY } = marker.position
      const distance = Math.sqrt(Math.pow(playerX - markerX, 2) + Math.pow(playerZ - markerY, 2)) * 0.5

      const isInRadius = distance < marker.radius
      const isAlreadyInGeofences = state.geofences.includes(marker)

      if (isInRadius && !isAlreadyInGeofences) {
        dispatch({ type: 'GEOFENCE_ADD', payload: marker })
      } else if (!isInRadius && isAlreadyInGeofences) {
        dispatch({ type: 'GEOFENCE_REMOVE', payload: marker })
      }
    })
  })

  // useFrame((state, delta) => {
  //   if(controls.interact && state.popups) {
  //     console.log('Interact pressed')
  //   }
  // })

  return (
    <>
      <Terrain />
      <CanalWater />
      <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
      <Player />
      <RemotePlayer id={0} />
      {state.markers.map(({ id, position: { x, y }, radius }) => {
        // 🚩 Add DebugMarker for each marker
        return <DebugMarker key={id} isDebugMode={true} scale={2} position={{ x, y }} radius={radius} />
      })}
    </>
  )
}
