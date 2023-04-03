import { extend, useThree, useLoader, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from 'react'
import * as THREE from "three";

import { Water } from 'three-stdlib'

extend({Water});

function CanalWater() {
  const ref = useRef()
  const gl = useThree((state) => state.gl);
  const waterNormals = useLoader(
    THREE.TextureLoader, '/textures/waternormals.jpg'
  );
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  const geom = useMemo(() => new THREE.PlaneGeometry(2000, 2000), [])
  const config = useMemo(
    () => ({
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xaca996,
        waterColor: 0x000607,
        distortionScale: 8.0,
        fog: false,
        format: gl.encoding,
        alpha: 0.8,
        size: 6,
    }),
    [waterNormals]
  )
  useFrame(
    (state, delta) => {
        if(ref)
            ref.current.material.uniforms.time.value += (delta*0.5)
    }
  );
  return <water 
    ref={ref} 
    args={[geom, config]} 
    rotation-x={-Math.PI / 2} 
  />
}

export { CanalWater };