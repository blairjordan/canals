import music_loop from "../../../Assets/audio/music/music_loop.m4a";
import engine_outboard_engine from "../../../Assets/audio/effects/diesel-outboard-engine.m4a";

export const MUSIC = [
    {
        filename: music_loop,
        artist: 'pegleg',
        track: 'peggy leggy',
        credits: 'credits where credits due',
    },
];
export const SOUNDS = [
    {
        name: 'engine_outboard_engine',
        url: engine_outboard_engine,
        loop: true,
        general: true,
    },
];