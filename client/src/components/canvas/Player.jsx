import React, {forwardRef, useEffect, useMemo, useRef, useState} from 'react'
import useStore from "../helpers/store"
import { useFrame } from '@react-three/fiber';
import * as THREE from "three";
import { Boat } from './Boat';
import { BoatEngine } from './BoatEngine';
import { OrbitControls } from '@react-three/drei'
import { BoatWake } from './Wake';

const Player = (props) => {
    const playerRef = useRef(null);
    const controlsRef = useRef(null);
    const engineRef = useRef({
        engine: new BoatEngine(), 
        currentPlayerPosition: new THREE.Vector3(),
        lastPlayerPosition: new THREE.Vector3()
    })

    useFrame((state,delta) => {
        const { controls } = useStore.getState();
        const {engine, currentPlayerPosition, lastPlayerPosition } = engineRef.current;

        lastPlayerPosition.copy(playerRef.current.position) 

        engine.boosting = controls.boosting
        engine.isThrottling = controls.forward
        engine.isReversing = controls.backward
        engine.isTurningLeft = controls.left
        engine.isTurningRight = controls.right
        engine.update(delta)

        playerRef.current.position.set(engine.y, 0, engine.x)
        playerRef.current.rotation.set(0, (Math.PI*0.5) + engine.angle, 0)

        currentPlayerPosition.copy(playerRef.current.position)
        currentPlayerPosition.sub(lastPlayerPosition)

        state.camera.position.add(currentPlayerPosition)
        controlsRef.current.target.copy(playerRef.current.position);

    })
  return (
    <> 
    <Boat ref={playerRef} /> 
    <BoatWake player={playerRef}/>
    <OrbitControls ref={controlsRef} target={[0,0,0]} maxPolarAngle={Math.PI * 0.470} minDistance={4.0} maxDistance={550.0}/>
    </>
  )
}

export { Player }