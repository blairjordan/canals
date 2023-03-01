import * as THREE from "three";

const _tempQuaternion = new THREE.Quaternion();
const _tempVector3 = new THREE.Vector3();
const _tempEuler = new THREE.Vector3();

export function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

export function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; 
      b >>>= 0; 
      c >>>= 0; 
      d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = c + (c << 3) | 0;
      c = ((c << 21) | (c >>> 11));
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

export function shuffle(array, rand) {
    let currentIndex = array.length,  randomIndex;
  
    if(array.length===0) return array;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(rand() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

function isPositive( start, end, intersection ){ // all parameters are THREE.Vector3()
    let v1 = new THREE.Vector3().copy( end ).sub( start );
    let v2 = new THREE.Vector3().copy( intersection ).sub( start );
    return v1.dot( v2 ) >= 0;
  }
  
  // checks if two line segments will intersect on a point 
  // when traveling in one specific direction from start to end
  // but not in the direction from end to start
  // params (THREE.Line3, THREE.Line3)
  export function getIntersectionOnAPoint(line1Start, line1End, line2Start, line2End)
  { 
    var intersection = null;
    var A = line1Start;
    var B = line1End;
    var C = line2Start;
    var D = line2End;
  
    // Line AB represented as a1x + b1y = c1 
    var a1 = B.y - A.y; 
    var b1 = A.x - B.x; 
    var c1 = a1*(A.x) + b1*(A.y); 
  
    // Line CD represented as a2x + b2y = c2 
    var a2 = D.y - C.y; 
    var b2 = C.x - D.x; 
    var c2 = a2*(C.x)+ b2*(C.y); 
  
    var determinant = a1*b2 - a2*b1; 
  
    if (determinant === 0) { 
      // The lines are parallel.
    } else { 
        var x = (b2*c1 - b1*c2)/determinant; 
      var y = (a1*c2 - a2*c1)/determinant; 
      intersection = {x, y}; 
    }
    
    // if there is an intersection. verify intersection occurs on the two line segments
    // when calculating from start to end
    if (intersection) {
        var line1result = isPositive( line1Start, line1End, intersection );
      var line2result = isPositive( line2Start, line2End, intersection );
      if ( line1result && line2result ) {
        // do nothing when the intersection is not "false" as both results are "true"
      }
      else { // 
        // set intersection to null when the intersection is "false" as one of results is "false"
        intersection = null;
      }
    }
    return intersection;
  }

export function lerpValues(value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

export function rotateAroundPoint(center, point, angle) {
    point.rotateAround(
      center,
      angle * THREE.MathUtils.DEG2RAD
    );
}

export function randomIndex(start, end) {
    if (start == null) start = 0;
    if (end == null) end = 1;
    return Math.floor(start + (Math.random() * ((end - start) + 1)));
}

export function rotatePointAroundPivot(point, pivot, angles) {
    _tempEuler.set(angles[0], angles[1], angles[2]);
    _tempQuaternion.setFromEuler(_tempEuler);
    _tempVector3.copy(point);
    _tempVector3.sub(pivot);
    _tempVector3.applyQuaternion(_tempQuaternion)
    return _tempVector3.add(pivot);
  }

export function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function downloadTxt(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}