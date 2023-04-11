import { Environment, useGLTF } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'

function Terrain() {
  const {gl} = useThree()
  const housesGroupRef = useRef({ group: new THREE.Group() })
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
    const nodeVectors = [
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
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
      [0, 5, 6],
      [0, 6, 7],
      [0, 7, 8],
      [0, 8, 1],
    ]

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

    for (let i = housesGroupRef.current.group.children.length - 1; i >= 0; i--) {
      housesGroupRef.current.group.remove(housesGroupRef.current.group.children[i])
    }

    const houseMeshes = []

    sections.map((section) => {
      const a = nodeVectors[section[0]]
      const b = nodeVectors[section[1]]
      const c = nodeVectors[section[2]]
      const nodeShape = new THREE.Shape()
      const nodePoints = []

      const isOdd = section[1] % 2 === 1

      center.set(a.x, a.z)
      vector2.set(a.x + width, a.z)
      vector2b.set(b.x, b.z)
      const posA = vector2a.set(b.x, b.z).sub(center)
      const angle = posA.angle() * THREE.MathUtils.RAD2DEG
      vector2.rotateAround(center, (angle - 22.5) * THREE.MathUtils.DEG2RAD)
      nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))

      if (isOdd) {
        center.set(b.x, b.z)
        vector2.set(b.x + width, b.z)
        vector2b.set(c.x, c.z)
        const posB = vector2a.set(c.x, c.z).sub(center)
        const angleB = posB.angle() * THREE.MathUtils.RAD2DEG
        vector2.rotateAround(center, (angleB - 67.5) * THREE.MathUtils.DEG2RAD)
        nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))
      }

      center.set(b.x, b.z)
      vector2.set(b.x + width, b.z)
      vector2b.set(c.x, c.z)
      const posB = vector2a.set(c.x, c.z).sub(center)
      const angleB = posB.angle() * THREE.MathUtils.RAD2DEG
      vector2.rotateAround(center, (angleB - 22.5) * THREE.MathUtils.DEG2RAD)
      nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))

      if (!isOdd) {
        center.set(c.x, c.z)
        vector2.set(c.x + width, c.z)
        vector2b.set(a.x, a.z)
        const posC = vector2a.set(a.x, a.z).sub(center)
        const angleC = posC.angle() * THREE.MathUtils.RAD2DEG
        vector2.rotateAround(center, (angleC - 67.5) * THREE.MathUtils.DEG2RAD)
        nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))
      }

      center.set(c.x, c.z)
      vector2.set(c.x + width, c.z)
      vector2b.set(a.x, a.z)
      const posC = vector2a.set(a.x, a.z).sub(center)
      const angleC = posC.angle() * THREE.MathUtils.RAD2DEG
      vector2.rotateAround(center, (angleC - 22.5) * THREE.MathUtils.DEG2RAD)
      nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))

      nodeShape.setFromPoints(nodePoints)

      //House positions
      const vectorB = new THREE.Vector3().set(nodePoints[1].x, 0, nodePoints[1].y)
      const distAB = nodePoints[0].distanceTo(nodePoints[1])
      const stepAB = 5.83 / distAB
      const houseCountAB = Math.floor(distAB / 5.83)
      for (let i = 1; i < houseCountAB - 1; i++) {
        const house = clone(Math.random() < 0.5 ? street_building_01 : street_building_01001)
        house.position.set(nodePoints[0].x, 0.5, nodePoints[0].y).lerp(vectorB, stepAB * i + stepAB * 0.3)
        house.rotateY((angle + 90) * THREE.MathUtils.DEG2RAD)
        house.translateX(-0.5 + (i > 1 ? -Math.random() * 2 : 0))

        house.traverse((child) => {
          if (child.isMesh) {
            houseMeshes.push(child)
          }
        })
      }

      const vectorC = new THREE.Vector3(nodePoints[3].x, 0, nodePoints[3].y)
      const distAC = nodePoints[0].distanceTo(nodePoints[3])
      const stepAC = 5.83 / distAC
      const houseCountAC = Math.floor(distAC / 5.83)
      for (let i = 1; i < houseCountAC - 1; i++) {
        const house = clone(Math.random() < 0.5 ? street_building_01 : street_building_01001)
        house.position.set(nodePoints[0].x, 0.0, nodePoints[0].y).lerp(vectorC, stepAC * i + stepAC * 0.3)
        house.rotateY((angleC + 90) * THREE.MathUtils.DEG2RAD)
        house.translateX(-0.5 + (i > 1 ? -Math.random() * 2 : 0))

        house.traverse((child) => {
          if (child.isMesh) {
            houseMeshes.push(child)
          }
        })
      }

      const centroid = new THREE.Vector2()
      const points = nodeShape.getPoints()
      points.forEach((p) => centroid.add(p))
      centroid.divideScalar(points.length)
      points.forEach((p) => p.sub(centroid))
      points.forEach((p) => p.multiplyScalar(0.99))
      points.forEach((p) => p.add(centroid))
      const holePath = new THREE.Shape(points.reverse())
      nodeShape.holes.push(holePath)
      const grassPath = new THREE.Shape(points)

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

      const nodeGeom = new THREE.ExtrudeGeometry(nodeShape, extrudeSettingsStraight)
      const nodeGeomEdge = new THREE.ExtrudeGeometry(nodeShape, extrudeSettingsBevel)
      const grassGeom = new THREE.ShapeGeometry(grassPath);
      applyBoxUV(nodeGeom, new THREE.Matrix4(), 100)
      applyBoxUV(nodeGeomEdge, new THREE.Matrix4(), 100)
      applyBoxUV(grassGeom, new THREE.Matrix4(), 100)
      nodeGeomEdge.translate(0,0,2)
      grassGeoms.push(grassGeom)
      nodeGeoms.push(nodeGeom)
      nodeGeoms2.push(nodeGeomEdge)
    })

    console.log('adding ', houseMeshes.length / 3, ' houses')
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
     <Environment preset="forest" background />
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
