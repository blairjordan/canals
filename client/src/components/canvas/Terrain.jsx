import { useGLTF } from "@react-three/drei";
import { extend, useThree, useLoader, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from 'react'
import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

function Terrain() {
  const housesGroupRef = useRef({group: new THREE.Group() })
  const { scene, nodes, materials } = useGLTF('/models/buildings.glb');

  const geom = useMemo(() => {
    //Need to connect this to something that can pull nodes down from the serva bro
    const nodeVectors =[
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 500),
        new THREE.Vector3(500, 0, 500),
        new THREE.Vector3(500, 0, 0),
        new THREE.Vector3(500, 0, -500),
        new THREE.Vector3(0, 0, -500),
        new THREE.Vector3(-500, 0, -500),
        new THREE.Vector3(-500, 0, 0),
        new THREE.Vector3(-500, 0, 500),
    ]
    const sections = [
      [0,1,2],
      [0,2,3],
      [0,3,4],
      [0,4,5],
      [0,5,6],
      [0,6,7],
      [0,7,8],
      [0,8,1],
    ]

    const nodeGeoms = [];
    const center = new THREE.Vector2();
    const vector2 = new THREE.Vector2();
    const vector2a = new THREE.Vector2();
    const vector2b = new THREE.Vector2();

    const width = 40

    let street_building_01 = null
    let street_building_01001 = null
    Object.values(nodes).forEach((child) => {
        if(child.isMesh) {
            if(street_building_01===null) {
                if(child.parent.name==='street_building_01') {
                    street_building_01 = child.parent;
                }
            }
            if(street_building_01001===null) {
                if(child.parent.name==='street_building_01001') {
                    street_building_01001 = child.parent;
                }
            }
        }
    })

    for(let i = housesGroupRef.current.group.children.length-1; i >= 0; i--) {
        housesGroupRef.current.group.remove(housesGroupRef.current.group.children[i]);
    }

    sections.map((section) => {
        const a = nodeVectors[section[0]]
        const b = nodeVectors[section[1]]
        const c = nodeVectors[section[2]]
        const nodeShape = new THREE.Shape();
        const nodePoints = [];

        const isOdd = section[1] % 2 === 1;


        center.set(a.x, a.z);
        vector2.set(a.x+width, a.z);
        vector2b.set(b.x, b.z);
        const posA = vector2a
          .set(b.x, b.z)
          .sub(center);
        const angle = posA.angle() * THREE.MathUtils.RAD2DEG;
        vector2.rotateAround(
            center,
            (angle - 22.5) * THREE.MathUtils.DEG2RAD
          );
        nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));
        
        if(isOdd) {
            center.set(b.x, b.z);
            vector2.set(b.x+width, b.z);
            vector2b.set(c.x, c.z);
            const posB = vector2a
              .set(c.x, c.z)
              .sub(center);
            const angleB = posB.angle() * THREE.MathUtils.RAD2DEG;
            vector2.rotateAround(
                center,
                (angleB - 67.5) * THREE.MathUtils.DEG2RAD
              );
            nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));
        }

        center.set(b.x, b.z);
        vector2.set(b.x+width, b.z);
        vector2b.set(c.x, c.z);
        const posB = vector2a
          .set(c.x, c.z)
          .sub(center);
        const angleB = posB.angle() * THREE.MathUtils.RAD2DEG;
        vector2.rotateAround(
            center,
            (angleB - 22.5) * THREE.MathUtils.DEG2RAD
          );
        nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));
        
        if(!isOdd) {
            center.set(c.x, c.z);
            vector2.set(c.x+width, c.z);
            vector2b.set(a.x, a.z);
            const posC = vector2a
              .set(a.x, a.z)
              .sub(center);
            const angleC = posC.angle() * THREE.MathUtils.RAD2DEG;
            vector2.rotateAround(
                center,
                (angleC - 67.5) * THREE.MathUtils.DEG2RAD
              );
            nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));
        }

        center.set(c.x, c.z);
        vector2.set(c.x+width, c.z);
        vector2b.set(a.x, a.z);
        const posC = vector2a
          .set(a.x, a.z)
          .sub(center);
        const angleC = posC.angle() * THREE.MathUtils.RAD2DEG;
        vector2.rotateAround(
            center,
            (angleC - 22.5) * THREE.MathUtils.DEG2RAD
          );
        nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y));

        nodeShape.setFromPoints(nodePoints);

        //House positions
        const vectorB = new THREE.Vector3().set(nodePoints[1].x, 0, nodePoints[1].y)
        const distAB = nodePoints[0].distanceTo(nodePoints[1])
        const stepAB = 5.83 / distAB;
        const houseCountAB = Math.floor(distAB / 5.83);
        for(let i = 1; i < houseCountAB-1; i++) {
            const house = clone(Math.random() < 0.5 ? street_building_01 : street_building_01001)
            house.position.set(nodePoints[0].x, 0.5, nodePoints[0].y).lerp(vectorB, stepAB*(i))
            house.rotateY((angle+90) * THREE.MathUtils.DEG2RAD)
            housesGroupRef.current.group.add(house)
        }

        // const vectorC = new THREE.Vector3().set(!isOdd ? nodePoints[2].x : nodePoints[3].x, 0, !isOdd ? nodePoints[2].y : nodePoints[3].y)
        // const distAC = nodePoints[0].distanceTo(!isOdd ? nodePoints[2] : nodePoints[3])
        // const stepAC = 5.83 / distAC;
        // const houseCountAC = Math.floor(distAC / 5.83);
        // for(let i = 0; i < houseCountAC; i++) {
        //     const house = clone(street_building_01001)
        //     house.position.set(nodePoints[0].x, 0, nodePoints[0].y).lerp(vectorC, stepAC*(i+0.05))
        //     house.rotateY((angle+90) * THREE.MathUtils.DEG2RAD)
        //     housesGroupRef.current.group.add(house)
        // }
        // //

        const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.1, bevelThickness: 0.1};
        const nodeGeom = new THREE.ExtrudeGeometry( nodeShape, extrudeSettings );
        //const nodeGeom = new THREE.ShapeGeometry(nodeShape);
        nodeGeoms.push(nodeGeom);
    })

    return mergeBufferGeometries(nodeGeoms)
  }, [nodes])
  
  return  (<group>
      <primitive
        object={housesGroupRef.current.group} 
    />
    <mesh 
        position={[0,-0.05,0]}
        geometry={geom}
        rotation-x={-Math.PI / 2} 
    >
        <meshLambertMaterial attach="material" color="grey" side={THREE.DoubleSide} />
    </mesh>
  </group>)
}

Terrain.displayName = 'Terrain';

export { Terrain };