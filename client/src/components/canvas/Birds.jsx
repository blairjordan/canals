import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { GPUComputationRenderer } from "three-stdlib";
import vertex from '../../templates/Shader/glsl/bird.vert'
import fragment from '../../templates/Shader/glsl/bird-geom.frag'
import fragmentPos from '../../templates/Shader/glsl/bird-pos.frag'
import framentVel from '../../templates/Shader/glsl/bird.frag'

const Birds = forwardRef((props, ref) => {
    const { gl } = useThree();
    const [birds, setBirds] = useState(100)
    const gpu_allocation = useRef(null)
    const velocity_variable = useRef(null)
    const position_variable = useRef(null)
    const uniform_position = useRef(null)
    const uniform_velocity = useRef(null)
    const uniform_bird = useRef(null)
    const bounds = useRef(250)
    const bounds_HALF = useRef(125)

    useEffect(() => {
        setBirds(100)
    }, [])

    const initComputeRenderer = (renderer) => {
        if(gpu_allocation.current) return

        gpu_allocation.current = new GPUComputationRenderer( birds, birds, gl );

        let dtPosition = gpu_allocation.current.createTexture();
        let dtVelocity = gpu_allocation.current.createTexture();
        fillPositionTexture( dtPosition );
        fillVelocityTexture( dtVelocity );

        velocity_variable.current = gpu_allocation.current.addVariable( "VeloctiyTexture", framentVel, dtVelocity );
        position_variable.current = gpu_allocation.current.addVariable( "PositionTexture", fragmentPos, dtPosition );

        gpu_allocation.current.setVariableDependencies( velocity_variable.current, [ position_variable.current, velocity_variable.current ] );
        gpu_allocation.current.setVariableDependencies( position_variable.current, [ position_variable.current, velocity_variable.current ] );

        uniform_position.current = position_variable.current.material.uniforms;
        uniform_velocity.current = velocity_variable.current.material.uniforms;

        uniform_position.current.clock = { value: 0.0 };
        uniform_position.current.del_change = { value: 0.0 };
        uniform_velocity.current.clock = { value: 1.0 };
        uniform_velocity.current.del_change = { value: 0.0 };
        uniform_velocity.current.testing = { value: 1.0 };
        uniform_velocity.current.seperation_distance = { value: 1.0 };
        uniform_velocity.current.alignment_distance = { value: 1.0 };
        uniform_velocity.current.cohesion_distance = { value: 1.0 };
        uniform_velocity.current.freedom_distance = { value: 1.0 };
        uniform_velocity.current.predator = { value: new THREE.Vector3() };
        velocity_variable.current.material.defines.bounds = bounds.current.toFixed( 2 );

        velocity_variable.current.wrapS = THREE.RepeatWrapping;
        velocity_variable.current.wrapT = THREE.RepeatWrapping;
        position_variable.current.wrapS = THREE.RepeatWrapping;
        position_variable.current.wrapT = THREE.RepeatWrapping;

        console.log('init gpu_allocation')

        var error = gpu_allocation.current.init();
        if ( error !== null ) {
            console.error( error );
        }
    }

    const fillPositionTexture = ( texture ) => {

        var theArray = texture.image.data;

        for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

            var x = Math.random() * 100 ;
            var y = Math.random() * 100;
            var z = Math.random() * 100;

            theArray[ k + 0 ] = x;
            theArray[ k + 1 ] = y;
            theArray[ k + 2 ] = z;
            theArray[ k + 3 ] = 1;
        }
    }

    const fillVelocityTexture = ( texture ) => {
        var theArray = texture.image.data;

        for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
            var x = Math.random() - 0.5;
            var y = Math.random() - 0.5;
            var z = Math.random() - 0.5;

            theArray[ k + 0 ] = x * 10;
            theArray[ k + 1 ] = y * 10;
            theArray[ k + 2 ] = z * 10;
            theArray[ k + 3 ] = 1;
        }
    }

    const birdGeometry = useMemo(() => {
        initComputeRenderer()

        console.log('init birdGeometry')
        const argumentHash = birds / birds;

        const geometry = new THREE.BufferGeometry()

        const triangles = birds * 3;
        const points = triangles * 3;

        const vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
        const birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
        const references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
        const birdVertex = new THREE.BufferAttribute( new Float32Array( points ), 1 );

        geometry.setAttribute( 'position', vertices );
        geometry.setAttribute( 'birdColor', birdColors );
        geometry.setAttribute( 'reference', references );
        geometry.setAttribute( 'birdVertex', birdVertex );

        var v = 0;
        function vertex_append() {
            for (var i=0; i < arguments.length; i++) {
                vertices.array[v++] = arguments[i];
            }
        }
        for (var f = 0; f<birds; f++ ) {
            vertex_append(
                0, -0, -6,
                0, 1, -15,
                0, 0, 8);
            vertex_append(
                0, 0, -4,
                -6, 0, 0,
                0, 0, 4);
            vertex_append(
                0, 0, 4,
                6, 0, 0,
                0, 0, -4);
        }

        for( var v = 0; v < triangles * 3; v++ ) {
            var i = ~~(v / 3);
            var x = (i % argumentHash) / argumentHash;
            var y = ~~(i / argumentHash) / argumentHash;

            var c = new THREE.Color(0x000000);

            birdColors.array[v*3+0] = c.r;
            birdColors.array[v*3+1] = c.g;
            birdColors.array[v*3+2] = c.b;
            references.array[v*2] = x;
            references.array[v*2+1] = y;
            birdVertex.array[v] = v % 9;
        }
        geometry.scale( 0.35, 0.35, 0.35 );

        return geometry
    }, [birds])
    const birdMaterial = useMemo(() => {
        console.log('init birdMaterial')
        uniform_bird.current = {
            color: { value: new THREE.Color( 0xff2200 ) },
            PositionTexture: { value: null },
            VeloctiyTexture: { value: null },
            clock: { value: 1.0 },
            del_change: { value: 0.0 }
        };

        // ShaderMaterial
        var material = new THREE.ShaderMaterial( {
            uniforms:       uniform_bird.current,
            vertexShader:   vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide

        });

        return material
    }, [birds])

    useFrame((state, delta) => {
        if(gpu_allocation.current) {
            const maxDelta = Math.min(delta, 1.0)

            uniform_position.current.clock.value = state.clock.elapsedTime
            uniform_position.current.del_change.value = maxDelta;
            uniform_velocity.current.clock.value = state.clock.elapsedTime
            uniform_velocity.current.del_change.value = maxDelta;
            uniform_bird.current.clock.value = state.clock.elapsedTime
            uniform_bird.current.del_change.value = maxDelta;
            uniform_velocity.current.predator.value.set( 0.5 , - 0.5, 0 );

            gpu_allocation.current.compute();

            uniform_bird.current.PositionTexture.value = gpu_allocation.current.getCurrentRenderTarget( position_variable.current ).texture;
            uniform_bird.current.VeloctiyTexture.value = gpu_allocation.current.getCurrentRenderTarget( velocity_variable.current ).texture;

        }
      })

    return <mesh ref={ref} geometry={birdGeometry} material={birdMaterial}>
    </mesh>;
})

Birds.displayName = 'Birds';

export { Birds }