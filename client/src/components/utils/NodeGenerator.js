import * as THREE from 'three'

class NodeGenerator {
  constructor() {
    this.seed = this.cyrb128('node generator')
    this.rand = this.sfc32(this.seed[0], this.seed[1], this.seed[2], this.seed[3])

    this.nodeVectors = []
    this.nodeConnections = []
    this.nodeSections = []
    this.nodeSectionPoints = []
    this.nodeDeadends = []

    this.vector2 = new THREE.Vector2()
    this.vector2a = new THREE.Vector2()
    this.vector2b = new THREE.Vector2()

    this.initiated = false
  }

  init() {
    if(!this.initiated) {
      this.initiated = true
      this.initNodes()
    }
  }

  initNodes() {
    const XCount = 8
    const ZCount = 8
    const areaSize = 500
    const areaRandom = 350

    for (let z = -XCount; z <= XCount; z++) {
      this.nodeVectors[z + ZCount] = []
      for (let x = -XCount; x <= XCount; x++) {
        const chance = this.rand() * 100
        const iscentre = x === 0 && z === 0
        const varianceDistance = (Math.abs(x)+Math.abs(z)) / 30
        const rx = iscentre ? 0 : this.rand() * areaRandom - areaRandom * 0.5 * varianceDistance
        const rz = iscentre ? 0 : this.rand() * areaRandom - areaRandom * 0.5 * varianceDistance
        const n = new THREE.Vector3(x * areaSize + rx, 0, z * areaSize + rz)
        this.nodeVectors[z + ZCount][x + XCount] = n
        if (x < ZCount) {
          this.nodeConnections.push([z + ZCount, x + XCount, z + ZCount + 1, x + XCount])
        }
        if (z < ZCount) {
          this.nodeConnections.push([z + ZCount, x + XCount, z + ZCount, x + XCount + 1])
        }

        if (z < ZCount && x < XCount) {
          const section = []
          section.push([z + ZCount, x + XCount])
          section.push([z + ZCount + 1, x + XCount])
          section.push([z + ZCount + 1, x + XCount + 1])
          section.push([z + ZCount, x + XCount + 1])
          this.nodeSections.push(section)

          if (!iscentre) {
            if (chance > 90.0) {
              if (z + ZCount - 1 >= 0 && x + XCount - 1 >= 0) {
                const mid = 0.2 + this.rand() * 0.6
                const c = new THREE.Vector3()
                const a = n
                const b =
                  chance > 95
                    ? this.nodeVectors[z + ZCount - 1][x + XCount]
                    : this.nodeVectors[z + ZCount][x + XCount - 1]
                this.nodeDeadends.push(c.lerpVectors(a, b, mid))
              }
            }
          }
        }
      }
    }

    this.nodeSections.forEach((section) => {
      this.nodeSectionPoints.push(this.createNodeSectionPoints(section))
    })

  }

  createNodeSectionPoints(section) {

    const nodeA = this.nodeVectors[section[0][0]][section[0][1]]
    const nodeB = this.nodeVectors[section[1][0]][section[1][1]]
    const nodeC = this.nodeVectors[section[2][0]][section[2][1]]
    const nodeD = this.nodeVectors[section[3][0]][section[3][1]]
    const sortSection = [nodeA, nodeB, nodeC, nodeD]
    this.sort(sortSection)

    const points = []
    points.push(new THREE.Vector2(sortSection[0].x, -sortSection[0].z))
    points.push(new THREE.Vector2(sortSection[1].x, -sortSection[1].z))
    points.push(new THREE.Vector2(sortSection[2].x, -sortSection[2].z))
    points.push(new THREE.Vector2(sortSection[3].x, -sortSection[3].z))

    const centroid = new THREE.Vector2()
    points.forEach((p) => centroid.add(p))
    centroid.divideScalar(points.length)
    points.forEach((p) => p.sub(centroid))
    points.forEach((p) => p.multiplyScalar(0.92))
    points.forEach((p) => p.add(centroid))

    const path = new THREE.Shape()
    this.vector2a.copy(points[0]).lerp(points[1], 0.05)
    path.moveTo(this.vector2a.x, this.vector2a.y)

    this.vector2.copy(points[0]).lerp(points[1], 0.90)
    path.lineTo(this.vector2.x, this.vector2.y)
    this.vector2a.copy(points[1]).lerp(points[2], 0.05)
    path.bezierCurveTo(this.vector2.x, this.vector2.y, points[1].x, points[1].y, this.vector2a.x, this.vector2a.y)
    
    this.vector2.copy(points[1]).lerp(points[2], 0.90)
    path.lineTo(this.vector2.x, this.vector2.y);
    this.vector2a.copy(points[2]).lerp(points[3], 0.05)
    path.bezierCurveTo(this.vector2.x, this.vector2.y, points[2].x, points[2].y, this.vector2a.x, this.vector2a.y)
    
    this.vector2.copy(points[2]).lerp(points[3], 0.90)
    path.lineTo(this.vector2.x, this.vector2.y);
    this.vector2a.copy(points[3]).lerp(points[0], 0.05)
    path.bezierCurveTo(this.vector2.x, this.vector2.y, points[3].x, points[3].y, this.vector2a.x, this.vector2a.y)

    this.vector2.copy(points[3]).lerp(points[0], 0.90)
    path.lineTo(this.vector2.x, this.vector2.y);

    return path.getPoints()
  }

  sort(vertices) {
    for (var i = 1; i < vertices.length; i++) {
      var a = vertices[i - 1]
      var b = vertices[i]
      var j = i

      do {
        var distanceAngle = Math.abs(Math.atan2(a.z - b.z, a.x - b.x))
        if (
          distanceAngle == Math.PI / 2 ||
          distanceAngle == Math.PI ||
          distanceAngle == (3 * Math.PI) / 2 ||
          distanceAngle == 2 * Math.PI ||
          distanceAngle == 0
        ) {
          var tmp = vertices[i]
          vertices[i] = vertices[j]
          vertices[j] = tmp
          break
        }
        j++
        b = vertices[j]
      } while (j < vertices.length)
    }
  }

  cyrb128(str) {
    let h1 = 1779033703,
      h2 = 3144134277,
      h3 = 1013904242,
      h4 = 2773480762
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i)
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0]
  }

  sfc32(a, b, c, d) {
    return function () {
      a >>>= 0
      b >>>= 0
      c >>>= 0
      d >>>= 0
      var t = (a + b) | 0
      a = b ^ (b >>> 9)
      b = (c + (c << 3)) | 0
      c = (c << 21) | (c >>> 11)
      d = (d + 1) | 0
      t = (t + d) | 0
      c = (c + t) | 0
      return (t >>> 0) / 4294967296
    }
  }
}

export default new NodeGenerator()
