import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "../Controls/OrbitControls.js";

import { BaseScene } from "./BaseScene";

import { Water } from "../Objects/Water";
import { Sky } from "../Objects/Sky";

import waterNormals from "../../Assets/textures/waternormals.jpg";
import boatModelUrl from "../../Assets/models/test_boat.glb";
import rodHookUrl from "../../Assets/models/rod_hook.glb";

import { VerletJS, Particle, Composite } from "../Utils/Verlet/verlet";
import Vec3 from "../Utils/Verlet/vec3";
import { DistanceConstraint } from "../Utils/Verlet/constraint";

import TWEEN from "@tweenjs/tween.js";
import { downloadTxt, wait } from "../Utils/utils.js";

class FishingScene extends BaseScene {
  constructor(id) {
    super();
    this.id = id;

    this.time = 0;
    this.water = null;
    this.sun = null;
    this.sky = null;
    this.meshes = [];
    this.renderTarget = null;

    this.lineIn = false
    document.addEventListener("keydown", this.keyDown.bind(this), false);
  }

  init() {
    super.init();

    this.sun = new THREE.Vector3();

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

    const waterGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);

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
      alpha: 0.1,
      size: 6,
      transparent: true,
    });
    //this.water.material.wireframe = true
    this.water.rotation.x = -Math.PI / 2;

    //this.scene.add(this.water);

    this.updateSun();

    this.loadModels();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0,
      color: new THREE.Color("hsl(50, 100%, 50%)"),
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.controlGroup.position.set(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.target.set(0, 3, 0);
    this.controls.minDistance = 10.0;
    this.controls.maxDistance = 80.0;
    this.controls.update();

    this.initializeFishing();
  }

  initializeFishing() {
    this.fishingWorld = new VerletJS(256, 256);
    this.fishingRod = new Composite();
    //Fishing Rod
    for (let i = 0; i < 9; i++) {
      this.fishingRod.particles.push(
        new Particle(new Vec3(i, 128 + 5.555555555555556 * i))
      );
    }

    //Fishing Line
    for (let i = 0; i < 12; i++) {
      this.fishingRod.particles.push(
        new Particle(new Vec3(9 + i * 2, 168 - i * 10))
      );
    }

    this.fishingRod.particleLines = [];
    for (let i = 0; i < this.fishingRod.particles.length - 1; i++) {
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 2,
      });
      const points = [];
      const v1 = new THREE.Vector3(
        this.fishingRod.particles[i].pos.x * 0.1,
        this.fishingRod.particles[i].pos.y * 0.1,
        0
      );
      let v2 = new THREE.Vector3(
        this.fishingRod.particles[i + 1].pos.x * 0.1,
        this.fishingRod.particles[i + 1].pos.y * 0.1,
        0
      );
      points.push(v1);
      points.push(v2);

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(lineGeo, lineMat);
      line.points = points;
      this.fishingRod.particleLines.push(line);
      this.scene.add(line);
    }

    //Add distance contraints between everything
    this.lineContraints = [];
    for (let i = 0; i < this.fishingRod.particles.length - 1; i++) {
      var distConstraint = new DistanceConstraint(
        this.fishingRod.particles[i],
        this.fishingRod.particles[i + 1],
        i < 9 ? 5 : 2
      );
      if (i >= 9) {
        this.lineContraints.push(distConstraint);
      }
      this.fishingRod.constraints.push(distConstraint);
    }

    //Pin base of rod, and tip
    this.fishingRod.pin(0, new Vec3(0, 128));
    this.tipPin = this.fishingRod.pin(9, new Vec3(9, 178));
    this.hookPin = this.fishingRod.pin(
      this.fishingRod.particles.length - 1,
      new Vec3(17, 58)
    );

    this.fishingWorld.composites.push(this.fishingRod);
  }

  async loadModels() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(boatModelUrl);
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive.set(0xffffff);
        child.material.emissiveMap = child.material.map;
        child.material.emissiveIntensity = 1.0;
      }
    });
    gltf.scene.rotateY(Math.PI * 0.5);
    this.scene.add(gltf.scene);

    this.rod = [];
    const gltfRod = await loader.loadAsync(rodHookUrl);
    gltfRod.scene.traverse((child) => {
      if (child.isMesh) {
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
            child.visible = false;
            this.rod.push(child);
            break;
          case "Hook":
            this.hook = child;
            this.hook.rotateY(Math.PI * -0.5);
            break;
        }
      }
    });
    this.scene.add(gltfRod.scene);
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

  async getAsciiScreenshot() {
    const asciiChars = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."];
    const outputElement = document.createElement('pre');


    this.renderer.preserveDrawingBuffer = true;
    this.render();

    const oldCanvas = this.renderer.domElement
    var w = oldCanvas.width;
    var h = oldCanvas.height;

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var newContext = canvas.getContext('2d');
    newContext.drawImage(oldCanvas, 0, 0, w, h, 0, 0, w, w);

    const imageData = newContext.getImageData(0, 0, canvas.width, canvas.height);
    //const pixelData = imageData.data;
    let ascii = "";

    // Map brightness values to corresponding characters

    for (let y = 0; y < h; y += 10) {
      for (let x = 0; x < w; x+= 10) {
        const pixelData = newContext.getImageData(x, y, 1, 1).data;
        const brightness = (0.2126 * pixelData[0]) + (0.7152 * pixelData[1]) + (0.0722 * pixelData[2]);
        const asciiIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
        ascii += asciiChars[asciiIndex];
      }
      ascii += "\n";
    }

    // Display the ASCII art in an HTML element
    outputElement.textContent = ascii;
    document.body.appendChild(outputElement)

    downloadTxt(ascii, "ascii.txt");

    this.renderer.preserveDrawingBuffer = false;
  }

  pullLineIn() {
    console.log('pullLineIn')
    this.lineIn = true
    const initVal = { val: 1 };
    this.pullInTween = new TWEEN.Tween(initVal)
      .to({ val: 0.1 }, 2000)
      .onUpdate(() => {
        for(let i = 0; i < this.lineContraints.length; i++) {
            this.lineContraints[i].distance =
          this.lineContraints[i].initDistance * initVal.val;
          this.lineContraints[i].stiffness =
        this.lineContraints[i].initStiffness * 1-initVal.val;
        }
      })
      .start();
  }

  releaseLine() {
    console.log('releaseLine')
    this.lineIn = false
    const initVal = { val: 0.1 };
    this.pullInTween = new TWEEN.Tween(initVal)
      .to({ val: 1 }, 5000)
      .onUpdate(() => {
        for(let i = 0; i < this.lineContraints.length; i++) {
            this.lineContraints[i].distance =
          this.lineContraints[i].initDistance * initVal.val;
          this.lineContraints[i].stiffness =
        this.lineContraints[i].initStiffness * 1-initVal.val;
        }
      })
      .start();
  }

  renderWorld() {
    if (this.fishingWorld) {
      this.tipPin.pos.x = 18 + Math.sin(this.time) * 12;
      this.tipPin.pos.y = 178 + Math.sin(this.time) * 6;
      this.tipPin.pos.z = 0 + Math.sin(this.time * 3) * -2;
      this.hookPin.pos.x = 25 + Math.sin(this.time) * 20;
      this.hookPin.pos.y = 63 + Math.sin(this.time * 3) * 10;
      this.hookPin.pos.z = 0 + Math.sin(this.time * 3) * 2;

      this.fishingWorld.frame(16);
      for (let i = 0; i < this.fishingRod.particles.length - 1; i++) {
        this.fishingRod.particleLines[i].points[0].set(
          this.fishingRod.particles[i].pos.x * 0.1 + 7,
          this.fishingRod.particles[i].pos.y * 0.1 - 11.8,
          this.fishingRod.particles[i].pos.z
        );
        this.fishingRod.particleLines[i].points[1].set(
          this.fishingRod.particles[i + 1].pos.x * 0.1 + 7,
          this.fishingRod.particles[i + 1].pos.y * 0.1 - 11.8,
          this.fishingRod.particles[i + 1].pos.z
        );

        this.fishingRod.particleLines[i].geometry.setFromPoints(
          this.fishingRod.particleLines[i].points
        );
        this.fishingRod.particleLines[
          i
        ].geometry.attributes.position.needsUpdate = true;

        if (this.hook) {
          if (i === this.fishingRod.particles.length - 2) {
            this.hook.position.set(
              this.fishingRod.particles[i + 1].pos.x * 0.1 + 7,
              this.fishingRod.particles[i + 1].pos.y * 0.1 - 11.8,
              this.fishingRod.particles[i + 1].pos.z
            );
          }
        }
        if (this.rod) {
          if (this.rod.length == 9) {
            if (i < 9) {
              this.rod[i].position.set(
                this.fishingRod.particles[i].pos.x * 0.1 + 7,
                this.fishingRod.particles[i].pos.y * 0.1 - 11.8,
                this.fishingRod.particles[i].pos.z
              );
              if (i === 8) {
                this.rod[i].lookAt(
                  this.fishingRod.particles[i - 1].pos.x * 0.1 + 7,
                  this.fishingRod.particles[i - 1].pos.y * 0.1 - 11.8,
                  this.fishingRod.particles[i + 1].pos.z
                );
                this.rod[i].rotateX(Math.PI * -0.5);
              } else {
                this.rod[i].lookAt(
                  this.fishingRod.particles[i + 1].pos.x * 0.1 + 7,
                  this.fishingRod.particles[i + 1].pos.y * 0.1 - 11.8,
                  this.fishingRod.particles[i + 1].pos.z
                );
                this.rod[i].rotateX(Math.PI * 0.5);
              }
            }
          }
        }
      }
    }
  }

  update(delta) {
    super.update(delta);

    TWEEN.update();
    this.time += delta;

    if (this.water) this.water.material.uniforms["time"].value += delta; //1.0 / 60.0;

    this.renderWorld();
  }

  animate() {
    super.animate();
  }

  keyDown(evt) {
    evt = evt || window.event;
    evt.stopImmediatePropagation();
    switch (evt.key) {
      case "r":
      case "R":
        console.log('R')
        if(this.lineIn) {
            this.releaseLine()
        } else {
            this.pullLineIn()
        }
        break;
        case "T":
        case "t":
          console.log('T')
          this.getAsciiScreenshot()
          break;
    }
  }
}

export { FishingScene };
