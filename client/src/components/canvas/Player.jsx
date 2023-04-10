import React, { forwardRef, useEffect, useMemo, useRef, useState, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { AppContext } from '@/context'
import * as THREE from 'three'
import { Boat } from './Boat'
import { BoatEngine } from './BoatEngine'
import { OrbitControls } from '@react-three/drei'
import { BoatWake } from './Wake'
import { useMutation } from '@apollo/client';
import { PLAYER_UPDATE } from '@/graphql/player';


const Player = () => {
  const [state, dispatch] = useContext(AppContext)

  const playerRef = useRef(null)
  const controlsRef = useRef(null)
  const engineRef = useRef({
    engine: new BoatEngine(),
    currentPlayerPosition: new THREE.Vector3(),
    lastPlayerPosition: new THREE.Vector3(),
  })

  const [frameCounter, setFrameCounter] = useState(0)

  const [updatePlayer, { data: playerUpdateData, loading: playerUpdateLoading, error: playerUpdateError }] = useMutation(PLAYER_UPDATE)

  useFrame((threeState, delta) => {
    const { engine, currentPlayerPosition, lastPlayerPosition } = engineRef.current

    lastPlayerPosition.copy(playerRef.current.position)
  
    engine.boosting = state.actions.boosting
    engine.isThrottling = state.actions.forward
    engine.isReversing = state.actions.backward
    engine.isTurningLeft = state.actions.left
    engine.isTurningRight = state.actions.right
    engine.update(delta)

    playerRef.current.position.set(engine.y, 0, engine.x)
    playerRef.current.rotation.set(0, Math.PI * 0.5 + engine.angle, 0)

    currentPlayerPosition.copy(playerRef.current.position)
    currentPlayerPosition.sub(lastPlayerPosition)

    threeState.camera.position.add(currentPlayerPosition)
    controlsRef.current.target.copy(playerRef.current.position)

    dispatch({
      type: 'PLAYER_UPDATE_POSITION',
      payload: lastPlayerPosition,
    })

    if (!(state.player && state.player.id)) {
      return
    }

    // Avoid sending updates when the player is not moving
    if (lastPlayerPosition.equals(playerRef.current.position)) {
      return
    }

    // Update player position on the server every 120 frames
    setFrameCounter(frameCounter + 1)
    if (frameCounter >= 120) {
      console.log('update')

      updatePlayer({
        variables: {
          id: state.player.id,
          position: {
            ...lastPlayerPosition
          }
        }
      })
      setFrameCounter(0)
    }
  })

  return (
    <>
      <Boat ref={playerRef} />
      <BoatWake player={playerRef} />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI * 0.47}
        minDistance={4.0}
        maxDistance={80.0}
      />
    </>
  )
}

export { Player }