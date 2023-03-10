
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import rodHookUrl from "../../Assets/models/rod_hook.glb";
import rodArmatureUrl from "../../Assets/models/rod_armature.glb";

class FishingRod {
    constructor(app) {
        this.app = app;

        this.ready = false
        this.fishingGroup = new THREE.Group();
        this.fishingGroup.rotation.order = "YXZ";
        this.vector3 = new THREE.Vector3()
        this.vector3b = new THREE.Vector3()
        this.helperObject = new THREE.Object3D();
        this.time = 0;

        this.rodBones = [];
        this.hook = null;
        this.gltfRodArm = null;

        this.init = this.init.bind(this);
    }

    async init(callback = null) {

        await this.loadFishingGear();
        this.initPhysics()

        this.app.scene.add(this.fishingGroup);

        this.ready = true

        if(callback) {
          callback()
        }
    }

    async loadFishingGear() {

        const loader = new GLTFLoader();

        this.rod = [];
        const gltfRod = await loader.loadAsync(rodHookUrl);
        gltfRod.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity=0.4
            child.material.transparent = true
            child.visible = false;
            switch (child.name) {
              case "Rod_01":
                this.rod.push(child);
                break;
              case "Rod_02":
                this.rod.push(child);
                break;
              case "Rod_03":
                this.rod.push(child);
                break;
              case "Rod_04":
                this.rod.push(child);
                break;
              case "Rod_05":
                this.rod.push(child);
                break;
              case "Rod_06":
                this.rod.push(child);
                break;
              case "Rod_07":
                this.rod.push(child);
                break;
              case "Rod_08":
                this.rod.push(child);
                break;
              case "Rod_09":
                this.rod.push(child);
                break;
              case "Hook":
                child.visible = true;
                this.hook = child;
                this.hook.rotateY(Math.PI * -0.5);
                break;
            }
          }
        });
        this.app.scene.add(gltfRod.scene);
    
        const gltfRodArm = await loader.loadAsync(rodArmatureUrl);
        this.app.scene.add(gltfRodArm.scene);
        this.gltfRodArm = gltfRodArm.scene;
        const b1 = gltfRodArm.scene.getObjectByName('B1')
        const b2 = gltfRodArm.scene.getObjectByName('B2')
        const b3 = gltfRodArm.scene.getObjectByName('B3')
        const b4 = gltfRodArm.scene.getObjectByName('B4')
        const b5 = gltfRodArm.scene.getObjectByName('B5')
        const b6 = gltfRodArm.scene.getObjectByName('B6')
        const b7 = gltfRodArm.scene.getObjectByName('B7')
        const b8 = gltfRodArm.scene.getObjectByName('B8')
        this.rodBones = [b1,b2,b3,b4,b5,b6,b7]
        this.rodBoneTip = b8
    }

    initPhysics() {

          const lineMat = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 2,
          });
          const points = [];
          const v1 = new THREE.Vector3(
            0,0,0
          );
          let v2 = new THREE.Vector3(
            0,0,0
          );
          points.push(v1);
          points.push(v2);
    
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    
          const line = new THREE.Line(lineGeo, lineMat);
          line.frustumCulled = false;
          line.points = points;
          this.fishingLine = line
          this.fishingLinePoints = points;
          this.app.scene.add(line);
      }

      updatePhysics(delta) {
 
        //Just doing a poor mans rod casting now
          if(this.gltfRodArm) {
            this.helperObject.position.copy(this.app.player.playerGroup.position)
            this.helperObject.rotation.copy(this.app.player.playerGroup.rotation)
            this.helperObject.translateZ(-6.5)
            this.gltfRodArm.position.copy(this.helperObject.position)
            //base of rod
            this.gltfRodArm.rotation.set(0,0,0)
            this.gltfRodArm.rotateY((Math.PI * -0.5))
            this.gltfRodArm.rotateX(Math.sin(this.time)*0.5)
            
            for(let i = 1; i < 7; i++) {
              this.rodBones[i].rotation.set(0,0,0)
              this.rodBones[i].rotateX(Math.PI * (Math.sin(this.time*2)*0.1) * (i/8))
            }
            this.rodBoneTip.getWorldPosition(this.vector3);
            
            const distToBoat = this.hook.position.distanceTo(this.app.player.playerGroup.position)
            if(distToBoat > 20) {
                const offsetDist = (distToBoat-20) * delta * 10
                this.helperObject.position.copy(this.hook.position)
                this.helperObject.lookAt(this.app.player.playerGroup.position.x, this.hook.position.y, this.app.player.playerGroup.position.z)
                this.helperObject.translateZ(offsetDist)
                this.hook.position.copy(this.helperObject.position)
                this.hook.lookAt(this.vector3.x, 0, this.vector3.z)
                this.hook.rotateX(0.75)
            }

            this.fishingLinePoints[0].copy(this.vector3)
            this.fishingLinePoints[1].copy(this.hook.position)
            this.fishingLine.geometry.setFromPoints(
                this.fishingLinePoints
            );
            this.fishingLine.geometry.attributes.position.needsUpdate = true;
  
          }
      }

      update(delta) {
        this.time += delta;
        this.updatePhysics(delta);
      }


}

export { FishingRod }