import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import { BaseScene } from "./BaseScene";
import { Water } from "../Objects/Water";
import { Sky } from "../Objects/Sky";

import waterNormals from "../../Assets/textures/waternormals.jpg";
import waterWake from "../../Assets/textures/wake.png";

import TWEEN from "@tweenjs/tween.js";
import { Connectivity } from "../../Server/IO";
import { GamePads } from "../Controls/GamePads";
import { cyrb128, sfc32 } from "../Utils/utils";
import { Canal } from "./Canal";
import { Player } from "../Objects/Player";
import { OrbitControls } from "../Controls/OrbitControls";
import MeshLine from "../Utils/MeshLine";
import MeshLineMaterial from "../Utils/MeshLineMaterial";
import TrailRenderer from "../Utils/trailRenderer";

class TestScene extends BaseScene {
  constructor(playerData, updateSpeed) {
    super();

    this.playerData = playerData;
    this.updateSpeed = updateSpeed;

    this.water = null;
    this.sun = null;
    this.meshes = [];

    //Calulating speed
    this.frameCounter = 0;
    this.lastSpeedCheckPos = new THREE.Vector3();
    this.lastSpeedCheckTime = 0

    this.vector3 = new THREE.Vector3();
    this.lastPlayerPosition = new THREE.Vector3();
    this.currentPlayerPosition = new THREE.Vector3();

    this.updateSun = this.updateSun.bind(this);
  }

  init() {
    super.init();

    this.sun = new THREE.Vector3();

    //Canal Network - random generation using this.canalRand seed
    this.canalNetwork = new Canal(this);
    this.canalNetwork.generateNetwork(this.canalRand)
    
    const waterGeometry = mergeBufferGeometries(this.canalNetwork.waterGeometries);

    // Water
    this.water = new Water(waterGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: new THREE.TextureLoader().load(
        waterNormals,
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xaca996,
      waterColor: 0x000607, //001e0f,
      distortionScale: 8.0,
      fog: this.scene.fog !== undefined,
      alpha: 0.8,
      size: 6,
    });
    //this.water.material.wireframe = true
    this.water.rotation.x = -Math.PI / 2;

    this.scene.add(this.water);

    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);

    const skyUniforms = this.sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    this.parameters = {
      elevation: 2,
      azimuth: 180,
    };

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    //
    const c = 9;
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    

