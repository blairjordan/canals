import React, { forwardRef, useEffect, useMemo, useRef, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AppContext } from '@/context'
import { Boat } from './Boat'
import { BoatWake } from './Wake'
import TWEEN from "@tweenjs/tween.js";

const RemotePlayer = ({ id = 0 }) => {
  const [state, dispatch] = useContext(AppContext)
    
  const remotePlayerRef = useRef(null)
  const helperRef = useRef({ 
    firstSet: false,
    updateTween: null,
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
      const initVal = { 
        x:remotePlayerRef.current.position.x,
        y:remotePlayerRef.current.position.y,
        z:remotePlayerRef.current.position.z,
        r:remotePlayerRef.current.rotation.y  };
      if(helperRef.current.updateTween) {
        helperRef.current.updateTween.stop()
      }
      helperRef.current.updateTween = new TWEEN.Tween(initVal)
        .to({ 
          x: transform.x, 
          y: transform.y, 
          z: transform.z, 
          r: transform.r ? transform.r : remotePlayerRef.current.rotation.y }
          , 1000)
        .onUpdate(() => {
          remotePlayerRef.current.position.x = initVal.x
          remotePlayerRef.current.position.y = initVal.y
          remotePlayerRef.current.position.z = initVal.z
          remotePlayerRef.current.rotation.y = initVal.r
        })
        .start();
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
