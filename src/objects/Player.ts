import Phaser from "phaser";

export default class Player extends Phaser.GameObjects.Sprite {
  // Define class properties with explicit types
  private gridX: number;
  private gridY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    // Scale the player sprite
    this.setScale(3);

    // Add the player object to the scene
    scene.add.existing(this);

    // Initialize grid position
    this.gridX = 0;
    this.gridY = 0;

    // Update the position based on grid and cell size
    this.updatePosition(scene.gridOrigin as { x: number; y: number }, scene.cellSize as number);
  }

  // Method to move the player on the grid
  move(deltaX: number, deltaY: number): void {
    this.gridX += deltaX;
    this.gridY += deltaY;

    // Update the position on the screen
    this.updatePosition(this.scene.gridOrigin as { x: number; y: number }, this.scene.cellSize as number);
  }

  // Method to update the player's screen position based on grid and cell size
  updatePosition(gridOrigin: { x: number; y: number }, cellSize: number): void {
    this.x = gridOrigin.x + this.gridX * cellSize;
    this.y = gridOrigin.y + this.gridY * cellSize;
  }
}
