import { SOUNDS, MUSIC } from "./sounds";
import {Audio, AudioListener, AudioLoader, PositionalAudio} from "three";
import TWEEN from "@tweenjs/tween.js";

class SoundManager {

    constructor(app) {
        this.app = app;

        this.sounds = [];
        this.soundTween = null;
        this.listenerMusic = new AudioListener();
        this.listenerMusic.name = 'music';
        this.listenerMusic.setMasterVolume(0);
        this.listenerSFX = new AudioListener();
        this.listenerSFX.name = 'sfx';
        this.listenerSFX.setMasterVolume(0);

        this.listenerSFXfiltered = new AudioListener();
        this.listenerSFXfiltered.name = 'sfxFiltered';
        this.listenerSFXfiltered.setMasterVolume(0)
        this.filter = new BiquadFilterNode(this.listenerSFX.context, {type: "lowpass",Q: 1, frequency: 5000, detune: -2000});
        this.listenerSFXfiltered.setFilter(this.filter);

        this.audioLoader = new AudioLoader(); 

        this.RANDOM_TRACK = null
        this.env = 'default';

        this.isPlayingAudio = false;
        this.shownMusicBanner = false;

        this.targetEngineVolume = 1;

        this.loadedAllSounds = false;
        this.loadedAllMusic = false;
        this.targetVolumeSound = 1;
        this.targetVolumeMusic = 0;
        this.adjustSoundVolume = null;
        this.adjustMusicVolume = null; 
    }

    async initAsync() {
        this.env = 'default';

        window.soundManager = this;
        this.chooseMusicTrack();

        await this.loadSounds(this.env, true, this.RANDOM_TRACK.filename);

        this.stop();
    }

    setVolumeMusic(value) {
        if(this.loadedAllMusic) { 
            this.targetVolumeMusic = value;
            
            const volumes = {
                music: this.listenerMusic.getMasterVolume()
            }
            if(this.adjustMusicVolume) {
                this.adjustMusicVolume.stop();
            }
            this.adjustMusicVolume = new TWEEN.Tween(volumes)
                .to({music: this.targetVolumeMusic}, 500)
                .onUpdate(() => { 
                    if(this.isPlayingAudio) {
                        this.listenerMusic.setMasterVolume(volumes.music);
                    } else {
                        this.listenerMusic.setMasterVolume(0);
                    }
                })
                .start();
        }
    }

    setVolumeSFX(value) { 
        if(this.loadedAllSounds)  { 
            this.targetVolumeSound = value;
            const volumes = {
                sound: this.listenerSFX.getMasterVolume()
            }

            if(this.adjustSoundVolume) {
                this.adjustSoundVolume.stop();
            }
            this.adjustSoundVolume = new TWEEN.Tween(volumes)
            .to({sound: this.targetVolumeSound}, 500)
            .onUpdate(() => {
                 if(this.isPlayingAudio) {
                    this.listenerSFX.setMasterVolume(volumes.sound);
                    if(this.listenerSFXfiltered) this.listenerSFXfiltered.setMasterVolume(volumes.sound);
                } else {
                    this.listenerSFX.setMasterVolume(0);
                    if(this.listenerSFXfiltered) this.listenerSFXfiltered.setMasterVolume(0);
                }
            })
            .start();
        }
    }

    showMusicBanner() {
        this.shownMusicBanner = true;
            
        if(this.loadedAllMusic) {
            const trackBanner =  document.getElementById('music-track')
            if(trackBanner) {
                trackBanner.classList.add('fade-in');
                setTimeout(() => {
                    trackBanner.className = 'fade-out';
                }, 10000);
            }
        }
    }

    async addSound({name, url, loop = false, volume = 1.0, sfx = true, lookPan = false, filter = false}) {
        let audioObject = new Audio((sfx) ? (this.filter && filter) ? this.listenerSFXfiltered : this.listenerSFX : this.listenerMusic);
        audioObject.name = name;
 
        let buffer = await this.audioLoader.loadAsync(url);
         
        audioObject.setBuffer(buffer);
        audioObject.setLoop(loop);
        audioObject.setVolume(volume);

        audioObject.context.suspend();

        return { name, audioObject };
    }

    chooseMusicTrack(id) {
        let musicTrack = MUSIC[0];
        if(id) {
            musicTrack = MUSIC[id];
        }

        this.RANDOM_TRACK = musicTrack;
        if(musicTrack.distanceBased){
            let distExt = 0;
            for(let i = 0; i < musicTrack.distances;i++) {
                if(this.raceDistance >= musicTrack.distances[i][0]
                    && this.raceDistance <= musicTrack.distances[i][1]
                    )
                    {
                        distExt = i;
                        break;
                    }
            }
            musicTrack.filename = musicTrack.basefilename + musicTrack.distanceExt[distExt];
        }

        const musicTrackDom = document.createElement('div');
        musicTrackDom.id='music-track';
        musicTrackDom.innerHTML = `
            <div class="track-title">${musicTrack.track}</div>
            <div class="track-artist"><span>by</span> ${musicTrack.artist}</div>
        `;
        document.getElementById('gameUI').appendChild(musicTrackDom);
    }


