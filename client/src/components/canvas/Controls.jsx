import React, {useEffect, useRef, useState} from 'react'
import useStore from "../helpers/store"
import { useFrame } from '@react-three/fiber';
import * as THREE from "three";
import { Boat } from './Boat';
import { BoatEngine } from './BoatEngine';
import { OrbitControls } from '@react-three/drei'

const Controls = (props) => {
    const playerRef = useRef(null);
    const controlsRef = useRef(null);
    const engine = new BoatEngine()
    const currentPlayerPosition = new THREE.Vector3()
    const lastPlayerPosition = new THREE.Vector3()

    // useEffect(() =>
    // {
    //     setEngine(new BoatEngine())
    //     console.log('set engine')
    // }, [])

    useFrame((state,delta) => {
        const { controls } = useStore.getState();

        lastPlayerPosition.copy(playerRef.current.position) 

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
    <OrbitControls ref={controlsRef} target={[0,0,0]} maxPolarAngle={Math.PI * 0.470} minDistance={4.0} maxDistance={80.0}/>
    </>
  )
}

export { Controls }