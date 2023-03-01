
/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// window.requestAnimFrame = window.requestAnimationFrame
// || window.webkitRequestAnimationFrame
// || window.mozRequestAnimationFrame
// || window.oRequestAnimationFrame
// || window.msRequestAnimationFrame
// || (callback => {
// 	window.setTimeout(callback, 1000 / 60);
// });

import Vec3 from './vec3';
import { PinConstraint } from './constraint';

export class Particle {
    constructor(pos) {
        this.pos = (new Vec3()).mutableSet(pos);
        this.lastPos = (new Vec3()).mutableSet(pos);
    }
}

export class VerletJS {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // this.canvas = canvas;
        // this.ctx = canvas.getContext("2d");
        this.mouse = new Vec3(0,0);
        this.mouseDown = false;
        this.draggedEntity = null;
        this.selectionRadius = 20;
        this.highlightColor = "#4f545c";
        
        this.bounds = function({pos}) {
            if (pos.y > this.height-1)
                pos.y = this.height-1;
            
            if (pos.x < 0)
                pos.x = 0;

            if (pos.x > this.width-1)
                pos.x = this.width-1;
        }
        
        const _this = this;
        
        // prevent context menu
        // this.canvas.oncontextmenu = e => {
        //     e.preventDefault();
        // };
        
        // this.canvas.onmousedown = e => {
        //     _this.mouseDown = true;
        //     const nearest = _this.nearestEntity();
        //     if (nearest) {
        //         _this.draggedEntity = nearest;
        //     }
        // };
        
        // this.canvas.onmouseup = e => {
        //     _this.mouseDown = false;
        //     _this.draggedEntity = null;
        // };
        
        // this.canvas.onmousemove = ({clientX, clientY}) => {
        //     const rect = _this.canvas.getBoundingClientRect();
        //     _this.mouse.x = clientX - rect.left;
        //     _this.mouse.y = clientY - rect.top;
        // };  
        
        // simulation params
        this.gravity = new Vec3(0,0.2,0);
        this.friction = 0.99;
        this.groundFriction = 0.8;
        
        // holds composite entities
        this.composites = [];
    }

    frame(step) {
        let i;
        let j;
        let c;

        for (c in this.composites) {
            for (i in this.composites[c].particles) {
                var particles = this.composites[c].particles;
                
                // calculate velocity
                const velocity = particles[i].pos.sub(particles[i].lastPos).scale(this.friction);
            
                // ground friction
                if (particles[i].pos.y >= this.height-1 && velocity.length2() > 0.000001) {
                    const m = velocity.length();
                    velocity.x /= m;
                    velocity.y /= m;
                    velocity.z /= m;
                    velocity.mutableScale(m*this.groundFriction);
                }
            
                // save last good state
                particles[i].lastPos.mutableSet(particles[i].pos);
            
                // gravity
                particles[i].pos.mutableAdd(this.gravity);
            
                // inertia  
                particles[i].pos.mutableAdd(velocity);
            }
        }

        // handle dragging of entities
        if (this.draggedEntity)
            this.draggedEntity.pos.mutableSet(this.mouse);

        // relax
        const stepCoef = 1/step;
        for (c in this.composites) {
            const constraints = this.composites[c].constraints;
            for (i=0;i<step;++i)
                for (j in constraints)
                    constraints[j].relax(stepCoef);
        }

        // bounds checking
        //we don't care about bounds for our usage.
        // for (c in this.composites) {
        //     var particles = this.composites[c].particles;
        //     for (i in particles)
        //         this.bounds(particles[i]);
        // }
    }

    nearestEntity() {
        let c;
        let i;
        let d2Nearest = 0;
        let entity = null;
        let constraintsNearest = null;

        // find nearest point
        for (c in this.composites) {
            const particles = this.composites[c].particles;
            for (i in particles) {
                const d2 = particles[i].pos.dist2(this.mouse);
                if (d2 <= this.selectionRadius*this.selectionRadius && (entity === null || d2 < d2Nearest)) {
                    entity = particles[i];
                    constraintsNearest = this.composites[c].constraints;
                    d2Nearest = d2;
                }
            }
        }

        // search for pinned constraints for this entity
        for (i in constraintsNearest)
            if (constraintsNearest[i] instanceof PinConstraint && constraintsNearest[i].a === entity)
                entity = constraintsNearest[i];

        return entity;
    }
}

export class Composite {
    constructor() {
        this.particles = [];
        this.constraints = [];
        
        this.drawParticles = null;
        this.drawConstraints = null;
    }

    pin(index, pos) {
        pos = pos || this.particles[index].pos;
        const pc = new PinConstraint(this.particles[index], pos);
        this.constraints.push(pc);
        return pc;
    }
}

