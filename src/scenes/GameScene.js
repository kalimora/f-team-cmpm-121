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

        // Add cell to the grid array with new properties
        this.grid.push({
          x,
          y,
          rect: cell,
          hasPlant: false,
          plantSprite: null,
          sun: 0,
          water: 0,
          plantType: null, // New property to store the plant type
          growthLevel: 0,  // New property to store the growth level
        });
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
      const sunGain = Phaser.Math.Between(0, 6); // Random sun between 0 and 6
      const waterGain = Phaser.Math.Between(0, 2); // Random water between 0 and 2

      // Sun energy is used immediately or lost; it does not accumulate
      cell.sun = sunGain;
      
      // Water accumulates over time, up to a maximum of 10
      cell.water = Math.min(cell.water + waterGain, 10); // Cap water at a maximum of 10 
     
      // Update visual feedback based on resource levels
      const sunColorIntensity = Math.min(255, cell.sun * 80);
      const waterColorIntensity = Math.min(255, cell.water * 25);
      const color = cell.water === 10 
        ? Phaser.Display.Color.GetColor(0, 100, 255)  // Fixed color if water is at maximum
        : Phaser.Display.Color.GetColor(sunColorIntensity, 100, waterColorIntensity);

      cell.rect.setFillStyle(color);

      // Log the updated values for debugging
      console.log(
        `Cell (${cell.x}, ${cell.y}) - Sun: ${cell.sun}, Water: ${cell.water}`
      );
    });
  }

  handleTimeBasedEvents() {
    console.log('Handling events for gameTime:', this.gameTime);
    this.grid.forEach((cell) => {
      if (cell.hasPlant) {
        // Increase the growth level if conditions are met
        if(cell.plantType == 1 || cell.plantType == 2){
          this.plantGrowth(1, 1, 1, 2, 2, cell);
        } else if(cell.plantType == 3){
          this.plantGrowth(3, 3, 3, 3, 1, cell);
        }
      }
    });
  }

  plantGrowth(waterReq, sunReq, plantReq1, plantReq2, neighborReq, cell){
    if(cell.water > waterReq && cell.sun > sunReq && (cell.plantType == plantReq1 || cell.plantType == plantReq2) && cell.growthLevel < 5){
      // Check nearby cells for the same plant type
      let nearbyPlants = 0;
      for(let i = -1; i < 2; i++){
        for(let j = -1; j < 2; j++){
          const tempCell = this.grid.find(
          (tcell) => tcell.x === cell.x + 1 && tcell.y === cell.y + j);
          if(tempCell != null && (tempCell.plantType == plantReq1 || tempCell.plantType == plantReq2)){
            nearbyPlants += 1;
          }
        }
      }
      if((nearbyPlants - 1) >= neighborReq){
        cell.growthLevel += 1;
        // Update the plant sprite frame to represent the growth level
        if(cell.plantType != 3){
          cell.plantSprite.setFrame(cell.growthLevel);
        } else{
          cell.plantSprite.setFrame(6 + cell.growthLevel);
        }

        console.log(`Plant at (${cell.x}, ${cell.y}) grew to level ${cell.growthLevel}`);
      }
    }
  }

  reapPlant() {
    const playerCell = this.getPlayerCell(); // Get the cell where the player is currently located
    if (playerCell && playerCell.hasPlant) {
      console.log(`Reaping plant at (${playerCell.x}, ${playerCell.y}) of type ${playerCell.plantType} and level ${playerCell.growthLevel}`); // Log the plant type and growth level
      playerCell.hasPlant = false; // Set the cell's plant status to false
      playerCell.plantType = null; // Clear plant type
      playerCell.growthLevel = 0; // Reset growth level
      playerCell.water = 0; // Reset water level
      playerCell.sun = 0; // Reset sun level

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
      playerCell.plantType = Phaser.Math.Between(1, 3); // Randomly assign a plant type (1, 2, or 3)
      playerCell.growthLevel = 1; // Start the plant at growth level 1
      playerCell.rect.setFillStyle(0x8b4513); // Change the cell color to indicate a plant is present

      // Add a visual representation of the plant using a specific frame
      if(playerCell.plantType != 3){
        playerCell.plantSprite = this.add.sprite(
          playerCell.rect.x,
          playerCell.rect.y,
          'plant',
          0
        ).setScale(2); // Add a plant sprite and scale it down to fit in the cell

      } else {
        playerCell.plantSprite = this.add.sprite(
          playerCell.rect.x,
          playerCell.rect.y,
          'plant',
          6
        ).setScale(2); // Add a plant sprite and scale it down to fit in the cell
      }

      console.log(`Plant type ${playerCell.plantType} sown with growth level ${playerCell.growthLevel}`);
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
