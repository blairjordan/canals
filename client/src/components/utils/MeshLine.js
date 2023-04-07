import * as THREE from "three";
export default class MeshLine extends THREE.BufferGeometry {
    constructor()
    {
    super();
    this.isMeshLine = true;
    this.type = 'MeshLine'

    this.positions = []

    this.previous = []
    this.next = []
    this.side = []
    this.width = []
    this.indices_array = []
    this.uvs = []
    this.counters = []
    this._points = []
    this._geom = null

    this.widthCallback = null

    // Used to raycast
    this.matrixWorld = new THREE.Matrix4()

    Object.defineProperties(this, {
        // this is now a bufferGeometry
        // add getter to support previous api
        geometry: {
        enumerable: true,
        get: function() {
            return this
        },
        },
        geom: {
        enumerable: true,
        get: function() {
            return this._geom
        },
        set: function(value) {
            this.setGeometry(value, this.widthCallback)
        },
        },
        // for declaritive architectures
        // to return the same value that sets the points
        // eg. this.points = points
        // console.log(this.points) -> points
        points: {
        enumerable: true,
        get: function() {
            return this._points
        },
        set: function(value) {
            this.setPoints(value, this.widthCallback)
        },
        },
    })
    }


    setMatrixWorld = function(matrixWorld) {
        this.matrixWorld = matrixWorld
    }
    
    // setting via a geometry is rather superfluous
    // as you're creating a unecessary geometry just to throw away
    // but exists to support previous api
    setGeometry = function(g, c) {
            // as the input geometry are mutated we store them
            // for later retreival when necessary (declaritive architectures)
            this._geometry = g;
            this.setPoints(g.getAttribute("position").array, c);
    }
    
    setPoints = function(points, wcb) {
            if (!(points instanceof Float32Array) && !(points instanceof Array)) {
                console.error(
                    "ERROR: The BufferArray of points is not instancied correctly."
                );
                return;
            }
            // as the points are mutated we store them
            // for later retreival when necessary (declaritive architectures)
            this._points = points;
            this.widthCallback = wcb;
            this.positions = [];
            this.counters = [];
            if (points.length && points[0] instanceof THREE.Vector3) {
                // could transform Vector3 array into the array used below
                // but this approach will only loop through the array once
                // and is more performant
                for (var j = 0; j < points.length; j++) {
                    var p = points[j];
                    var c = j / points.length;
                    this.positions.push(p.x, p.y, p.z);
                    this.positions.push(p.x, p.y, p.z);
                    this.counters.push(c);
                    this.counters.push(c);
                }
            } else {
                for (var j = 0; j < points.length; j += 3) {
                    var c = j / points.length;
                    this.positions.push(points[j], points[j + 1], points[j + 2]);
                    this.positions.push(points[j], points[j + 1], points[j + 2]);
                    this.counters.push(c);
                    this.counters.push(c);
                }
            }
            this.process();
    }
    
