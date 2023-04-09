import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Boat } from './Boat'
import { BoatEngine } from './BoatEngine'
import { OrbitControls } from '@react-three/drei'
import { BoatWake } from './Wake'
//import TWEEN from "@tweenjs/tween.js";

const RemotePlayer = ({ id = 0 }) => {
    
  const remotePlayerRef = useRef(null)
  const helperRef = useRef({ 
    speed: 2,
    rotSpeed: 0.5,
    target: new THREE.Vector3(20,0,0),
    dir: new THREE.Vector3(0,0,1), 
    rot: new THREE.Vector3(0,0),
    rotationMatrix: new THREE.Matrix4(),
    targetQuaternion: new THREE.Quaternion(),
    offsetQuaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI,0)),
    rotation: 0.0  })

    useEffect(() => {
        updateRemovePlayerPosition({jumpTo: true, x: helperRef.current.target.x, y: helperRef.current.target.y, z: helperRef.current.target.z, r: helperRef.current.rotation})
        helperRef.current.target.set(-20,0,20)
    }, [])

  const updateRemovePlayerPosition = (transform, delta) => {
    if(transform.jumpTo) {
        remotePlayerRef.current.position.x = transform.x
        remotePlayerRef.current.position.y = transform.y
        remotePlayerRef.current.position.z = transform.z
        remotePlayerRef.current.rotation.y = transform.r
    } else {
        //Move towards
        helperRef.current.rotationMatrix.lookAt( helperRef.current.target, remotePlayerRef.current.position, remotePlayerRef.current.up );
        helperRef.current.targetQuaternion.setFromRotationMatrix( helperRef.current.rotationMatrix );
        helperRef.current.targetQuaternion.multiply(helperRef.current.offsetQuaternion)

        //Rotate towards target
        if ( ! remotePlayerRef.current.quaternion.equals( helperRef.current.targetQuaternion ) ) {
            const step = helperRef.current.rotSpeed * delta;
            remotePlayerRef.current.quaternion.rotateTowards( helperRef.current.targetQuaternion, step );
        }
        let dist = remotePlayerRef.current.position.distanceTo(helperRef.current.target)
        const distMultiplier = dist < 5 ? dist/5 : 1

        //Get dir to target, move towards target
        remotePlayerRef.current.translateZ(-helperRef.current.speed*delta*distMultiplier)

        //Demo purposes
        dist = remotePlayerRef.current.position.distanceTo(helperRef.current.target)
        if(dist < 1) {
            //Update target
            const oppX = Math.random() > 0.5
            const oppZ = oppX===false || Math.random() > 0.5
            helperRef.current.target.set(helperRef.current.target.x * (oppX ? -1 : 1),0,-helperRef.current.target.z * (oppZ ? -1 : 1))
        }
    }

  }

  useFrame((state, delta) => {
    updateRemovePlayerPosition({x: helperRef.current.target.x, y: helperRef.current.target.y, z: helperRef.current.target.z, r: helperRef.current.rotation}, delta)
  })

  return (
    <>
      <Boat ref={remotePlayerRef} />
      <BoatWake player={remotePlayerRef} />
    </>
  )
}

export { RemotePlayer }