    async loadSounds(env, loadGeneralSounds = false, musicTrack = null) {
        let asyncSoundLoaders = [];
   
        const loadingProgress = {
            total: 0,
            loaded: 0,
            progress: 0,
        }

        for (let i = 0; i < SOUNDS.length; i++) {
            if((loadGeneralSounds && SOUNDS[i].general) || SOUNDS[i].name.includes(env)) {
                asyncSoundLoaders.push(this.addSound(SOUNDS[i]).then((sound)=> {
                    loadingProgress.loaded++;
                    const prevProgress = loadingProgress.progress;
                    loadingProgress.progress = loadingProgress.loaded / loadingProgress.total;
                    this.loadingSoundProgress(prevProgress, loadingProgress.progress);
                    return sound;
                }));
            }
        }

        //Trigger music loading in big stuff alias.
        this.loadMusic(musicTrack);

        // Load them all parallel
        loadingProgress.total = asyncSoundLoaders.length;
        loadingProgress.total++;
        const loadedSounds = await Promise.all(asyncSoundLoaders);
        for (const s of loadedSounds) {
            //console.log(s.name + " " + (s.audioObject !== null));
            this[s.name] = s.audioObject;
            this.sounds.push(s.audioObject);

            // Generate metersPassby and fanPassby to be triggered on this.update() if exists a file containing that name
            // fanAttenuated plays in loop a fan audio that will be attenuated based on camera distance to fans on this.update()
            // if(s.name.includes('metersPassby')) this.initPassBySound(s.audioObject, 200, 0, false, 0.5);
            // if(s.name.includes('fanPassby')) this.initPassBySound(s.audioObject, 400, 250, false, 0.25);
            // if(s.name.includes('fanAttenuated')) this.initPassBySound(s.audioObject, 400, 350, true, 0.25);    
            // if(s.name.includes('whoosh')) this.initPassBarriersSound(s.audioObject, 22, 0.5);
        }

        this.app.onAudioLoaded();
        this.loadedAllSounds = true;

        this.loadingSoundProgress(1, 1);
    }

    async loadCustomSound(soundName) {
        let asyncSoundLoaders = [];
        for (let i = 0; i < SOUNDS.length; i++) {
            if(SOUNDS[i].name===soundName) {
                asyncSoundLoaders.push(this.addSound(SOUNDS[i]).then((sound)=> { 
                    return sound;
                }));
            }
        }
        const loadedSounds = await Promise.all(asyncSoundLoaders);
        for (const s of loadedSounds) { 
            this[s.name] = s.audioObject;
            this.sounds.push(s.audioObject); 
        }
    }

    async loadMusic(musicTrack) {
        let asyncSoundLoaders = [];
        if (musicTrack) {
            asyncSoundLoaders.push(this.addSound({
                name: 'raceMusic',
                url: musicTrack,
                loop: true,
                volume: 1.0,
                sfx: false
            }));
            const loadedMusic = await Promise.all(asyncSoundLoaders);
            for (const s of loadedMusic) {
                console.log(s.name)
                this[s.name] = s.audioObject;
                this.sounds.push(s.audioObject);
            }
            this.loadedAllMusic = true;
        }

        if(!this.shownMusicBanner) {
            //show banner again
            this.setVolumeMusic(1);
            this.raceMusic.play()
            this.play()
            this.showMusicBanner();
        }
    }

    loadingSoundProgress(current, progress) {
        
        // const bg = document.getElementById('loading-audio-bg');
        // const fg = document.getElementById('loading-audio');
        // if(progress<1) {
        //     bg.style.display = 'block';
        //     fg.style.display = 'block';
        // }

        // const initVal = {val: current};
        // this.loadedLoadingTween = new TWEEN.Tween(initVal)
        //     .to({val: progress}, 500)
        //     .onUpdate(() => {
        //         fg.style.clipPath = 'polygon(0% 0%,'+(initVal.val*100.0)+'% 0%, '+((initVal.val*100.0))+'% 100%, 0% 100%)';
        //     })
        //     .onComplete(() => {
        //         if(progress>=1) {
        //             bg.style.display = 'none';
        //             fg.style.display = 'none';
        //         }
        //     })
        //     .start();
    }

