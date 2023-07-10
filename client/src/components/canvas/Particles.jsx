import React, { useRef, useMemo, useState, useEffect, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AppContext } from '@/context'

const Particles = ({ count, lifeTime = 20 }) => {
  const [state, _] = useContext(AppContext)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mesh = useRef()
  const color = '#ffffff'
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 5
      const factor = 50 + Math.random() * 100
      const xFactor = (Math.random() - 0.5) * 500
      const yFactor = (Math.random() - 0.5) * 500
      const zFactor = (Math.random() - 0.5) * 500
      const life = Math.random() * lifeTime
      temp.push({ t, factor, xFactor, yFactor, zFactor, life, mx: 0, my: 0 })
    }
    setParticles(temp)
  }, [count, lifeTime])

  useFrame((_, delta) => {
    let tempParticles = particles.map((particle, i) => {
      let { t, factor, xFactor, yFactor, zFactor, life } = particle

      t = particle.t += delta * 0.06
      life = particle.life -= delta
      if (life <= 0) return null

      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10,
      )

      dummy.scale.set(s, s, s)
      dummy.updateMatrix()

      mesh.current.setMatrixAt(i, dummy.matrix)
      return { t, factor, xFactor, yFactor, zFactor, life, mx: particle.mx, my: particle.my }
    })
    // ☠ Remove "dead" particles
    tempParticles = tempParticles.filter((particle) => particle !== null)

    // 🥚 Spawn new particles
    while (tempParticles.length < count) {
      const t = Math.random() * 10
      const factor = 50 + Math.random() * 50
      const xFactor = (state.player.position.x || 0) + (Math.random() - 0.5) * 50
      const yFactor = (state.player.position.y || 0) + (Math.random() - 0.5) * 50
      const zFactor = (state.player.position.z || 0) + (Math.random() - 0.5) * 50
      const life = Math.random() * lifeTime
      tempParticles.push({ t, factor, xFactor, yFactor, zFactor, life, mx: 0, my: 0 })
    }

    setParticles(tempParticles)
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <dodecahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </instancedMesh>
    </>
  )
}

export { Particles }
