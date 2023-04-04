import { extend, useThree, useLoader, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from 'react'
import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import { Water } from 'three-stdlib'

extend({Water});

function CanalWater() {
  const ref = useRef()
  const gl = useThree((state) => state.gl);
  const waterNormals = useLoader(
    THREE.TextureLoader, '/textures/waternormals.jpg'
  );
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  const geom = useMemo(() => {
    //Need to connect this to something that can pull nodes down from the serva bro
    const nodes =[
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(500, 0, 0),
        new THREE.Vector3(500, 0, 500),
        new THREE.Vector3(-500, 0, -500)
    ]
    const connections = [[0,1],[1,2],[0,3]]

    const nodeGeoms = [];
    const center = new THREE.Vector2();
    const vector2 = new THREE.Vector2();
    const vector2a = new THREE.Vector2();
    const vector2b = new THREE.Vector2();

    nodes.map((node) => {
        const nodeShape = new THREE.Shape();
        const nodePoints = [];
        const center = new THREE.Vector2(node.x, node.z);
        for(let i = 0; i < 8; i++) {
            center.set(node.x, node.z);
            vector2.set(center.x + 40, center.y);
            vector2.rotateAround(
                center,
                ((i*45) + 22.5) * THREE.MathUtils.DEG2RAD
            );
            nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));
        }
        nodeShape.setFromPoints(nodePoints);
        const nodeGeom = new THREE.ShapeGeometry(nodeShape);
        nodeGeoms.push(nodeGeom);
    })

    connections.map((connection) => {
      const nodeA = nodes[connection[0]]
      const nodeB = nodes[connection[1]]
      const connShape = new THREE.Shape();
      const connPoints = [];

      vector2.set(nodeA.x, nodeA.z);
      vector2b.set(nodeB.x, nodeB.z);
      
      const pos = vector2a
        .set(nodeB.x, nodeB.z)
        .sub(vector2);
      const angle = pos.angle() * THREE.MathUtils.RAD2DEG;
      vector2a.copy(pos).normalize();

      //start left
      center.set(nodeA.x, nodeA.z);
      vector2.set(center.x + 40, center.y);
      vector2.rotateAround(
        center,
        (angle - 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(vector2.x, -vector2.y));


      //end left
      center.set(nodeB.x, nodeB.z);
      vector2.set(center.x + 40, center.y);
      vector2.rotateAround(
        center,
        (angle + 180 + 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(vector2.x, -vector2.y));

      //end right
      center.set(nodeB.x, nodeB.z);
      vector2.set(center.x + 40, center.y);
      vector2.rotateAround(
        center,
        (angle + 180 - 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(vector2.x, -vector2.y));

      //start right
      center.set(nodeA.x, nodeA.z);
      vector2.set(center.x + 40, center.y);
      vector2.rotateAround(
        center,
        (angle + 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(vector2.x, -vector2.y));

      connShape.setFromPoints(connPoints);
      const connGeom = new THREE.ShapeGeometry(connShape);

      nodeGeoms.push(connGeom);
    })

    return mergeBufferGeometries(nodeGeoms)
  }, [])
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

CanalWater.displayName = 'CanalWater';

export { CanalWater };