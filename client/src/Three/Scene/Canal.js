import * as THREE from "three";
//import { Clipper } from "../Utils/clipper";
import { getIntersectionOnAPoint, lerpValues, randomIndex, shuffle } from "../Utils/utils";
import { CanalNode } from "./CanalNode";


class Canal {
  constructor(app) {
    this.app = app;

    this.vector2 = new THREE.Vector2();
    this.vector2a = new THREE.Vector2();
    this.vector2b = new THREE.Vector2();
    this.vector3 = new THREE.Vector3();

    // this.clipper = new Clipper(app);
    // this.clipper.init();

    this.nodes = [];
    this.connections = []
    this.nodesBuilt = [];
    this.waterGeometries = [];

    //temp boats
    this.boats = []
  }

  generateNetwork(rand) {
    //generate all the node positions
    //this.nodes.push(new CanalNode(this, new THREE.Vector3(0, 0, 0), 40));
    for (let i = -15; i < 15; i++) {
      for (let j = -15; j < 15; j++) {
        let x = i * 500;
        let z = j * 500;
        this.vector2a.set(x, z);
        if (this.vector2.distanceTo(this.vector2a) < 7501) {
          this.nodes.push(new CanalNode(this, new THREE.Vector3(x, 0, z), 40, i, j));
        }
      }
    }

    //Find connections (snap to)
    for (let i = 0; i < this.nodes.length; i++) {
      this.vector2.set(this.nodes[i].position.x, this.nodes[i].position.z);
      this.vector2a.set(this.nodes[i].position.x, this.nodes[i].position.z);
      this.vector2a.sub(this.vector2);
      const closestByLength = {
        d45: { id: -1, dist: 10000 },
        d90: { id: -1, dist: 10000 },
        d135: { id: -1, dist: 10000 },
        d180: { id: -1, dist: 10000 },
        d225: { id: -1, dist: 10000 },
        d270: { id: -1, dist: 10000 },
        d315: { id: -1, dist: 10000 },
        d360: { id: -1, dist: 10000 },
      };
      for (let j = 0; j < this.nodes.length; j++) {
        if (i !== j) {
         this.vector2a.set(this.nodes[j].position.x, this.nodes[j].position.z);
          this.vector2b.set(this.nodes[j].position.x, this.nodes[j].position.z);
          this.vector2b.sub(this.vector2);
          let angle = this.vector2b.angle() * THREE.MathUtils.RAD2DEG;

          this.vector2b.set(this.nodes[j].position.x, this.nodes[j].position.z);
          let dist = this.vector2.distanceTo(this.vector2b);

          if (angle > 44 && angle < 46) {
            if (dist < closestByLength.d45.dist) {
              closestByLength.d45.id = j;
              closestByLength.d45.dist = dist;
            }
          } else if (angle > 89 && angle < 91) {
            if (dist < closestByLength.d90.dist) {
              closestByLength.d90.id = j;
              closestByLength.d90.dist = dist;
            }
          } else if (angle > 134 && angle < 136) {
            if (dist < closestByLength.d135.dist) {
              closestByLength.d135.id = j;
              closestByLength.d135.dist = dist;
            }
          } else if (angle > 179 && angle < 181) {
            if (dist < closestByLength.d180.dist) {
              closestByLength.d180.id = j;
              closestByLength.d180.dist = dist;
            }
          } else if (angle > 224 && angle < 226) {
            if (dist < closestByLength.d225.dist) {
              closestByLength.d225.id = j;
              closestByLength.d225.dist = dist;
            }
          } else if (angle > 269 && angle < 271) {
            if (dist < closestByLength.d270.dist) {
              closestByLength.d270.id = j;
              closestByLength.d270.dist = dist;
            }
          } else if (angle > 315 && angle < 316) {
            if (dist < closestByLength.d315.dist) {
              closestByLength.d315.id = j;
              closestByLength.d315.dist = dist;
            }
          } else if ((angle > 359 && angle < 361) || (angle > -1 && angle < 1)) {
            if (dist < closestByLength.d360.dist) {
              closestByLength.d360.id = j;
              closestByLength.d360.dist = dist;
            }
          }
        }
      }

      let order = [0, 1, 2, 3, 4, 5, 6, 7];
      order = shuffle(order, rand);

      if(this.nodes[i].x % 2 === 0) {
        order = [0,2,4,6];
        order = shuffle(order, rand);
        let tempOrder = [1,3,5,7]
        tempOrder = shuffle(tempOrder, rand);
        order.push(tempOrder);
      }
      else if(this.nodes[i].y % 2 === 0) {
        order = [1,3,5,7];
        order = shuffle(order, rand);
        let tempOrder = [0,2,4,6]
        tempOrder = shuffle(tempOrder, rand);
        order.push(tempOrder);
      }

      const count = 4; //due to both ends have 3x randomness then you will end up with between 3-6 connections on each node.
      let chances = [false, false, false, false, false, false, false, false];
      for (let i = 0; i < count; i++) {
        chances[order[i]] = true
      }
      
      if (closestByLength.d45.id >= 0) {
        if (closestByLength.d45.dist < 1000) {
          if (chances[0]) {
            this.nodes[closestByLength.d45.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d45.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d45.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d45.id]])
            }
          }
        }
      }
      if (closestByLength.d90.id >= 0) {
        if (closestByLength.d90.dist < 1000) {
          if (chances[1]) {
            this.nodes[closestByLength.d90.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d90.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d90.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d90.id]])
            }
          }
        }
      }
      if (closestByLength.d135.id >= 0) {
        if (closestByLength.d135.dist < 1000) {
          if (chances[2]) {
            this.nodes[closestByLength.d135.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d135.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d135.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d135.id]])
            }
          }
        }
      }
      if (closestByLength.d180.id >= 0) {
        if (closestByLength.d180.dist < 1000) {
          if (chances[3]) {
            this.nodes[closestByLength.d180.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d180.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d180.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d180.id]])
            }
          }
        }
      }
      if (closestByLength.d225.id >= 0) {
        if (closestByLength.d225.dist < 1000) {
          if (chances[4]) {
            this.nodes[closestByLength.d225.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d225.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d225.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d225.id]])
            }
          }
        }
      }
      if (closestByLength.d270.id >= 0) {
        if (closestByLength.d270.dist < 1000) {
          if (chances[5]) {
            this.nodes[closestByLength.d270.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d270.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d270.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d270.id]])
            }
          }
        }
      }
      if (closestByLength.d315.id >= 0) {
        if (closestByLength.d315.dist < 1000) {
          if (chances[6]) {
            this.nodes[closestByLength.d315.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d315.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d315.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d315.id]])
            }
          }
        }
      }
      if (closestByLength.d360.id >= 0) {
        if (closestByLength.d360.dist < 1000) {
          if (chances[7]) {
            this.nodes[closestByLength.d360.id].nodes.push(this.nodes[i]);
            this.nodes[i].nodes.push(this.nodes[closestByLength.d360.id]);

            if(!this.containsConnection(this.connections, this.nodes[i], this.nodes[closestByLength.d360.id])) {
                this.connections.push([this.nodes[i], this.nodes[closestByLength.d360.id]])
            }
          }
        }
      }
    }

    //remove intersecting lines... (don't really need to)
    const intersected = [];
    console.log(this.connections.length);
    for (let i = 0; i < this.connections.length; i++) {
        for (let j = 0; j < this.connections.length; j++) {
            const intersect = getIntersectionOnAPoint(this.connections[i][0].positionV2(), this.connections[i][1].positionV2(),
            this.connections[j][0].positionV2(), this.connections[j][1].positionV2());
           
            if(intersect!==null) {
                intersected.push(i);
            }
        }
    }
    console.log(intersected.length);
    

    //Clipper is shit slow
    //this.clipper.offsetLinesAndUnion(this.connections);

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeGeom = this.nodes[i].generateNode();
      if(nodeGeom) {
        this.waterGeometries.push(nodeGeom);

        const b = this.nodes[i].connectedNodes[randomIndex(0, this.nodes[i].connectedNodes.length-1)]
        if(b) {
            const boatAngle = this.nodes[i].angleTo(b)

            const boatGoem = new THREE.CylinderGeometry(2, 4, 21.9, 8, 8);
            boatGoem.rotateX(Math.PI*0.5)
            const mesh = new THREE.Mesh(boatGoem, new THREE.MeshBasicMaterial({ color:0x2220f9, transparent: true, opacity:0.5}));
            mesh.position.set(this.nodes[i].position.x, this.nodes[i].position.y, this.nodes[i].position.z)
            mesh.rotation.y = boatAngle
            mesh.a = b
            mesh.b = this.nodes[i]
            mesh.c = 0.2 + Math.random()*0.6
            mesh.d = 1
            mesh.e = new THREE.Vector3().copy(b.position)
            const axesHelper = new THREE.AxesHelper( 5 );
            mesh.add(axesHelper)
            this.boats.push(mesh)
            this.app.scene.add(mesh);
        }
      }
    }
  }

  update(delta) {
    //boats on the canal
    if(this.boats) {
        for(let i = 0; i < this.boats.length; i++) {
            const dist = this.boats[i].a.position.distanceTo(this.boats[i].b.position)
            const step = (1.0/dist) * 0.5

            if(this.boats[i].d > 0) {
                this.boats[i].c = Math.min(1, this.boats[i].c+step)
                this.boats[i].position.lerpVectors(this.boats[i].a.position, this.boats[i].b.position, this.boats[i].c)
                this.boats[i].lookAt(this.boats[i].e)

                const c = lerpValues(0, 1, (1-this.boats[i].c) * 10)
                if(this.boats[i].c >= 0.9) {
                    this.boats[i].rotateY((1-c) * Math.PI)
                }

                if(this.boats[i].c >= 1) {
                    this.boats[i].c = 0;
                    this.boats[i].d = -1
                    this.boats[i].e.copy(this.boats[i].b.position)
                }
            }
            else if(this.boats[i].d < 0) {
                this.boats[i].c = Math.min(1, this.boats[i].c+step)
                this.boats[i].position.lerpVectors(this.boats[i].b.position, this.boats[i].a.position, this.boats[i].c)
                this.boats[i].lookAt(this.boats[i].e)
                
                const c = lerpValues(0, 1, (1-this.boats[i].c) * 10)
                if(this.boats[i].c >= 0.9) {
                    this.boats[i].rotateY((1-c) * Math.PI)
                }
                
                if(this.boats[i].c >= 1) {
                    this.boats[i].c = 0;
                    this.boats[i].d = 1
                    this.boats[i].e.copy(this.boats[i].a.position)
                }
            }
        }
    }
  }


  containsConnection(arr, a, b) {
    let contains = false;
    for(let i = 0; i < arr.length; i++) {
        if((arr[i][0].nodeId === a.nodeId && arr[i][1].nodeId === b.nodeId)
         || (arr[i][0].nodeId === b.nodeId && arr[i][1].nodeId === a.nodeId)) {
            contains = true;
            break;
        }
    }

    return contains;
  }
  
}

export { Canal };
