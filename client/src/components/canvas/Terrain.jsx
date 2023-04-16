import { Environment, useGLTF } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import NodeGenerator from '../utils/NodeGenerator'

function Terrain() {
  const {gl} = useThree()
  const housesGroupRef = useRef({ group: new THREE.Group() })
  const nodeGenRef = useRef({ generator: NodeGenerator })
  const { scene, nodes, materials } = useGLTF('/models/buildings.glb')
  const baseRef = useRef(null)
  const grassRef = useRef(null)
  const edgeRef = useRef(null)
  const edgeTex = useLoader(THREE.TextureLoader, '/textures/edge.png')
  edgeTex.wrapS = edgeTex.wrapT = THREE.RepeatWrapping

  const bakeMultimaterialModel = (meshes) => {
    const matrix4 = new THREE.Matrix4()
    // brick_wall_01
    // brick_wall_02
    // roof_tiles_01
    // windows_01
    // windows_02
    const materials = []
    const geometries = {}
    const mergedMeshes = []
    meshes.map((mesh) => {
      const find = materials.find((m) => m.name === mesh.material.name)
      if (!find) {
        geometries[mesh.material.name] = []
        materials.push(mesh.material)
      }
      mesh.parent.updateMatrix()
      mesh.parent.updateMatrixWorld(true)
      mesh.updateMatrix()
      mesh.updateMatrixWorld(true)
      matrix4.copy(mesh.matrixWorld)
      const geom = mesh.geometry.clone()
      geom.applyMatrix4(matrix4)
      geometries[mesh.material.name].push(geom)
    })

    Object.values(geometries).forEach(function (geoms, index) {
      const combined = mergeBufferGeometries(geoms)
      const mergedMesh = new THREE.Mesh(combined, materials[index])
      mergedMeshes.push(mergedMesh)
    })

    return mergedMeshes
  }

  const {geom, geom2, grassGeom } = useMemo(() => {
    //Need to connect this to something that can pull nodes down from the serva bro
   
    if(housesGroupRef.current.group.length >0) return
    console.log('Terrain geom,geom2,grassGeom useMemo')

    nodeGenRef.current.generator.init()
    const nodeRows = nodeGenRef.current.generator.nodeVectors
    const connections = nodeGenRef.current.generator.nodeConnections
    const sectionPointsList = nodeGenRef.current.generator.nodeSectionPoints

    const nodeGeoms = []
    const nodeGeoms2 = []
    const grassGeoms = []
    const center = new THREE.Vector2()
    const vector2 = new THREE.Vector2()
    const vector2a = new THREE.Vector2()
    const vector2b = new THREE.Vector2()
    const vector3 = new THREE.Vector3()
    const matrix4 = new THREE.Matrix4()

    const width = 40

    let street_building_01 = null
    let street_building_01001 = null
    Object.values(nodes).forEach((child) => {
      if (child.isMesh) {
        if (street_building_01 === null) {
          if (child.parent.name === 'street_building_01') {
            street_building_01 = child.parent
          }
        }
        if (street_building_01001 === null) {
          if (child.parent.name === 'street_building_01001') {
            street_building_01001 = child.parent
          }
        }
      }
    })

    //Clear previous houses
    for (let i = housesGroupRef.current.group.children.length - 1; i >= 0; i--) {
      housesGroupRef.current.group.remove(housesGroupRef.current.group.children[i])
    }

    const houseMeshes = []

    sectionPointsList.map((sectionPoints, i) => {
      //sectionPoints
      const nodeShape = new THREE.Shape(sectionPoints)

      const centroid = new THREE.Vector2()
      const centroid3 = new THREE.Vector3()
      const points = nodeShape.getPoints()
      points.forEach((p) => centroid.add(p))
      centroid.divideScalar(points.length)
      points.forEach((p) => p.sub(centroid))
      points.forEach((p) => p.multiplyScalar(0.99))
      points.forEach((p) => p.add(centroid))
      const holePath = new THREE.Shape(points.reverse())
      nodeShape.holes.push(holePath)

      // points.forEach((p) => p.sub(centroid))
      // points.forEach((p) => p.multiplyScalar(0.95))
      // points.forEach((p) => p.add(centroid))
      const grassPath = new THREE.Shape(points)
      centroid3.set(centroid.x, 0, -centroid.y)

      let doHouses = true
      if(i !== (sectionPointsList.length/2) - 7 
      && i !== (sectionPointsList.length/2) - 8 
      && i !== (sectionPointsList.length/2) - 9
      && i !== (sectionPointsList.length/2) - 10
      && i !== (sectionPointsList.length/2) + 9
      && i !== (sectionPointsList.length/2) + 8
      && i !== (sectionPointsList.length/2) + 7
      && i !== (sectionPointsList.length/2) + 6) {
        doHouses = false
      }

      //House positions
      if(doHouses) {
        const reverse = sectionPoints[0].y < 0
        sectionPoints.map((p1, k) => {
          const p2 = sectionPoints[(k+1) % sectionPoints.length]

          const xDist = p1.x - p2.x;
          const zDist = p1.y - p2.y;
          const angle = Math.atan2(zDist, xDist) * 180 / Math.PI;

          vector2.set(p1.x, -p1.y)
          vector2a.set(p2.x, -p2.y)
          vector2b.set(p2.x, -p2.y)
          const posA = vector2a.sub(vector2)
          //const angle = (posA.angle() * THREE.MathUtils.RAD2DEG)
          const distAB = p1.distanceTo(p2)
          if(distAB > 5.83) {
            const stepAB = 5.83 / distAB
            const houseCountAB = Math.floor(distAB / 5.83)
            for (let j = 1; j < houseCountAB; j++) {
              vector3.set(p2.x, 0, -p2.y)

              const house = clone(Math.random() < 0.5 ? street_building_01 : street_building_01001)
              house.position.set(p1.x, 0, -p1.y).lerp(vector3, stepAB * j + stepAB * 0.3)
              house.rotateY((angle - 90) * THREE.MathUtils.DEG2RAD)

              vector3.copy(house.position)
              const distToCentroid = house.position.distanceTo(centroid3)
              const move = -0.5 + (j > 1 ? -Math.random() * 2 : 0);
              house.translateX(move)

              vector3.copy(house.position)
              const distToCentroid2 = house.position.distanceTo(centroid3)
              
              if(distToCentroid2 > distToCentroid) {
                house.translateX(-move * 2.0)
                house.rotateY(Math.PI)
              }
      
              house.traverse((child) => {
                if (child.isMesh) {
                  houseMeshes.push(child)
                }
              })
            }
          }
        })
      }

      const extrudeSettingsStraight = {
        depth: 2.0,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0,
        bevelThickness: 0,
      }
      const extrudeSettingsBevel = {
        depth: 0.4,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0.2,
        bevelThickness: 0.2,
      }

      function _applyBoxUV(geom, transformMatrix, bbox, bbox_max_size) {
        let coords = []
        coords.length = (2 * geom.attributes.position.array.length) / 3

        // geom.removeAttribute('uv');
        if (geom.attributes.uv === undefined) {
          geom.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2))
        }

        //maps 3 verts of 1 face on the better side of the cube
        //side of the cube can be XY, XZ or YZ
        let makeUVs = function (v0, v1, v2) {
          //pre-rotate the model so that cube sides match world axis
          v0.applyMatrix4(transformMatrix)
          v1.applyMatrix4(transformMatrix)
          v2.applyMatrix4(transformMatrix)

          //get normal of the face, to know into which cube side it maps better
          let n = new THREE.Vector3()
          n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize()

          n.x = Math.abs(n.x)
          n.y = Math.abs(n.y)
          n.z = Math.abs(n.z)

          let uv0 = new THREE.Vector2()
          let uv1 = new THREE.Vector2()
          let uv2 = new THREE.Vector2()
          // xz mapping
          if (n.y > n.x && n.y > n.z) {
            uv0.x = (v0.x - bbox.min.x) / bbox_max_size
            uv0.y = (bbox.max.z - v0.z) / bbox_max_size

            uv1.x = (v1.x - bbox.min.x) / bbox_max_size
            uv1.y = (bbox.max.z - v1.z) / bbox_max_size

            uv2.x = (v2.x - bbox.min.x) / bbox_max_size
            uv2.y = (bbox.max.z - v2.z) / bbox_max_size
          } else if (n.x > n.y && n.x > n.z) {
            uv0.x = (v0.z - bbox.min.z) / bbox_max_size
            uv0.y = (v0.y - bbox.min.y) / bbox_max_size

            uv1.x = (v1.z - bbox.min.z) / bbox_max_size
            uv1.y = (v1.y - bbox.min.y) / bbox_max_size

            uv2.x = (v2.z - bbox.min.z) / bbox_max_size
            uv2.y = (v2.y - bbox.min.y) / bbox_max_size
          } else if (n.z > n.y && n.z > n.x) {
            uv0.x = (v0.x - bbox.min.x) / bbox_max_size
            uv0.y = (v0.y - bbox.min.y) / bbox_max_size

            uv1.x = (v1.x - bbox.min.x) / bbox_max_size
            uv1.y = (v1.y - bbox.min.y) / bbox_max_size

            uv2.x = (v2.x - bbox.min.x) / bbox_max_size
            uv2.y = (v2.y - bbox.min.y) / bbox_max_size
          }

          return {
            uv0: uv0,
            uv1: uv1,
            uv2: uv2,
          }
        }

        if (geom.index) {
          // is it indexed buffer geometry?
          for (let vi = 0; vi < geom.index.array.length; vi += 3) {
            let idx0 = geom.index.array[vi]
            let idx1 = geom.index.array[vi + 1]
            let idx2 = geom.index.array[vi + 2]

            let vx0 = geom.attributes.position.array[3 * idx0]
            let vy0 = geom.attributes.position.array[3 * idx0 + 1]
            let vz0 = geom.attributes.position.array[3 * idx0 + 2]

            let vx1 = geom.attributes.position.array[3 * idx1]
            let vy1 = geom.attributes.position.array[3 * idx1 + 1]
            let vz1 = geom.attributes.position.array[3 * idx1 + 2]

            let vx2 = geom.attributes.position.array[3 * idx2]
            let vy2 = geom.attributes.position.array[3 * idx2 + 1]
            let vz2 = geom.attributes.position.array[3 * idx2 + 2]

            let v0 = new THREE.Vector3(vx0, vy0, vz0)
            let v1 = new THREE.Vector3(vx1, vy1, vz1)
            let v2 = new THREE.Vector3(vx2, vy2, vz2)

            let uvs = makeUVs(v0, v1, v2, coords)

            coords[2 * idx0] = uvs.uv0.x
            coords[2 * idx0 + 1] = uvs.uv0.y

            coords[2 * idx1] = uvs.uv1.x
            coords[2 * idx1 + 1] = uvs.uv1.y

            coords[2 * idx2] = uvs.uv2.x
            coords[2 * idx2 + 1] = uvs.uv2.y
          }
        } else {
          for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
            let vx0 = geom.attributes.position.array[vi]
            let vy0 = geom.attributes.position.array[vi + 1]
            let vz0 = geom.attributes.position.array[vi + 2]

            let vx1 = geom.attributes.position.array[vi + 3]
            let vy1 = geom.attributes.position.array[vi + 4]
            let vz1 = geom.attributes.position.array[vi + 5]

            let vx2 = geom.attributes.position.array[vi + 6]
            let vy2 = geom.attributes.position.array[vi + 7]
            let vz2 = geom.attributes.position.array[vi + 8]

            let v0 = new THREE.Vector3(vx0, vy0, vz0)
            let v1 = new THREE.Vector3(vx1, vy1, vz1)
            let v2 = new THREE.Vector3(vx2, vy2, vz2)

            let uvs = makeUVs(v0, v1, v2, coords)

            let idx0 = vi / 3
            let idx1 = idx0 + 1
            let idx2 = idx0 + 2

            coords[2 * idx0] = uvs.uv0.x
            coords[2 * idx0 + 1] = uvs.uv0.y

            coords[2 * idx1] = uvs.uv1.x
            coords[2 * idx1 + 1] = uvs.uv1.y

            coords[2 * idx2] = uvs.uv2.x
            coords[2 * idx2 + 1] = uvs.uv2.y
          }
        }

        geom.attributes.uv.array = new Float32Array(coords)
      }

      function applyBoxUV(bufferGeometry, transformMatrix, boxSize) {
        if (transformMatrix === undefined) {
          transformMatrix = new THREE.Matrix4()
        }

        if (boxSize === undefined) {
          let geom = bufferGeometry
          geom.computeBoundingBox()
          let bbox = geom.boundingBox

          let bbox_size_x = bbox.max.x - bbox.min.x
          let bbox_size_z = bbox.max.z - bbox.min.z
          let bbox_size_y = bbox.max.y - bbox.min.y

          boxSize = Math.max(bbox_size_x, bbox_size_y, bbox_size_z)
        }

        let uvBbox = new THREE.Box3(
          new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2),
          new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2),
        )

        _applyBoxUV(bufferGeometry, transformMatrix, uvBbox, boxSize)
      }

      const extrudePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 2, 0)
      ]);
      const extrudeSettings = {
        steps: 100,
        bevelEnabled: false,
        extrudePath: extrudePath
      };

      const grassGeom = new THREE.ShapeGeometry(grassPath);
      //const grassGeom = new THREE.ExtrudeGeometry(grassPath, extrudeSettings)

      const nodeGeom = new THREE.ExtrudeGeometry(nodeShape, extrudeSettingsStraight)
      const nodeGeomEdge = new THREE.ExtrudeGeometry(nodeShape, extrudeSettingsBevel)

      applyBoxUV(nodeGeom, new THREE.Matrix4(), 100)
      applyBoxUV(nodeGeomEdge, new THREE.Matrix4(), 100)
      applyBoxUV(grassGeom, new THREE.Matrix4(), 100)
      nodeGeomEdge.translate(0,0,2)
      grassGeoms.push(grassGeom)
      nodeGeoms.push(nodeGeom)
      nodeGeoms2.push(nodeGeomEdge)
    })

    //console.log('adding ', houseMeshes.length / 3, ' houses')
    const resultMeshes = bakeMultimaterialModel(houseMeshes)
    resultMeshes.map((mesh) => {
      housesGroupRef.current.group.add(mesh)
    })


    return {geom: mergeBufferGeometries(nodeGeoms), geom2: mergeBufferGeometries(nodeGeoms2), grassGeom: mergeBufferGeometries(grassGeoms)}
  }, [nodes])

  useEffect(() => {

    if (edgeRef.current) {
      edgeTex.repeat.x = 25
      edgeTex.repeat.y = 25
      edgeRef.current.material.map = edgeTex
      
      materials.windows_01.envMap = edgeRef.current.parent.parent.background
      materials.windows_02.envMap = edgeRef.current.parent.parent.background
      materials.windows_01.envMapIntensity = 2
      materials.windows_02.envMapIntensity = 2
    }
    if (baseRef.current) {
      edgeTex.repeat.x = 50
      edgeTex.repeat.y = 50
      baseRef.current.material.map = edgeTex
    }
    if (grassRef.current) {
      edgeTex.repeat.x = 10
      edgeTex.repeat.y = 10
      grassRef.current.material.map = edgeTex
    }
    

  }, [edgeRef, baseRef, grassRef])

  return (
    <group>
     <Environment files='/textures/env.hdr' background />
      <primitive position={[0,2.2,0]}  object={housesGroupRef.current.group} />
      <mesh ref={baseRef}  position={[0, -0.05, 0]} geometry={geom} rotation-x={-Math.PI / 2}>
        <meshLambertMaterial attach='material' color='grey' />
      </mesh>
      <mesh ref={edgeRef} position={[0, -0.05, 0]} geometry={geom2} rotation-x={-Math.PI / 2}>
        <meshLambertMaterial attach='material' color='#9f4636'/>
      </mesh>
      <mesh ref={grassRef} position={[0, 2.4, 0]} geometry={grassGeom} rotation-x={-Math.PI / 2}>
        <meshLambertMaterial attach='material' color='#71966e' />
      </mesh>
    </group>
  )
}

Terrain.displayName = 'Terrain'

export { Terrain }
