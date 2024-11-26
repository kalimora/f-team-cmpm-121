export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture, frame);
      // Scale the player
      this.setScale(3);
      // Add the player to the scene
      scene.add.existing(this);
  
      // Player's position on the grid
      this.gridX = 0;
      this.gridY = 0;
  
      // Update the sprite's initial position
      this.updatePosition(scene.gridOrigin, scene.cellSize);
    }
  
    move(deltaX, deltaY) {
      // Update grid position
      this.gridX += deltaX;
      this.gridY += deltaY;
  
      // Update the sprite's position on the screen
      this.updatePosition(this.scene.gridOrigin, this.scene.cellSize);
    }
  
    updatePosition(gridOrigin, cellSize) {
      this.x = gridOrigin.x + this.gridX * cellSize;
      this.y = gridOrigin.y + this.gridY * cellSize;
    }
  }
  