    for (let z = -20; z < 20; z++) {
      for (let x = -20; x < 20; x++) {
        const material = new THREE.MeshStandardMaterial({
          roughness: 0,
          color: new THREE.Color("hsl(" + c * (x + 20) + ", 100%, 50%)"),
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.scale.set(
          1 + Math.abs(x) * 0.2,
          1 + Math.abs(x) * 0.2,
          1 + Math.abs(x) * 0.2
        );
        mesh.position.set(
          x * 100,
          Math.sin(Math.random() * 5) * 20 + 5,
          z * 100
        );
        mesh.timeOffset = Math.random() * 3;
        // this.meshes.push(mesh);
        // this.scene.add(mesh);
      }
    }

    //

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.target.set( 0, 5, 0 );
    this.controls.minDistance = 10.0;
    this.controls.maxDistance = 80.0;

    this.updateSun();

    this.initControls();

    this.initPlayer();
  }

  async getWaterTrialTexture() {
      const map = await this.texLoader.loadAsync( waterWake );
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      return map;
  }

  initPlayer() {
    const transform = (typeof this.playerData.position === 'object') ? this.playerData.position : JSON.parse(this.playerData.position)
    this.player = new Player(this, this.playerData);
    this.player.init(this.addWake.bind(this));

    this.connectivity = new Connectivity(this, this.player.playerGroup);
    this.connectivity.init();
    this.connectivity.players.push(this.player)


    this.lastPlayerPosition.copy(this.player.playerGroup.position)
    this.gamepads.gamePad.boatTargetObject.position.set(
      Number(transform.x),
      Number(transform.z), 
      Number(transform.y))
    if(transform.r) this.gamepads.gamePad.boatTargetObject.rotation.y = transform.r

    this.player.playerGroup.position.copy(this.gamepads.gamePad.boatTargetObject.position);

    this.currentPlayerPosition.copy(this.player.playerGroup.position)
    this.currentPlayerPosition.sub(this.lastPlayerPosition)

    this.camera.position.add(this.currentPlayerPosition)

    this.controls.target.copy(this.player.playerGroup.position);
  }

  async addWake() {
    this.waterTrial = await this.getWaterTrialTexture();

    const points = [];
    for (let j = 0; j < 120; j++) {
      points.push(new THREE.Vector3(this.player.playerGroup.position.x+(j*0.1), 0.1, this.player.playerGroup.position.z+(j*0.1)));
    }

    const line = new MeshLine();
    const trailGeom = new THREE.BufferGeometry()
    trailGeom.setFromPoints(points, p => 1-p)
    trailGeom.computeBoundingBox()
    line.setGeometry(trailGeom);
    let lineMaterial = new MeshLineMaterial({
        color: new THREE.Color('white'),
        map: this.waterTrial,
        useMap: 1,
        alphaMap: this.waterTrial,
        useAlphaMap: 1,
        transparent:true,
        opacity: 1.0,
        //alphaTest: 0.2,
        repeat: new THREE.Vector2(1,1),
        resolution: new THREE.Vector2(window.innerWidth,window.innerHeight),
        sizeAttenuation: false,
        lineWidth: 1200,
        length: 360,
        // near: this.camera.near,
        // far: this.camera.far
      });
    lineMaterial.fog = false;
    const mesh = new THREE.Mesh(line, lineMaterial);
    mesh.frustumCulled = false;
    mesh.visible = false;
    mesh.renderOrder = -1;
    this.scene.add(mesh);



    var trailPoint = new THREE.Object3D();
    this.player.playerGroup.add(trailPoint)
    trailPoint.translateZ(-6)
    trailPoint.translateY(0.1)

    var trailRenderer = new TrailRenderer( this.scene, false );
    var trailLength = 20+Math.floor(Math.random() * 2);
    var trailMaterial = trailRenderer.createTexturedMaterial();	
    trailMaterial.uniforms.textureMap.value = this.waterTrial;
    trailMaterial.uniforms.headColor.value.set(1.0, 1.0, 1.0, 0.4)
    trailMaterial.uniforms.tailColor.value.set(1.0, 1.0, 1.0, 0.0)
    trailMaterial.uniforms.lengthScale.value = 0.25;

    const width =0.5;
    trailMaterial.side = THREE.DoubleSide;
    var trailHeadGeometry = [];
    trailHeadGeometry.push( 
        new THREE.Vector3(width, 0.0, 0.0), 
        //new THREE.Vector3(0, -0.2, 0.0),
        new THREE.Vector3(-width, 0.0, 0.0)
    );
    trailRenderer.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, trailPoint);
    trailRenderer.frustumCulled = false;
    trailRenderer.activate();
    trailMaterial.uniforms.textureTileFactor.value = new THREE.Vector2( 1.0,1.0);

    this.player.wake = {
      trailRenderer: trailRenderer,
      trailPoint: trailPoint,
      trailPoints: points,
      trailIndex: 0,
      trailMat: lineMaterial,
    }
  }

  initControls() {

    this.gamepads = new GamePads(this);
  }

  updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
    const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    this.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();

    if (this.renderTarget) this.renderTarget.dispose();

    this.renderTarget = this.pmremGenerator.fromScene(this.sky);

