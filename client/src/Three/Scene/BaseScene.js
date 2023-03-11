import * as THREE from "three";
import { cyrb128, sfc32 } from "../Utils/utils";
import SoundManager from "../Utils/Audio/soundManager";

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';
import {SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import {ClearPass} from 'three/examples/jsm/postprocessing/ClearPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import RenderOptions from "../Utils/RenderOptions";

class BaseScene {
  constructor() {

    this.container = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.texLoader = new THREE.TextureLoader();
    this.soundManager = new SoundManager(this);
    this.vector2 = new THREE.Vector2()
    this.vector3 = new THREE.Vector3()

    const seed = cyrb128('canals-predictable-seed');
    this.canalRand = sfc32(seed[0], seed[1], seed[2], seed[3]); 

    this.animate = this.animate.bind(this);
    this.update = this.update.bind(this);
    this.init = this.init.bind(this);
  }

  init() {
    this.onWindowResize = this.onWindowResize.bind(this);

    this.container = document.getElementById("canvasContainer");

    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.container.appendChild(this.renderer.domElement);
    this.composer = new EffectComposer(this.renderer);
    this.bloomComposer = new EffectComposer(this.renderer);

    // export const LinearToneMapping: ToneMapping;
    // export const ReinhardToneMapping: ToneMapping;
    // export const CineonToneMapping: ToneMapping;
    // export const ACESFilmicToneMapping: ToneMapping;
    this.bloomSceneLayer = 1;
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set( this.bloomSceneLayer );

    this.renderOptions = new RenderOptions();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.set(20, 20, 20);

    this.controlGroup = new THREE.Group();
    this.controlGroupRotation = new THREE.Vector2();
    this.controlGroup.position.set(30, 30, 30);
    this.controlGroup.rotation.order = "YXZ";
    this.scene.add(this.controlGroup);
    this.scene.add(this.camera);

    window.addEventListener("resize", this.onWindowResize);

    this.initPasses(this.camera)
    this.soundManager.initAsync(); 
    this.animate();
  }


  initPasses(camera) {

    const renderScene = new RenderPass(this.scene, camera);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.pixelRatio);

    // this.ssaoPass = new SSAOPass ( this.scene, camera, window.innerWidth / 4, window.innerHeight/4 );
    // this.ssaoPass.kernelRadius = 16;
    // this.ssaoPass.minDistance = 0.005;
    // this.ssaoPass.maxDistance = 0.3;

    this.bokehPass = new BokehPass ( this.scene, camera, {
        focus: 6,
        aperture: 0.000010,
        maxblur: 0.03,
        width: window.innerWidth,
        height: window.innerHeight } );

    window.bokehPass = this.bokehPass;
      
    this.bloomPass = new BloomPass(this.vector2.set(window.innerWidth / 2, window.innerHeight/2),
        1.5,
        0.25,
        0.99);
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(this.bloomPass);
    this.bloomComposer.renderToScreen = false;

    const finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: {value: null},
                bloomTexture: {value: this.bloomComposer.renderTarget2.texture}
            },
            vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader: `
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;
            varying vec2 vUv;

            void main() {
                gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
            }
            `,
            defines: {}
        }), 'baseTexture'
    );
    finalPass.needsSwap = true;
    finalPass.renderToScreen = true;

    this.composer.addPass(new ClearPass(0x564f49, 0));
    this.composer.addPass(renderScene);
    this.composer.addPass(finalPass);
    this.composer.addPass(this.bokehPass);
}

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onAudioLoaded() {
    console.log('[audio loaded]');
    this.soundManager.setVolumeMusic(1);
    this.soundManager.setVolumeSFX(1);
    this.soundManager.play()
  }

  animate() {

    let delta = this.clock.getDelta();
    let time = this.clock.getElapsedTime();

    this.update(delta);
    requestAnimationFrame(this.animate);
    this.render(delta);
  }

  update(delta) {
    if(this.soundManager) {
      this.soundManager.update(delta);
    }
  }

  render(delta) {
    this.bloomComposer.render(delta);
    this.composer.render(delta);
    //this.renderer.render(this.scene, this.camera);
  }
}

export { BaseScene };
