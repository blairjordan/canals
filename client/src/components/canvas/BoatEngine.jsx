

class BoatEngine {
    constructor() {
        this.hasFuel = true;

        this.maxPower = 0.0075
        this.maxReverse = 0.0065
        this.powerFactor = 0.0001
        this.reverseFactor = 0.0001
      
        this.boosting = false;
        this.boosterPower = 0.0050

        this.drag = 0.85;
        this.angularDrag = 0.55;
        this.maxTurningPower = 0.0015
        this.turningFactor = 0.00002

        this.x= 0;
        this.y= 0;
        this.xVelocity= 0;
        this.yVelocity= 0;
        this.power= 0;
        this.turningPower = 0
        this.reverse= 0;
        this.angle=0;
        this.angularVelocity= 0;
        this.isThrottling= false;
        this.isReversing= false;
        this.isTurningLeft= false;
        this.isTurningRight= false;

        this.throttling = false
        this.reversing = false
      }

    updatePosition(x, y) {
      this.x= x;
      this.y= y;
    }

    update (delta) {
        if (this.isThrottling && this.hasFuel) {
          if(!this.throttling) {
            this.turningPower = 0;
            this.throttling = true
          }
          this.power += this.powerFactor * this.isThrottling;
        } else {
          this.power -= (this.powerFactor * 0.75);
          if(this.power <0) this.power = 0
        }
        if (this.isReversing && this.hasFuel) {
          if(!this.reversing) {
            this.turningPower = 0;
            this.reversing = true
          }
          this.reverse += this.reverseFactor;
        } else {
          this.reverse -= (this.reverseFactor * 0.75);
          if(this.reverse <0) this.reverse = 0
        }

        this.power = Math.max(0, Math.min(this.maxPower+(this.boosting ? this.boosterPower : 0), this.power*(this.boosting ? 2.0 : 1.0)));
        this.reverse = Math.max(0, Math.min(this.maxReverse, this.reverse));
    
        const direction = this.power >= this.reverse ? 1 : -1;
    
        if (this.isTurningLeft) {
          this.turningPower += this.turningFactor
          if(this.turningPower > this.maxTurningPower) this.turningPower = this.maxTurningPower
        } else if (this.isTurningRight) {
          this.turningPower -= this.turningFactor
          if(this.turningPower < -this.maxTurningPower) this.turningPower = -this.maxTurningPower
        } else {
          //return to 0
          if(this.turningPower > 0) {
            this.turningPower -= (this.turningFactor * 0.25)
            if(this.turningPower < 0 ) this.turningPower = 0
          } else {
            this.turningPower += (this.turningFactor * 0.25)
            if(this.turningPower >0 ) this.turningPower = 0
          }
        }

        this.angularVelocity += direction * this.turningPower;
        // if (this.isTurningLeft) {
        //   this.angularVelocity += direction * this.turnSpeed * this.isTurningLeft;
        // }
        // if (this.isTurningRight) {
        //   this.angularVelocity -= direction * this.turnSpeed * this.isTurningRight;
        // }
    
        this.xVelocity += Math.sin(this.angle) * (this.power - this.reverse);
        this.yVelocity += Math.cos(this.angle) * (this.power - this.reverse);
    
        this.x += this.xVelocity;
        this.y -= this.yVelocity;
        this.xVelocity *= this.drag;
        this.yVelocity *= this.drag;
        this.angle += this.angularVelocity;
        this.angularVelocity *= this.angularDrag;
      }

}

export {BoatEngine}