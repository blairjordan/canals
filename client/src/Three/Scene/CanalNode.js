import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

//A node point that is part of a network of nodes
class CanalNode {
  constructor(network, position, nodeWidth, x, y) {
    this.nodeId = CanalNode.nodeIdCounter++;
    this.x = x;
    this.y = y;

    this.network = network;
    this.nodes = [];
    this.connectedNodes = [];

    this.mesh = null;
    this.nodeWidth = nodeWidth;
    this.position = position;
    this.angle = 0;

    this.nodeLookup = {
      d45: -1,
      d90: -1,
      d135: -1,
      d180: -1,
      d225: -1,
      d270: -1,
      d315: -1,
      d360: -1,
    };

    this.matrix4 = new THREE.Matrix4();
    this.vector3a = new THREE.Vector3();
    this.vector3b = new THREE.Vector3();
    this.vector2 = new THREE.Vector2();
    this.vector2a = new THREE.Vector2();
    this.vector2b = new THREE.Vector2();
  }

  static nodeIdCounter = 0;

  generateNode() {
    //this node point
    this.vector2.set(this.position.x, this.position.z);
    const nodeShape = new THREE.Shape();
    const nodePoints = [];

    const center = new THREE.Vector2(this.position.x, this.position.z);

    for (let i = 0; i < this.nodes.length; i++) {
      //connected node point

      this.vector2b.set(this.nodes[i].position.x, this.nodes[i].position.z);
      const pos = this.vector2a
        .set(this.nodes[i].position.x, this.nodes[i].position.z)
        .sub(this.vector2);
      const angle = pos.angle() * THREE.MathUtils.RAD2DEG;
      this.nodes[i].angle = angle;

      if (angle > 44 && angle < 46) {
        this.nodeLookup.d45 = this.nodes[i].nodeId;
      } else if (angle > 89 && angle < 90) {
        this.nodeLookup.d90 = this.nodes[i].nodeId;
      } else if (angle > 134 && angle < 136) {
        this.nodeLookup.d135 = this.nodes[i].nodeId;
      } else if (angle > 179 && angle < 181) {
        this.nodeLookup.d180 = this.nodes[i].nodeId;
      } else if (angle > 224 && angle < 226) {
        this.nodeLookup.d225 = this.nodes[i].nodeId;
      } else if (angle > 269 && angle < 271) {
        this.nodeLookup.d270 = this.nodes[i].nodeId;
      } else if (angle > 314 && angle < 316) {
        this.nodeLookup.d315 = this.nodes[i].nodeId;
      } else if ((angle > 359 && angle < 361) || (angle > -1 && angle < 1)) {
        this.nodeLookup.d360 = this.nodes[i].nodeId;
      }
    }

    this.nodes.sort(this.compare);

    const usedAngles = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.containsAngle(usedAngles,this.nodes[i].angle + 22.5)) {
        center.set(this.position.x, this.position.z);
        this.vector2.set(center.x + this.nodeWidth, center.y);
        this.vector2.rotateAround(
          center,
          (this.nodes[i].angle - 22.5) * THREE.MathUtils.DEG2RAD
        );
        usedAngles.push(this.nodes[i] - 22.5);
        nodePoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));
      }
      if (!this.containsAngle(usedAngles, this.nodes[i].angle - 22.5)) {
        center.set(this.position.x, this.position.z);
        this.vector2.set(center.x + this.nodeWidth, center.y);
        this.vector2.rotateAround(
          center,
          (this.nodes[i].angle + 22.5) * THREE.MathUtils.DEG2RAD
        );
        usedAngles.push(this.nodes[i] + 22.5);
        nodePoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));
      }
    }

    const nodeGeoms = [];

    //End point, we could make it square or trianglar
    if (nodePoints.length === 2) {
      this.vector2.set(center.x, center.y);
      nodePoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));
    }
    
    if (nodePoints.length > 2) {
      //make curved, has issues.

      nodeShape.setFromPoints(nodePoints);
      const nodeGeom = new THREE.ShapeGeometry(nodeShape);
      nodeGeoms.push(nodeGeom);
    }

    for (let i = 0; i < this.nodes.length; i++) {
      let alreadyConnected = false;
      for (let x = 0; x < this.network.nodesBuilt.length; x++) {
        if (
          (this.network.nodesBuilt[x].a === this.nodeId &&
            this.network.nodesBuilt[x].b === this.nodes[i].nodeId) ||
          (this.network.nodesBuilt[x].b === this.nodeId &&
            this.network.nodesBuilt[x].a === this.nodes[i].nodeId)
        ) {
          alreadyConnected = true;
          break;
        }
      }

      if (alreadyConnected) {
        break;
      }

      this.connectedNodes.push(this.nodes[i])
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff0000,
      });
      const points = [];
      const v1 = new THREE.Vector3(this.position.x, 0, this.position.z);
      let v2 = new THREE.Vector3(
        this.nodes[i].position.x,
        0,
        this.nodes[i].position.z
      );
      v2 = v2.lerp(v1,0.4)
      points.push(v1);
      points.push(v2);

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(lineGeo, lineMat);
      //this.network.app.scene.add(line);

      this.network.nodesBuilt.push({ a: this.nodeId, b: this.nodes[i].nodeId });

      const connShape = new THREE.Shape();
      const connPoints = [];

      this.vector2.set(this.position.x, this.position.z);
      this.vector2b.set(this.nodes[i].position.x, this.nodes[i].position.z);
      //const dist = this.vector2.distanceTo(this.vector2b)
      const pos = this.vector2a
        .set(this.nodes[i].position.x, this.nodes[i].position.z)
        .sub(this.vector2);
      const angle = pos.angle() * THREE.MathUtils.RAD2DEG;
      this.vector2a.copy(pos).normalize();

      //start mid (creates peaks, which sucks)
      //   center.set(this.position.x, this.position.z);
      //   this.vector2.set(center.x, center.y);
      //   this.vector2.rotateAround(
      //     center,
      //     (angle) * THREE.MathUtils.DEG2RAD
      //   );
      //   connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));

      //start left
      center.set(this.position.x, this.position.z);
      this.vector2.set(center.x + this.nodeWidth, center.y);
      this.vector2.rotateAround(
        center,
        (angle - 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));


      //end left
      center.set(this.nodes[i].position.x, this.nodes[i].position.z);
      //center.set(lerpValues(this.position.x, this.nodes[i].position.x, 0.5), lerpValues(this.position.z, this.nodes[i].position.z, 0.5));
      this.vector2.set(center.x + this.nodeWidth, center.y);
      this.vector2.rotateAround(
        center,
        (angle + 180 + 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));

      //end mid (creates peaks)
      //   center.set(this.nodes[i].position.x, this.nodes[i].position.z);
      //   this.vector2.set(center.x, center.y);
      //   this.vector2.rotateAround(
      //     center,
      //     (angle + 180) * THREE.MathUtils.DEG2RAD
      //   );
      //   connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));

      //end right
      center.set(this.nodes[i].position.x, this.nodes[i].position.z);
      //center.set(lerpValues(this.position.x, this.nodes[i].position.x, 0.5), lerpValues(this.position.z, this.nodes[i].position.z, 0.5));
      this.vector2.set(center.x + this.nodeWidth, center.y);
      this.vector2.rotateAround(
        center,
        (angle + 180 - 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));

      //start right
      center.set(this.position.x, this.position.z);
      this.vector2.set(center.x + this.nodeWidth, center.y);
      this.vector2.rotateAround(
        center,
        (angle + 22.5) * THREE.MathUtils.DEG2RAD
      );
      connPoints.push(new THREE.Vector2(this.vector2.x, -this.vector2.y));

      connShape.setFromPoints(connPoints);
      const connGeom = new THREE.ShapeGeometry(connShape);

      // if(angle>44 && angle < 46) //east
      // {
      //     connGeom.translate(0,0,4);
      // }
      // if(angle>134 && angle < 136) //south
      // {
      //     connGeom.translate(0,0,8);
      // }
      // if(angle>224 && angle < 226) //south
      // {
      //     connGeom.translate(0,0,12);
      // }
      // if(angle>314 && angle < 316) //south
      // {
      //     connGeom.translate(0,0,16);
      // }

      nodeGeoms.push(connGeom);
    }

    if (nodeGeoms.length === 0) {
      return null;
    }

    const waterGeometry = mergeBufferGeometries(nodeGeoms);

    return waterGeometry;
  }

  angleTo(b) {
    
    this.vector2.set(this.position.x-b.position.x, this.position.z-b.position.z);
    const angle = this.vector2.angle()
    
    return angle;
  }

  compare(a, b) {
    if (a.angle < b.angle) {
      return -1;
    }
    if (a.angle > b.angle) {
      return 1;
    }
    return 0;
  }

  containsAngle(arr, angle) {
    const margin = 0.05
    let contains = false;
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] > angle-margin && arr[i] < angle+margin) {
            contains = true;
            break;
        }
    }

    return contains;
  }

  positionV2() {
    return {x : this.position.x, y: this.position.z};
  }

  positionVec2() {
    return new THREE.Vector2(this.position.x, this.position.z);
  }
}

export { CanalNode };
