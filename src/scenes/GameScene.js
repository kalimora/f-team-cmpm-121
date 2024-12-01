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
        .on('pointerdown', () => this.advanceTime()); // Set up a button to advance game time

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

    this.createGrid(); // Create the grid

    // Create the player
    this.player = new Player(
      this,
      this.gridOrigin.x,
      this.gridOrigin.y,
      "player"
    );

    // Set up keyboard input for player movement
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up reap and sow actions
    this.input.keyboard.on('keydown-R', () => this.reapPlant()); // Reap a plant when 'R' key is pressed
    this.input.keyboard.on('keydown-S', () => this.sowPlant()); // Sow a plant when 'S' key is pressed
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
          .setStrokeStyle(2, 0x000000); // Set the outline color of the grid cell

        // Add cell to the grid array
        this.grid.push({ x, y, rect: cell, hasPlant: false, plantSprite: null, sun: 0, water: 0 });
      }
    }
  }

  update() {
    // Handle player movement using arrow keys
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.left) &&
      this.player.gridX > 0
    ) {
      this.player.move(-1, 0); // Move player left
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.right) &&
      this.player.gridX < this.gridSize - 1
    ) {
      this.player.move(1, 0); // Move player right
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
      this.player.gridY > 0
    ) {
      this.player.move(0, -1); // Move player up
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down) &&
      this.player.gridY < this.gridSize - 1
    ) {
      this.player.move(0, 1); // Move player down
    }
  }

  advanceTime() {
    this.gameTime += 1; // Increment the game's time counter by one unit
    console.log('Time advanced to: ' + this.gameTime);
    this.updateCellResources(); // Update sun and water levels for each grid cell
    this.handleTimeBasedEvents(); // Call a method to handle events that occur due to time advancement
    // Log a specific message when the button is clicked
    console.log(`Button clicked at gameTime: ${this.gameTime}`);
  }

  updateCellResources() {
    this.grid.forEach((cell) => {
      // Generate random sun and water levels
      const sunGain = Phaser.Math.Between(0, 3); // Random sun between 0 and 3
      const waterGain = Phaser.Math.Between(0, 2); // Random water between 0 and 2

      // Sun energy is used immediately or lost; it does not accumulate
      cell.sun = sunGain;
      
      // Water accumulates over time, up to a maximum of 10
      cell.water = Math.min(cell.water + waterGain, 10); // Cap water at a maximum of 10 

      // Log the updated values for debugging
      console.log(
        `Cell (${cell.x}, ${cell.y}) - Sun: ${cell.sun}, Water: ${cell.water}`
      );
    });
  }

  handleTimeBasedEvents() {
    // Example: Update resources, spawn enemies, change the environment
    console.log('Handling events for gameTime:', this.gameTime);
    // Here you can implement any game logic that depends on time (e.g., enemy spawns, resource regeneration, environmental changes)
  }

  reapPlant() {
    const playerCell = this.getPlayerCell(); // Get the cell where the player is currently located
    if (playerCell && playerCell.hasPlant) {
      console.log(`Reaping plant at (${playerCell.x}, ${playerCell.y})`); // Log the action of reaping a plant
      playerCell.hasPlant = false; // Set the cell's plant status to false
      if (playerCell.plantSprite) {
        playerCell.plantSprite.destroy(); // Remove the plant sprite
        playerCell.plantSprite = null; // Set the plant sprite reference to null
      }
      playerCell.rect.setFillStyle(0x057a26); // Reset the cell color to indicate no plant
    } else {
      console.log('No plant to reap here!'); // Log a message if there's no plant to reap
    }
  }

  sowPlant() {
    const playerCell = this.getPlayerCell(); // Get the cell where the player is currently located
    if (playerCell && !playerCell.hasPlant) {
      console.log(`Sowing plant at (${playerCell.x}, ${playerCell.y})`); // Log the action of sowing a plant
      playerCell.hasPlant = true; // Set the cell's plant status to true
      playerCell.rect.setFillStyle(0x8b4513); // Change the cell color to indicate a plant is present

      // Add a visual representation of the plant using a specific frame
      playerCell.plantSprite = this.add.sprite(
        playerCell.rect.x,
        playerCell.rect.y,
        'plant'
      ).setScale(2); // Add a plant sprite and scale it down to fit in the cell
    } else {
      console.log('A plant is already here!'); // Log a message if there's already a plant in the cell
    }
  }  

  getPlayerCell() {
    // Find the cell where the player is currently located
    return this.grid.find(
      (cell) => cell.x === this.player.gridX && cell.y === this.player.gridY
    );
  }
}
