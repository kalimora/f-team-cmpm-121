import Player from "../objects/Player.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
    this.gameTime = 0; // Initialize gameTime to track game time
  }

  create() {
    const buttonX = 50; // 50 pixels from the left edge of the game viewport
    const buttonY = this.game.config.height / 6; // Vertically centered in the game viewport
    const titleX = buttonX - 35;
    // Adding a title above the button
    this.add.text(titleX, buttonY - 65, 'Advance Time', { font: '16px Arial', fill: '#ffffff' });
    this.timeButton = this.add.image(buttonX, buttonY, 'timeAdvanceButton')
        .setInteractive()
        .on('pointerdown', () => this.advanceTime());

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Grid setup (might want to put this into an init() function or interface later)
    this.gridSize = 5; // 5x5 grid
    this.cellSize = 100; // Size of each grid cell
    const gridPixelSize = this.gridSize * this.cellSize;
    this.gridOrigin = {
      x: (this.game.config.width - gridPixelSize) / 2 + this.cellSize / 2,
      y: (this.game.config.height - gridPixelSize) / 2 + this.cellSize / 2,
    }; // Starting position of the grid
    this.grid = []; // Store grid cells

    this.createGrid();

    // Create the player
    this.player = new Player(
      this,
      this.gridOrigin.x,
      this.gridOrigin.y,
      "player"
    );

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createGrid() {
    // Create a 5x5 grid of rectangles
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cellX = this.gridOrigin.x + x * this.cellSize;
        const cellY = this.gridOrigin.y + y * this.cellSize;

        // Add a visual grid cell (optional)
        const cell = this.add
          .rectangle(
            cellX,
            cellY,
            this.cellSize - 5,
            this.cellSize - 5,
            0x057a26
          )
          .setStrokeStyle(2, 0x000000);

        // Add cell to the grid array
        this.grid.push({ x, y, rect: cell });
      }
    }
  }

  update() {
    // Handle player movement
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.left) &&
      this.player.gridX > 0
    ) {
      this.player.move(-1, 0);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.right) &&
      this.player.gridX < this.gridSize - 1
    ) {
      this.player.move(1, 0);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
      this.player.gridY > 0
    ) {
      this.player.move(0, -1);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down) &&
      this.player.gridY < this.gridSize - 1
    ) {
      this.player.move(0, 1);
    }
  }
  advanceTime() {
    this.gameTime += 1; // Increment the game's time counter by one unit
    console.log('Time advanced to: ' + this.gameTime);
    this.handleTimeBasedEvents(); // Call a method to handle events that occur due to time advancement
    // Log a specific message when the button is clicked
    console.log(`Button clicked at gameTime: ${this.gameTime}`);
}

handleTimeBasedEvents() {
    // Example: Update resources, spawn enemies, change the environment
    console.log('Handling events for gameTime:', this.gameTime);
    // Here you can implement any game logic that depends on time(enemy spawns, resources regren, enviornment)
}
}
