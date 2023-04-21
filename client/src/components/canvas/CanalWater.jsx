import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import { Water } from 'three-stdlib'
import NodeGenerator from '../utils/NodeGenerator'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

extend({ Water })

function CanalWater() {
  const ref = useRef()
  const geomExport = useRef(0)
  const geomRef = useRef(null)
  const nodeGenRef = useRef({ generator: NodeGenerator })
  const raycaster = useRef(new THREE.Raycaster())
  raycaster.current.firstHitOnly = true;
  
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, '/textures/waternormals.jpg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = useMemo(() => {
    if(geomRef.current) return geomRef.current

    //Need to connect this to something that can pull nodes down from the serva bro
    nodeGenRef.current.generator.init()
    const nodeRows = nodeGenRef.current.generator.nodeVectors
    const connections = nodeGenRef.current.generator.nodeConnections
    const sectionPoints = nodeGenRef.current.generator.nodeSectionPoints
    const deadends = nodeGenRef.current.generator.nodeDeadends

    //console.log('CanalWater geom useMemo')

    const nodeGeoms = []
    const center = new THREE.Vector2()
    const vector2 = new THREE.Vector2()
    const vector2a = new THREE.Vector2()
    const vector2b = new THREE.Vector2()

    const circleRadius = 12500
    const oceanShape = new THREE.Shape()
      .moveTo(0, circleRadius)
      .quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
      .quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius)
      .quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0)
      .quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius)

    // nodeRows.map((nodes) => {
    //   nodes.map((node) => {
    //     const nodeShape = new THREE.Shape()
    //     const nodePoints = []
    //     for (let i = 0; i < 8; i++) {
    //       center.set(node.x, node.z)
    //       vector2.set(center.x + 40, center.y)
    //       vector2.rotateAround(center, (i * 45 + 22.5) * THREE.MathUtils.DEG2RAD)
    //       nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))
    //     }
    //     nodeShape.setFromPoints(nodePoints)
    //     const nodeGeom = new THREE.ShapeGeometry(nodeShape)
    //     nodeGeoms.push(nodeGeom)
    //   })
    // })

    // connections.map((connection) => {
    //   const nodeA = nodeRows[connection[0]][connection[1]]
    //   const nodeB = nodeRows[connection[2]][connection[3]]
    //   const connShape = new THREE.Shape()
    //   const connPoints = []

    //   vector2.set(nodeA.x, nodeA.z)
    //   vector2b.set(nodeB.x, nodeB.z)

    //   const pos = vector2a.set(nodeB.x, nodeB.z).sub(vector2)
    //   const angle = pos.angle() * THREE.MathUtils.RAD2DEG
    //   vector2a.copy(pos).normalize()

    //   //start left
    //   center.set(nodeA.x, nodeA.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle - 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //end left
    //   center.set(nodeB.x, nodeB.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 180 + 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //end right
    //   center.set(nodeB.x, nodeB.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 180 - 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //start right
    //   center.set(nodeA.x, nodeA.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   connShape.setFromPoints(connPoints)
    //   const connGeom = new THREE.ShapeGeometry(connShape)

    //   nodeGeoms.push(connGeom)
    // })
    
    sectionPoints.map((sectionPoint) => {
      let section = sectionPoint.slice().reverse();
      //Holes need reverse winding.
      const holePath = new THREE.Shape(section)
      oceanShape.holes.push(holePath)

      // const sectionShapeGeom = new THREE.ShapeGeometry(sectionShape)
      // nodeGeoms.push(sectionShapeGeom)
      
    },[])

    // deadends.map((deadend) => {
    //   const cutRadius = 60
    //   const cutShape = new THREE.Shape()
    //     .moveTo(0, cutRadius)
    //     .quadraticCurveTo(cutRadius, cutRadius, cutRadius, 0)
    //     .quadraticCurveTo(cutRadius, -cutRadius, 0, -cutRadius)
    //     .quadraticCurveTo(-cutRadius, -cutRadius, -cutRadius, 0)
    //     .quadraticCurveTo(-cutRadius, cutRadius, 0, cutRadius)
        
    //     const points = cutShape.getPoints()
    //     points.forEach((p) => p.add(new THREE.Vector2(deadend.x, -deadend.z)))
    //     const holePath = new THREE.Shape(points)
    //     oceanShape.holes.push(holePath)
    // })

    const oceanShapeGeom = new THREE.ShapeGeometry(oceanShape)
    nodeGeoms.push(oceanShapeGeom)

    geomRef.current = mergeBufferGeometries(nodeGeoms)

    // geomRef.current.computeBoundsTree();

    return geomRef.current
  }, [])

  const config = useMemo(
    () => ({
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 150, -1500),
      sunColor: 0x041e25,
      waterColor: 0x275980, //000b0e,
      distortionScale: 1.0,
      fog: false,
      format: gl.encoding,
      alpha: 1.0,
      size: 12,
    }),
    [waterNormals],
  )
  
  useFrame((state, delta) => {
    if (ref) {
      ref.current.material.uniforms.time.value += delta * 0.5

      if(geomRef.current) {
        //geomExport.current += 1
        if(geomExport.current === 400) {
          

    function save( link, blob, filename ) {

      link.href = URL.createObjectURL( blob );
      link.download = filename;
      link.click();
  }

  function saveArrayBuffer( link, buffer, filename ) {

      save( link, new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

  }
  const scene = ref.current
    const gltfExporter = new GLTFExporter();
    const options = {
        trs: true,
        onlyVisible: true,
        truncateDrawRange: false,
        binary: true,
        embedImages: false,
        includeCustomExtensions: true,
        maxTextureSize: Number( 64 ) || Infinity // To prevent NaN value
    };
    gltfExporter.parse(
        scene,
        function ( result ) {

            const link = document.createElement( 'a' );
            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer(link, result, 'scene.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                link.style.display = 'none';
                document.body.appendChild( link ); // Firefox workaround, see #6594
                const blob = new Blob( [ output ], {type:'text/plain'} );
                link.href = URL.createObjectURL( blob );
                link.download = 'scene.gltf';
                link.click();

            }

        },
        function ( error ) {

            console.log( 'An error happened during parsing', error );

        },
        options
    );
        }
        
      }
    }
  })
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />
}

CanalWater.displayName = 'CanalWater'

export { CanalWater }