    MeshLineRaycast(raycaster, intersects) {
        var inverseMatrix = new THREE.Matrix4()
        var ray = new THREE.Ray()
        var sphere = new THREE.Sphere()
        var interRay = new THREE.Vector3()
        var geometry = this.geometry
        // Checking boundingSphere distance to ray
    
        if (!geometry.boundingSphere) geometry.computeBoundingSphere()
        sphere.copy(geometry.boundingSphere)
        sphere.applyMatrix4(this.matrixWorld)
    
        if (raycaster.ray.intersectSphere(sphere, interRay) === false) {
        return
        }
    
        inverseMatrix.copy( this.matrixWorld ).invert();
        ray.copy(raycaster.ray).applyMatrix4(inverseMatrix)
    
        var vStart = new THREE.Vector3()
        var vEnd = new THREE.Vector3()
        var interSegment = new THREE.Vector3()
        var step = this instanceof THREE.LineSegments ? 2 : 1
        var index = geometry.index
        var attributes = geometry.attributes
    
        if (index !== null) {
        var indices = index.array
        var positions = attributes.position.array
        var widths = attributes.width.array
    
        for (var i = 0, l = indices.length - 1; i < l; i += step) {
            var a = indices[i]
            var b = indices[i + 1]
    
            vStart.fromArray(positions, a * 3)
            vEnd.fromArray(positions, b * 3)
            var width = widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1
            var precision = raycaster.params.Line.threshold + (this.material.lineWidth * width) / 2
            var precisionSq = precision * precision
    
            var distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment)
    
            if (distSq > precisionSq) continue
    
            interRay.applyMatrix4(this.matrixWorld) //Move back to world space for distance calculation
    
            var distance = raycaster.ray.origin.distanceTo(interRay)
    
            if (distance < raycaster.near || distance > raycaster.far) continue
    
            intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this,
            })
            // make event only fire once
            i = l
        }
        }
    }
    compareV3 = function(a, b) {
        var aa = a * 6
        var ab = b * 6
        return (
        this.positions[aa] === this.positions[ab] &&
        this.positions[aa + 1] === this.positions[ab + 1] &&
        this.positions[aa + 2] === this.positions[ab + 2]
        )
    }
    
    copyV3 = function(a) {
        var aa = a * 6
        return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]]
    }
    
    process = function() {
        var l = this.positions.length / 6
    
        this.previous = []
        this.next = []
        this.side = []
        this.width = []
        this.indices_array = []
        this.uvs = []
    
        var w
    
        var v
        // initial previous points
        if (this.compareV3(0, l - 1)) {
        v = this.copyV3(l - 2)
        } else {
        v = this.copyV3(0)
        }
        this.previous.push(v[0], v[1], v[2])
        this.previous.push(v[0], v[1], v[2])
    
        for (var j = 0; j < l; j++) {
        // sides
        this.side.push(1)
        this.side.push(-1)
    
        // widths
        if (this.widthCallback) w = this.widthCallback(j / (l - 1))
        else w = 1
        this.width.push(w)
        this.width.push(w)
    
        // uvs
        this.uvs.push(j / (l - 1), 0)
        this.uvs.push(j / (l - 1), 1)
    
        if (j < l - 1) {
            // points previous to poisitions
            v = this.copyV3(j)
            this.previous.push(v[0], v[1], v[2])
            this.previous.push(v[0], v[1], v[2])
    
            // indices
            var n = j * 2
            this.indices_array.push(n, n + 1, n + 2)
            this.indices_array.push(n + 2, n + 1, n + 3)
        }
        if (j > 0) {
            // points after poisitions
            v = this.copyV3(j)
            this.next.push(v[0], v[1], v[2])
            this.next.push(v[0], v[1], v[2])
        }
        }
    
        // last next point
        if (this.compareV3(l - 1, 0)) {
        v = this.copyV3(1)
        } else {
        v = this.copyV3(l - 1)
        }
        this.next.push(v[0], v[1], v[2])
        this.next.push(v[0], v[1], v[2])
    
        // redefining the attribute seems to prevent range errors
        // if the user sets a differing number of vertices
        if (!this._attributes || this._attributes.position.count !== this.positions.length) {
        this._attributes = {
            position: new THREE.BufferAttribute(new Float32Array(this.positions), 3),
            previous: new THREE.BufferAttribute(new Float32Array(this.previous), 3),
            next: new THREE.BufferAttribute(new Float32Array(this.next), 3),
            side: new THREE.BufferAttribute(new Float32Array(this.side), 1),
            width: new THREE.BufferAttribute(new Float32Array(this.width), 1),
            uv: new THREE.BufferAttribute(new Float32Array(this.uvs), 2),
            index: new THREE.BufferAttribute(new Uint16Array(this.indices_array), 1),
            counters: new THREE.BufferAttribute(new Float32Array(this.counters), 1),
        }
        } else {
        this._attributes.position.copyArray(new Float32Array(this.positions))
        this._attributes.position.needsUpdate = true
        this._attributes.previous.copyArray(new Float32Array(this.previous))
        this._attributes.previous.needsUpdate = true
        this._attributes.next.copyArray(new Float32Array(this.next))
        this._attributes.next.needsUpdate = true
        this._attributes.side.copyArray(new Float32Array(this.side))
        this._attributes.side.needsUpdate = true
        this._attributes.width.copyArray(new Float32Array(this.width))
        this._attributes.width.needsUpdate = true
        this._attributes.uv.copyArray(new Float32Array(this.uvs))
        this._attributes.uv.needsUpdate = true
        this._attributes.index.copyArray(new Uint16Array(this.indices_array))
        this._attributes.index.needsUpdate = true
        }
    
        this.setAttribute('position', this._attributes.position)
        this.setAttribute('previous', this._attributes.previous)
        this.setAttribute('next', this._attributes.next)
        this.setAttribute('side', this._attributes.side)
        this.setAttribute('width', this._attributes.width)
        this.setAttribute('uv', this._attributes.uv)
        this.setAttribute('counters', this._attributes.counters)
    
        this.setIndex(this._attributes.index)
    
        this.computeBoundingSphere()
        this.computeBoundingBox()
    }
    
    memcpy(src, srcOffset, dst, dstOffset, length) {
        var i
    
        src = src.subarray || src.slice ? src : src.buffer
        dst = dst.subarray || dst.slice ? dst : dst.buffer
    
        src = srcOffset
        ? src.subarray
            ? src.subarray(srcOffset, length && srcOffset + length)
            : src.slice(srcOffset, length && srcOffset + length)
        : src
    
        if (dst.set) {
        dst.set(src, dstOffset)
        } else {
        for (i = 0; i < src.length; i++) {
            dst[i + dstOffset] = src[i]
        }
        }
    
        return dst
    }
    
    /**
     * Fast method to advance the line by one position.  The oldest position is removed.
     * @param position
     */
    advance = function(position) {
        var positions = this._attributes.position.array
        var previous = this._attributes.previous.array
        var next = this._attributes.next.array
        var l = positions.length
    
        // PREVIOUS
        this.memcpy(positions, 0, previous, 0, l)
    
        // POSITIONS
        this.memcpy(positions, 6, positions, 0, l - 6)
    
        positions[l - 6] = position.x
        positions[l - 5] = position.y
        positions[l - 4] = position.z
        positions[l - 3] = position.x
        positions[l - 2] = position.y
        positions[l - 1] = position.z
    
        // NEXT
        this.memcpy(positions, 6, next, 0, l - 6)
    
        next[l - 6] = position.x
        next[l - 5] = position.y
        next[l - 4] = position.z
        next[l - 3] = position.x
        next[l - 2] = position.y
        next[l - 1] = position.z
    
        this._attributes.position.needsUpdate = true
        this._attributes.previous.needsUpdate = true
        this._attributes.next.needsUpdate = true
    }
    
}
  