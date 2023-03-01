
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

// DistanceConstraint -- constrains to initial distance
// PinConstraint -- constrains to static/fixed point
// AngleConstraint -- constrains 3 particles to an angle

import Vec3 from './vec3';

class DistanceConstraint {
    constructor(a, b, stiffness, distance /*optional*/) {
        this.a = a;
        this.b = b;
        this.distance = typeof distance != "undefined" ? distance : a.pos.sub(b.pos).length();
		this.initDistance = this.distance;
        this.stiffness = stiffness;
		this.initStiffness = this.stiffness;
    }

    relax(stepCoef) {
        const normal = this.a.pos.sub(this.b.pos);
        const m = normal.length2();
        normal.mutableScale(((this.distance*this.distance - m)/m)*this.stiffness*stepCoef);
        this.a.pos.mutableAdd(normal);
        this.b.pos.mutableSub(normal);
    }
}

class PinConstraint {
    constructor(a, pos) {
        this.a = a;
        this.pos = (new Vec3()).mutableSet(pos);
    }

    relax(stepCoef) {
        this.a.pos.mutableSet(this.pos);
    }
}

class AngleConstraint {
    constructor(a, b, c, stiffness) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
        this.stiffness = stiffness;
    }

    relax(stepCoef) {
        const angle = this.b.pos.angle2(this.a.pos, this.c.pos);
        let diff = angle - this.angle;
        
        if (diff <= -Math.PI)
            diff += 2*Math.PI;
        else if (diff >= Math.PI)
            diff -= 2*Math.PI;

        diff *= stepCoef*this.stiffness;
        
        this.a.pos = this.a.pos.rotate(this.b.pos, diff);
        this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
        this.b.pos = this.b.pos.rotate(this.a.pos, diff);
        this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
    }
}

export {DistanceConstraint, PinConstraint, AngleConstraint};