    this.scene.environment = this.renderTarget.texture;
  }

  updateTrail() {

    if(this.frameCounter%3===0) {
      if(this.player.wake.trailRenderer) {
          this.player.wake.trailPoint.getWorldPosition(this.vector3)
          this.vector3.y = 0.1+ Math.random()*0.3
          
          this.player.wake.trailIndex = 
          this.player.wake.trailIndex-1 < 0 ? 
          this.player.wake.trailPoints.length-1 :  
          this.player.wake.trailIndex-1;
      }
      this.player.wake.trailRenderer.advance();
      this.player.wake.trailRenderer.updateHead();
    }
  }

  animate() {
    super.animate()

    let delta = this.clock.getDelta();
    let time = this.clock.getElapsedTime();
    this.frameCounter++;
    if(this.frameCounter>99) {
      this.frameCounter = 0;
    }

    // this.update(delta);

    // requestAnimationFrame(this.animate);
    // this.render();
  }

  update(delta) {
    super.update(delta);

    if (this.connectivity) {
      this.checkItems();
      this.connectivity.update();
      
    }
    TWEEN.update();
    if(this.gamepads) {
      if(this.gamepads) this.gamepads.update(delta)
      this.smoothControls(delta);
    }
    if(this.player?.ready) {
      if(this.player.wake) this.updateTrail()
    } 
    if(this.canalNetwork) this.canalNetwork.update(delta);
  }

  smoothControls(delta) {

    // const angleTo = this.controlGroup.quaternion.angleTo(this.gamepads.gamePad.targetObject.quaternion)
    // const distTo = this.controlGroup.position.distanceTo(this.gamepads.gamePad.targetObject.position)

    if(this.player ) {
      if(this.player.ready) {
        this.lastPlayerPosition.copy(this.player.playerGroup.position)
        this.player.playerGroup.position.lerp(this.gamepads.gamePad.boatTargetObject.position, 0.2);
        this.player.playerGroup.quaternion.slerp(this.gamepads.gamePad.boatTargetObject.quaternion, 0.2);

        this.currentPlayerPosition.copy(this.player.playerGroup.position)
        this.currentPlayerPosition.sub(this.lastPlayerPosition)

        this.camera.position.add(this.currentPlayerPosition)

        this.controls.target.copy(this.player.playerGroup.position);


        if(this.frameCounter%5===0) {
          this.vector3.set(0,0,0)
          this.distance = this.vector3.distanceTo(this.currentPlayerPosition)
          this.updateSpeedProp(this.distance, delta)
        }
      }
    }

    this.controlGroup.position.lerp(this.gamepads.gamePad.targetObject.position, delta * 5)
    this.controlGroup.quaternion.slerp(this.gamepads.gamePad.targetObject.quaternion, delta * 5)
  }

  updateSpeedProp(distance, delta) {
    
    const timeSec = delta;
    //const mps = distance/timeSec;
    const kph = (distance/1000.0)/(timeSec/3600.0);
    const mph = kph / 1.609;
		const nph = mph * 0.868976;
     

    this.soundManager.targetEngineVolume = (nph/250)
    this.updateSpeed(nph.toFixed(2));
  }

  //are we close enough to an item to collect
  checkItems() {
    let collected = [];
    for (let i = 0; i < this.meshes.length; i++) {
      const dist = this.meshes[i].position.distanceTo(
        this.controlGroup.position
      );
      if (dist < 5) {
        collected.push(i);
      }
    }
    if (collected.length > 0) {
      this.collectItems(collected);
      this.gamepads.vibrate();
      this.connectivity.itemsCollected(collected);
    }
  }

  //remove mesh of item
  collectItems(collected) {
    for (let i = collected.length - 1; i >= 0; i--) {
      this.meshes[collected[i]].geometry.dispose();
      this.meshes[collected[i]].material.dispose();
      this.scene.remove(this.meshes[collected[i]]);
      this.meshes.splice(collected[i], 1);
    }
  }

  render() {
    super.render()

    const time = performance.now() * 0.001;

    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.y = Math.sin(time + this.meshes[i].timeOffset) * 0.3;
      this.meshes[i].rotation.x = time * 0.5;
      this.meshes[i].rotation.z = time * 0.51;
    }

    if(this.water) this.water.material.uniforms["time"].value += 1.0 / 60.0;

  }
}

export { TestScene };
