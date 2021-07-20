let game;
window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 600,
      height: 600,
    },
    scene: playGame,
    physics: {
      default: "matter",
      matter: {
        gravity: {
          y: 1,
        },
        debug: true,
        debugBodyColor: 0xff00ff,
        debugWireframes: false,
      },
    },
  };
  game = new Phaser.Game(gameConfig);
  window.focus();
};
class playGame extends Phaser.Scene {
  static score = 0;
  constructor() {
    super("PlayGame");
  }
  create() {
    // matter settings
    this.matter.world.update30Hz();
    this.matter.world.setBounds(
      10,
      10,
      game.config.width - 20,
      game.config.height - 20
    );

    // random cannon properties
    let angle = Phaser.Math.Between(50, 80);
    let width = Phaser.Math.Between(20, 50);
    let length = Phaser.Math.Between(120, 250);
    let thickness = Phaser.Math.Between(10, 20);
    let position = new Phaser.Math.Vector2(game.config.width / 6, 550);

    // bottom body
    let bottomWidthOfCannon = width + thickness * 2;
    let cannonBody = this.matter.add.rectangle(
      position.x,
      position.y,
      bottomWidthOfCannon,
      thickness,
      this.setProperties(true, angle)
    );

    // some trigonometry useful to find the origins of cannon side bodies
    let bottomCathetus = (width + thickness) / 2;
    let sideCathetus = (length + thickness) / 2;
    let hypotenuse = Math.sqrt(
      Math.pow(bottomCathetus, 2) + Math.pow(sideCathetus, 2)
    );
    let bottomAngle = Phaser.Math.RadToDeg(
      Math.asin(sideCathetus / hypotenuse)
    );

    // side body 1
    let firstSideOrigin = this.moveBy(
      position,
      hypotenuse,
      90 - bottomAngle - angle
    );
    this.matter.add.rectangle(
      firstSideOrigin.x,
      firstSideOrigin.y,
      thickness,
      length,
      this.setProperties(true, angle)
    );

    // side body 2
    let secondSideOrigin = this.moveBy(
      position,
      hypotenuse,
      bottomAngle - 90 - angle
    );
    this.matter.add.rectangle(
      secondSideOrigin.x,
      secondSideOrigin.y,
      thickness,
      length,
      this.setProperties(true, angle)
    );

    // let wall1 = this.moveBy(new Phaser.Math.Vector2(50, 50), 50, 45);
    // //Side wall 1
    // this.matter.add.rectangle(
    //   wall1.x,
    //   wall1.y,
    //   10,
    //   300,
    //   this.setProperties(true, 45)
    // );

    // let wall2 = this.moveBy(new Phaser.Math.Vector2(500, 50), 50, 45);
    // //Side wall 1
    // this.matter.add.rectangle(
    //   wall2.x,
    //   wall2.y,
    //   10,
    //   300,
    //   this.setProperties(true, -45)
    // );

    // trigger
    let triggerOrigin = this.moveBy(
      position,
      length - (width * 3 - thickness) / 2,
      -angle
    );
    let trigger = this.matter.add.rectangle(
      triggerOrigin.x,
      triggerOrigin.y,
      width,
      width,
      this.setProperties(false, angle)
    );

    // cannon ball
    let ballOrigin = this.moveBy(
      position,
      width + length - (width * 3 - thickness) / 2,
      -angle
    );
    this.matter.add.circle(
      ballOrigin.x,
      ballOrigin.y,
      width / 2,
      this.setProperties(false, angle, "ball")
    );

    // constraint
    let constraintLength = length + (thickness - width * 3) / 2;
    this.constraint = this.matter.add.constraint(
      cannonBody,
      trigger,
      constraintLength,
      1
    );
    this.constraintFireLength = constraintLength + width;
    this.constrainMinLength = width / 2 + thickness / 2;

    let targetWidth = Phaser.Math.Between(80, 120);
    let targetHeight = Phaser.Math.Between(120, 180);
    let targetThickness = Phaser.Math.Between(10, 20);
    let targetPosition = new Phaser.Math.Vector2(
      Phaser.Math.Between(
        (game.config.width / 4) * 3,
        (game.config.width / 5) * 4
      ),
      game.config.height - Phaser.Math.Between(40, 80)
    );

    // target
    this.matter.add.rectangle(
      targetPosition.x,
      targetPosition.y,
      targetWidth + targetThickness * 2,
      targetThickness,
      {
        isStatic: true,
      }
    );
    this.matter.add.rectangle(
      targetPosition.x + (targetWidth + targetThickness) / 2,
      targetPosition.y - (targetHeight + targetThickness) / 2,
      targetThickness,
      targetHeight,
      {
        isStatic: true,
      }
    );
    this.matter.add.rectangle(
      targetPosition.x - (targetWidth + targetThickness) / 2,
      targetPosition.y - (targetHeight + targetThickness) / 2,
      targetThickness,
      targetHeight,
      {
        isStatic: true,
      }
    );

    // this is the sensor used
    this.matter.add.rectangle(
      targetPosition.x,
      targetPosition.y - 1,
      targetWidth,
      targetThickness,
      {
        isStatic: true,
        isSensor: true,
        label: "goal",
      }
    );

    // a text to show if the player hits the target
    this.yeahText = this.add.text(game.config.width / 2, 200, "Balll INNN !!", {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#00ff00",
    });
    this.yeahText.setOrigin(-0.2);
    this.yeahText.setVisible(false);

    this.score = this.add.text(
      game.config.width / 2,
      200,
      "Score: " + playGame.score,
      {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#00ff00",
      }
    );
    this.score.setOrigin(4);
    // check for collision between the sensor and the ball
    this.matter.world.on(
      "collisionstart",
      function (event, bodyA, bodyB) {
        if (
          (bodyA.label == "ball" && bodyB.label == "goal") ||
          (bodyA.label == "goal" && bodyB.label == "ball")
        ) {
          // show the text if the ball hits the sensor
          playGame.score += 1;
          this.yeahText.visible = true;
        }
      },
      this
    );

    // listeners and flags
    this.input.on("pointerdown", this.charge, this);
    this.input.on("pointerup", this.fire, this);
    this.charging = false;
  }

  // charge
  charge() {
    this.charging = true;
  }

  // fire: look how stiffness changes, then restart the game
  fire() {
    this.charging = false;
    this.constraint.stiffness = 0.02;
    this.constraint.length = this.constraintFireLength;
    this.time.addEvent({
      delay: 6000,
      callbackScope: this,
      callback: function () {
        this.scene.start("PlayGame");
      },
    });
  }

  // we reduce constraint length if charging
  update() {
    if (this.charging && this.constraint.length > this.constrainMinLength) {
      this.constraint.length -= 1;
    }
  }

  // utility method to create an object with body properties
  setProperties(isStatic, angle, label) {
    if (label == undefined) {
      label = "";
    }
    let radians = Phaser.Math.DegToRad(90 - angle);
    return {
      isStatic: isStatic,
      angle: radians,
      friction: 0,
      label: label,
      restitution: 0.4,
    };
  }

  // utility method to move a point by "distance" pixels in "degrees" direction
  moveBy(point, distance, degrees) {
    let radians = Phaser.Math.DegToRad(degrees);
    return new Phaser.Math.Vector2(
      point.x + distance * Math.cos(radians),
      point.y + distance * Math.sin(radians)
    );
  }
}