    async updateAtmosTrack(id) {  
    //     this.stop();
    //     //Need to make the existing atmos 

    //     if(this.atmosSound) {
    //         this.atmosSound.disconnect();
    //     }

    //     if(id) {  
    //         this.atmosSound = this[id];
    //     } else {
    //         this.atmosSound = this['atmosSound'];
    //     }
    //     console.log(this.atmosSound);
    //     await this.addSound(this.atmosSound); 

    //     this.play();
    }

    async updateMusicTrack(id) {
        this.stop();

        let prevMusic = -1;
        let index= 0;
        if(this['raceMusic']) {
            this['raceMusic'].disconnect()
        }
        this.sounds.forEach((sound) => {
            if(sound.name === 'raceMusic') {
                prevMusic = index; 
            }
            index++;
        });
        if(prevMusic > -1) {
            this.sounds.splice(prevMusic, 1);
        }

        this.chooseMusicTrack(id);


        let asyncSoundLoaders = [];

        if (this.RANDOM_TRACK.filename) {
            asyncSoundLoaders.push(this.addSound({
                name: 'raceMusic',
                url: this.RANDOM_TRACK.filename,
                loop: true,
                volume: 1.0,
                sfx: false
            }));
        }
        const newMusic = await Promise.all(asyncSoundLoaders);
        for (const music of newMusic) {
            this[music.name] = music.audioObject;
            this.sounds.push(music.audioObject);
            music.audioObject.play();
        }

        this.showMusicBanner();
        this.play();
    } 

    play() {
        this.sounds.forEach((sound) => {
            if (!this.listenerMusic.context) {
                const source = this.listenerMusic.context.createBufferSource();
                source.connect(this.listenerMusic.context.destination);
                source.start();

                const sourceSFX = this.listenerSFX.context.createBufferSource();
                sourceSFX.connect(this.listenerSFX.context.destination);
                sourceSFX.start();
            }
            sound.context.resume();
        });

        this.setVolumeMusic(this.targetVolumeMusic);
        this.setVolumeSFX(this.targetVolumeSound);

        this.isPlayingAudio = true;

        return this.isPlayingAudio;
    }

    stop() {
        this.sounds.forEach((sound) => {
            sound.context.suspend();
        });

        if(this.adjustMusicVolume) {
            this.adjustMusicVolume.stop();
        }
        if(this.adjustSoundVolume) {
            this.adjustSoundVolume.stop();
        }

        this.listenerMusic.setMasterVolume(0.001);
        this.listenerSFX.setMasterVolume(0.001);
        if(this.listenerSFXfiltered) this.listenerSFXfiltered.setMasterVolume(0.001); 

        this.listenerMusic.gain.gain.value = 0;
        this.listenerSFX.gain.gain.value = 0;
        if(this.listenerSFXfiltered) this.listenerSFXfiltered.gain.gain.value = 0;

        this.isPlayingAudio = false;
    }

    initPassBySound(sound, triggerDistance, triggerOffset = 0, distanceAttenuation = null, pitchVariance = null) {
        if(!this.passBySounds) this.passBySounds = [];

        const attributes = {
            sound: sound,
            distance: triggerDistance,
            offset: triggerOffset,
            current: -1,
            prev: -1,
        }

        if(pitchVariance) attributes.pitchVariance = pitchVariance;

        if(distanceAttenuation) {
            attributes.attenuation = true;
            sound.setVolume(0.0);
            sound.play();
        }
        this.passBySounds.push(attributes);
    }

    initPassBarriersSound(sound, barriersPosX, pitchVariance = null) {
        this.barriers = {
            sound: sound,
            posX: barriersPosX,
            camInside: false
        }
        if(pitchVariance) this.barriers.pitchVariance = pitchVariance;
    }
    
    update(delta) {
        if(this.loadedAllSounds) {

            if(this.engine_outboard_engine) {
                if(!this.engine_outboard_engine.isPlaying) {
                    this.engine_outboard_engine.play()
                }
                const engineVol = this.engine_outboard_engine.getVolume()
                if(engineVol < this.targetEngineVolume) {
                    this.engine_outboard_engine.setVolume(Math.min(1, engineVol+delta*5))
                } else {
                    this.engine_outboard_engine.setVolume(Math.max(0.2, engineVol-delta*5))
                }
            }

            // SFX volume attenuation based on camera distance: horses if closer, wind if far
            // if (!this.app.cameraState.prevPosition.equals(this.app.camera.position)) {
            //     let vol = Math.max(0, 1.0 - ((this.app.camera.position.length() - this.app.state.minDistance) / this.app.state.maxDistance));
            //     vol *= vol;
            //     vol = vol.clamp(0.3, 1.0);
            //     if(this.wind) {
            //         if(this.atmosSound) this.atmosSound.setVolume(vol);
            //         if(this.wind) this.wind.setVolume(1 - vol);
            //     }
            // }
        }
    }

}

export default SoundManager;
