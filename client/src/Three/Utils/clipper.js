//install js-angusj-clipper if we want to use this for something

// import * as clipperLib from "js-angusj-clipper/web";
// import * as THREE from "three";
// import { rotateAroundPoint } from "./utils";

class Clipper {
  constructor(app) {
    this.app = app;
    // this.clipper = null;

    // this.offsetLinesAndUnion = this.offsetLinesAndUnion.bind(this);
    // this.init();

    // this.vector2a = new THREE.Vector2()
    // this.vector2b = new THREE.Vector2()
    // this.vector2c = new THREE.Vector2()
    // this.vector2d = new THREE.Vector2()
  }

//   async init() {
//     this.clipper = await clipperLib.loadNativeClipperLibInstanceAsync(
//       // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
//       clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
//     );

//   }

//   async offsetLinesAndUnion(lines) {

//     await new Promise(resolve => setTimeout(resolve, 1000));

//     let formattedInputPolygon = [];

//     const scale = 1000
//     for(let i = 0; i < lines.length; i++) {
//         var p1 = lines[i][0].positionVec2();
//         var p2 = lines[i][1].positionVec2();

//         var p3 = p2.sub(p1);

//         this.vector2a.set(p1.x+20, p1.y)
        

//         const angle = Math.atan2(p3.y, p3.x)
//         var rect = []
//         this.vector2a.set(p1.x+20, p2.y)
//         rotateAroundPoint(p1, this.vector2a, angle)
//         rect.push({ x: Math.round(this.vector2a.x * scale), y: Math.round(this.vector2a.y * scale) })
//         this.vector2a.set(p1.x+20, p2.y)
//         rotateAroundPoint(p1, this.vector2a, angle+Math.PI)
//         rect.push({ x: Math.round(this.vector2a.x * scale), y: Math.round(this.vector2a.y * scale) })
//         this.vector2a.set(p1.x+20, p2.y)
//         rotateAroundPoint(p2, this.vector2a, angle+Math.PI)
//         rect.push({ x: Math.round(this.vector2a.x * scale), y: Math.round(this.vector2a.y * scale) })
//         this.vector2a.set(p2.x+20, p2.y)
//         rotateAroundPoint(p2, this.vector2a, angle)
//         rect.push({ x: Math.round(this.vector2a.x * scale), y: Math.round(this.vector2a.y * scale) })
        
//         formattedInputPolygon.push(rect)
//     }
    
//     const offsetPaths = this.clipper.clipToPaths({
//         clipType: clipperLib.ClipType.Union,
//         subjectFillType: clipperLib.PolyFillType.EvenOdd,
//         subjectInputs: [
//             {
//                 data: formattedInputPolygon,
//                 closed: true 
//             }
//         ]
//     });
    
//     let nextOutsideShape = null;
//     for(let  i = 0 ;i < offsetPaths.length; i++) {
//         const orientation = this.clipper.orientation(offsetPaths[i]);

//         var connPoints = [];
//         for(let j = 0; j < offsetPaths[i].length; j++) {
//             connPoints.push(new THREE.Vector2(offsetPaths[i][j].x / scale, offsetPaths[i][j].y / scale))
//         }
//         //Close loop
//         if(connPoints.length>0) {
//             connPoints.push(new THREE.Vector2(offsetPaths[i][0].x / scale, offsetPaths[i][0].y / scale))
//         }
//         if(!orientation) {
//             const temp = new THREE.Path();
//             connPoints = temp.setFromPoints(connPoints);
//         }

//         //if no nextOutsideShape exists (can assume we are on first outside shape)
//         if(nextOutsideShape===null) {
//             if(orientation) { //current is outside shape
//                 nextOutsideShape = new THREE.Shape();
//                 nextOutsideShape.setFromPoints(connPoints);

//             } 
//             else { //current is a hole
//                 console.error("can't start with a hole");
//                 //nextOutsideShape.holes.push(connPoints);
//             }
//         } else { //we have a shape
//             if(orientation) {
//                 //next is a new outside piece
//                 //console.log(nextOutsideShape)
//                 // const connGeom = new THREE.ShapeGeometry(nextOutsideShape);
//                 // const mesh = new THREE.Mesh(connGeom, new THREE.MeshBasicMaterial({ color:0xf920f9}));
//                 // mesh.rotation.x = -Math.PI / 2;
//                 // this.app.scene.add(mesh);

//                 nextOutsideShape = new THREE.Shape();
//                 nextOutsideShape.setFromPoints(connPoints);
//             } else {
//                 nextOutsideShape.holes.push(connPoints);
//                 if(i === offsetPaths.length - 1) {
//                     // const connGeom = new THREE.ShapeGeometry(nextOutsideShape);
//                     // const mesh = new THREE.Mesh(connGeom, new THREE.MeshBasicMaterial({ color:0xf920f9}));
//                     // mesh.rotation.x = -Math.PI / 2;
//                     // this.app.scene.add(mesh);
//                 }
//             }

//         }
        
//     }

//     // const nodeShape = new THREE.Shape();
//     // var connPoints = [];
//     // for(let i = 0; i < outputPolygon.polylines[0].points.length; i++) {
//     //     connPoints.push(new THREE.Vector2(outputPolygon.polylines[0].points[i][0] / scale, outputPolygon.polylines[0].points[i][1] / scale))
//     // }


//   }
}

export { Clipper };
