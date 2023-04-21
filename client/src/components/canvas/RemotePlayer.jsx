import React, { forwardRef, useEffect, useMemo, useRef, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AppContext } from '@/context'
import { Boat } from './Boat'
import { BoatWake } from './Wake'
//import TWEEN from "@tweenjs/tween.js";

const RemotePlayer = ({ id = 0 }) => {
  const [state, dispatch] = useContext(AppContext)
    
  const remotePlayerRef = useRef(null)
  const helperRef = useRef({ 
    firstSet: false,
    speed: 2,
    rotSpeed: 0.5,
    target: new THREE.Vector3(20,0,0),
    dir: new THREE.Vector3(0,0,1), 
    rot: new THREE.Vector3(0,0),
    rotationMatrix: new THREE.Matrix4(),
    targetQuaternion: new THREE.Quaternion(),
    offsetQuaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI,0)),
    rotation: 0.0
  })

  useEffect(() => {
    console.log(state.remotePlayers)
    console.log(id)
    const remotePlayer = state.remotePlayers.find(player => player.id === id)

    if (!remotePlayer) {
      return
    }

    const { position } = remotePlayer;

    if(helperRef.firstSet) {
      helperRef.current.rotation = position.r
      helperRef.current.target.set(position.x, position.y, position.z)
    } else {
      helperRef.firstSet = true
      updateRemotePlayerPosition({x: position.x, y: position.y, z: position.z, r: position.r, jumpTo: true})
    }
    
  }, [state.remotePlayers.find(player => player.id === id)?.position])

  const updateRemotePlayerPosition = (transform, delta) => {
    if(transform.jumpTo) {
        helperRef.current.rotation = transform.r
        remotePlayerRef.current.rotation.y = transform.r
        helperRef.current.target.set(transform.x, transform.y, transform.z)
        remotePlayerRef.current.position.copy(helperRef.current.target)
    } else {
        //Move towards
        remotePlayerRef.current.position.lerp( helperRef.current.target, delta)

        //Set rotation
        remotePlayerRef.current.rotation.y = transform.r
    }

  }

  useFrame((state, delta) => {
    updateRemotePlayerPosition({x: helperRef.current.target.x, y: helperRef.current.target.y, z: helperRef.current.target.z, r: helperRef.current.rotation}, delta)
  })

  return (
    <>
      <Boat ref={remotePlayerRef} />
      <BoatWake player={remotePlayerRef} />
    </>
  )
}

export { RemotePlayer }
