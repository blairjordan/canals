import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AppContext } from '@/context'
import { useGLTF } from '@react-three/drei'
import { OPERATE_LOCK } from '@/graphql/action'
// import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

function Locks(props) {
  const [state, dispatch] = useContext(AppContext)
  const lockGroupRef = useRef({ group: new THREE.Group(), groupWater: new THREE.Group(), scene: null, sceneWater: null, lockGates: [], lockWater: [], lockBounds: [] })

  //Lock states
  //

  const [lock1, setLock1] = useState({
    id: 'lock1',
    currentState: 'bottomClosed',
    targetState: 'topClosed',
    timer: -25,
    dirToTop: true,
    height: 7,
  })
  const [lock2, setLock2] = useState({
    id: 'lock2',
    currentState: 'bottomClosed',
    targetState: 'topClosed',
    timer: -25,
    dirToTop: true,
    height: 7,
  })
  const [lock3, setLock3] = useState({
    id: 'lock3',
    currentState: 'bottomClosed',
    targetState: 'topClosed',
    timer: -25,
    dirToTop: true,
    height: 7,
  })

  const { scene, nodes, materials } = useGLTF('/models/locks.glb')
  const { scene: sceneWater, nodes: nodesWater, materials: materialsWater } = useGLTF('/models/locksWater.glb')

  useEffect(() => {
      if (!lockGroupRef.current.scene) {
        //scene.rotation.x = Math.PI * -0.5
        lockGroupRef.current.scene = scene
        lockGroupRef.current.group.add(scene)
        Object.values(nodes).forEach((child) => {
          if (child.isMesh) {
            if (child.name.includes('Bounds')) {
              child.visible = false
              lockGroupRef.current.lockBounds.push(child)
            }
            if (child.name.includes('gates')) {
              lockGroupRef.current.lockGates.push(child)
            }
          }
        })
      }
  }, [scene])

  useEffect(() => {
      if (!lockGroupRef.current.sceneWater) {
        lockGroupRef.current.sceneWater = sceneWater
        lockGroupRef.current.groupWater.add(sceneWater)
        Object.values(nodesWater).forEach((child) => {
          if (child.isMesh) {
            if (child.name.includes('water')) {
              child.material = props.canalRef.current.material
              child.position.y = 0.001
              lockGroupRef.current.lockWater.push(child)
            }
          }
        })
      }
  }, [sceneWater])

  const bottomGates = (id, openness) => {
    lockGroupRef.current.lockGates.map((gates) => {
      if (gates.name === id + '_gates') {
        const morphIndex = gates.morphTargetDictionary.BottomOpen
        gates.morphTargetInfluences[morphIndex] = openness
      }
    })
  }

  const topGates = (id, openness) => {
    lockGroupRef.current.lockGates.map((gates) => {
      if (gates.name === id + '_gates') {
        const morphIndex = gates.morphTargetDictionary.TopOpen
        gates.morphTargetInfluences[morphIndex] = openness
      }
    })
  }

  const waterLeveling = (id, height, level) => {
    lockGroupRef.current.lockWater.map((water) => {
      if (water.name === id + '_water') {
        water.position.y = 0.001 + (height * level)
      }
    })
    
  }

  const manageLockState = (lock, setLock, delta) => {
    if(lock.currentState === lock.targetState) return
    const timer = THREE.MathUtils.clamp(lock.timer + (lock.dirToTop ? delta : -delta), -25, 72)
    let currentState = lock.currentState
    switch (lock.currentState) {
      case 'bottomClosed': //0sec
        currentState = 'bottomOpening'
        if(!lock.dirToTop) {
          lock.dirToTop = true
          targetState = 'topClosed'
        }
        break
      case 'bottomOpening': //0-2sec
        bottomGates(lock.id, Math.max(0, timer / 2))
        if (lock.dirToTop && timer >= 2) currentState = 'bottomOpened'
        break
      case 'bottomOpened': //2-12sec
        if (lock.dirToTop && timer >= 12) currentState = 'bottomClosing'
        break
      case 'bottomClosing': //12-14sec
        bottomGates(lock.id, 1 - (timer - 12) / 2)
        if (lock.dirToTop && timer >= 14) currentState = 'bottomSealed'
        break
      case 'bottomSealed': //0sec
        if (lock.dirToTop && timer >= 14) currentState = 'waterLeveling'
        break
      case 'waterLeveling': //10sec
        waterLeveling(lock.id, lock.height, (timer - 14) / 10)
        if (lock.dirToTop && timer >= 24) currentState = 'topSealed'
        break
      case 'topSealed': //0sec
        if (lock.dirToTop && timer >= 24) currentState = 'topOpening'
        break
      case 'topOpening': //2sec
        topGates(lock.id, (timer - 24) / 2)
        if (lock.dirToTop && timer >= 26) currentState = 'topOpened'
        break
      case 'topOpened': //10sec
        if (lock.dirToTop && timer >= 36) currentState = 'topClosing'
        if (!lock.dirToTop && timer >= 36) currentState = 'topClosing'
        break
      case 'topClosing': //2sec
        topGates(lock.id, 1 - (timer - 36) / 2)
        if (lock.dirToTop && timer >= 38) currentState = 'topClosed'
        if (!lock.dirToTop && timer <= 36) currentState = 'topOpened'
        break
      case 'topClosed': //0sec
        //Reset cyle for now
        lock.dirToTop = false
        currentState = 'topClosed'
        targetState = 'bottomClosed'
        break
    }
    if (timer !== lock.timer || currentState !== lock.currentState) {
      setLock({ ...lock, timer: timer, currentState: currentState })
    }
  }

  useFrame((state, delta) => {
    //Are gates loaded
    if (lockGroupRef.current.lockGates.length >= 3) {
      manageLockState(lock1, setLock1, delta)
      manageLockState(lock2, setLock2, delta)
      manageLockState(lock3, setLock3, delta)
    }
  })

  return <group>
      <primitive object={lockGroupRef.current.group}/>
      <primitive object={lockGroupRef.current.groupWater}/>
    </group> 
}

Locks.displayName = 'Locks'

export { Locks }
