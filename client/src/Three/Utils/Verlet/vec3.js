
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

// A simple 2-dimensional vector implementation

//2023-02-26 Converted to 3d

class Vec3 {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    add({x, y, z}) {
        return new Vec3(this.x + x, this.y + y, this.z + z);
    }

    sub({x, y, z}) {
        return new Vec3(this.x - x, this.y - y, this.z - z);
    }

    mul({x, y, z}) {
        return new Vec3(this.x * x, this.y * y, this.z * z);
    }

    div({x, y, z}) {
        return new Vec3(this.x / x, this.y / y, this.z / z);
    }

    scale(coef) {
        return new Vec3(this.x*coef, this.y*coef, this.z*coef);
    }

    mutableSet({x, y, z}) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    mutableAdd({x, y, z}) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    mutableSub({x, y, z}) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }

    mutableMul({x, y, z}) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }

    mutableDiv({x, y, z}) {
        this.x /= x;
        this.y /= y;
        this.z /= z;
        return this;
    }

    mutableScale(coef) {
        this.x *= coef;
        this.y *= coef;
        this.z *= coef;
        return this;
    }

    equals({x, y, z}) {
        return this.x === x && this.y === y && this.z === z;
    }

    epsilonEquals({x, y, z}, epsilon) {
        return Math.abs(this.x - x) <= epsilon && Math.abs(this.y - y) <= epsilon && Math.abs(this.z - z) <= epsilon;
    }

    length(v) {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }

    length2(v) {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }

    dist(v) {
        return Math.sqrt(this.dist2(v));
    }

    dist2(v) {
        const x = v.x - this.x;
        const y = v.y - this.y;
        const z = v.z - this.z;
        return x*x + y*y + z*z;
    }

    normal() {
        const m = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        return new Vec3(this.x/m, this.y/m, this.z/m);
    }

    dot({x, y, z}) {
        return this.x*x + this.y*y + this.z*z;
    }

    angle({y, x}) {
        return Math.atan2(this.x*y-this.y*x,this.x*x+this.y*y);
    }

    angle2(vLeft, vRight) {
        return vLeft.sub(this).angle(vRight.sub(this));
    }

    rotate(origin, theta) {
        var xAngle = theta * Math.PI / 180;
        var yAngle = theta * Math.PI / 180;
        var zAngle = theta * Math.PI / 180;
        var translatedPoint = {
            x: this.x - origin.x,
            y: this.y - origin.y,
            z: this.z - origin.z
          };
        var rotatedPoint = {
            x: Math.cos(yAngle) * (Math.cos(zAngle) * translatedPoint.x + Math.sin(zAngle) * translatedPoint.y) - Math.sin(yAngle) * translatedPoint.z,
            y: Math.sin(xAngle) * (Math.cos(yAngle) * translatedPoint.z + Math.sin(yAngle) * (Math.sin(zAngle) * translatedPoint.x + Math.cos(zAngle) * translatedPoint.y)) + Math.cos(xAngle) * (Math.cos(zAngle) * translatedPoint.x - Math.sin(zAngle) * translatedPoint.y),
            z: Math.cos(xAngle) * (Math.cos(yAngle) * translatedPoint.z + Math.sin(yAngle) * (Math.sin(zAngle) * translatedPoint.x + Math.cos(zAngle) * translatedPoint.y)) - Math.sin(xAngle) * (Math.cos(zAngle) * translatedPoint.x - Math.sin(zAngle) * translatedPoint.y)
          };

        return new Vec3(
            rotatedPoint.x + origin.x,
            rotatedPoint.y + origin.y,
            rotatedPoint.z + origin.z
            );
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
}

export default Vec3;
