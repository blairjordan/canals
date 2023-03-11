
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import rodHookUrl from "../../Assets/models/rod_hook.glb";
import rodShapesUrl from "../../Assets/models/rod_shapes.glb";

class FishingRod {
    constructor(app) {
        this.app = app;

        this.ready = false
        this.fishingGroup = new THREE.Group();
        this.fishingGroup.rotation.order = "YXZ";
        this.vector3 = new THREE.Vector3()
        this.vector3b = new THREE.Vector3()
        this.vector3c = new THREE.Vector3()
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
    
        const gltfRodArm = await loader.loadAsync(rodShapesUrl);
        const rod = gltfRodArm.scene.getObjectByName('decor_fishing_rod_01001_rod')
        
        this.rod = rod
        this.rodDict = rod.morphTargetDictionary
        this.rodInfluences = rod.morphTargetInfluences
        this.app.scene.add(gltfRodArm.scene);
        this.gltfRodArm = gltfRodArm.scene;
        this.gltfRodArm.rotateY(Math.PI)
    //     this.rodBoneTip = b9
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
            this.gltfRodArm.position.copy(this.app.player.playerGroup.position)
            this.gltfRodArm.rotation.copy(this.app.player.playerGroup.rotation)
            this.gltfRodArm.rotateY(Math.PI)
            
            const casting = Math.sin(this.time*5) 
            this.rodInfluences[0] = Math.max(casting, 0)
            this.rodInfluences[1] = 0 + (casting < 0 ? Math.abs(casting) : 0)

            this.vector3.fromBufferAttribute( this.rod.geometry.attributes.position, 100 );
            this.vector3b.fromBufferAttribute( this.rod.geometry.morphAttributes.position[0], 100 );
            this.vector3c.fromBufferAttribute( this.rod.geometry.morphAttributes.position[1], 100 );
            
            this.rod.localToWorld(this.vector3)
            this.helperObject.position.set(0,0,0)
            this.helperObject.rotation.set(0,0,0)
            this.helperObject.rotateY(Math.PI+this.app.player.playerGroup.rotation.y)
            this.helperObject.localToWorld(this.vector3b)
            this.helperObject.localToWorld(this.vector3c)
            this.vector3b.multiplyScalar(this.rodInfluences[0]) 
            this.vector3c.multiplyScalar(this.rodInfluences[1]) 
            this.vector3.add(this.vector3b)
            this.vector3.add(this.vector3c)

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