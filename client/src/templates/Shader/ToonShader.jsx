// @ts-nocheck
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import vertex from './glsl/toon.vert'
import fragment from './glsl/toon.frag'
import { forwardRef, useImperativeHandle, useRef } from 'react'

const ShaderImpl = shaderMaterial(
  {
    glossiness: {
        value: 20,
    },
    color: {
        value: new THREE.Color(0.2, 0.2, 0.2),
    },
  },
  vertex,
  fragment,
)

// This is the 🔑 that HMR will renew if this file is edited
// It works for THREE.ShaderMaterial as well as for drei/shaderMaterial
// @ts-ignore
ShaderImpl.key = THREE.MathUtils.generateUUID()

extend({ ShaderImpl })

// eslint-disable-next-line react/display-name
const ToonShader = forwardRef(({ children, ...props }, ref) => {
  const localRef = useRef()

  useImperativeHandle(ref, () => localRef.current)

  //useFrame((_, delta) => (localRef.current.time += delta))
  return <shaderImpl ref={localRef} glsl={THREE.GLSL3} key={ShaderImpl.key} {...props} attach='material' />
})

export default ToonShader
