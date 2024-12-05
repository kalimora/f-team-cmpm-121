import Player from "../objects/Player.js";

class GridState {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.byteArray = new Uint8Array(gridSize * gridSize * 4); // Initialize the byte array with 4 bytes per cell
  }

  // Get the value at a specific grid position
  getValue(x, y, offset) {
    return this.byteArray[(y * this.gridSize + x) * 4 + offset];
  }

  // Set the value at a specific grid position
  setValue(x, y, offset, value) {
    this.byteArray[(y * this.gridSize + x) * 4 + offset] = value;
  }

  // Get sun level at a specific grid position
  getSunLevel(x, y) {
    return this.getValue(x, y, 0);
  }

  // Set sun level at a specific grid position
  setSunLevel(x, y, value) {
    this.setValue(x, y, 0, value);
  }

  // Get water level at a specific grid position
  getWaterLevel(x, y) {
    return this.getValue(x, y, 1);
  }

  // Set water level at a specific grid position
  setWaterLevel(x, y, value) {
    this.setValue(x, y, 1, value);
  }

  // Get plant type at a specific grid position
  getPlantType(x, y) {
    return this.getValue(x, y, 2);
  }

  // Set plant type at a specific grid position
  setPlantType(x, y, value) {
    this.setValue(x, y, 2, value);
  }

  // Get growth level at a specific grid position
  getGrowthLevel(x, y) {
    return this.getValue(x, y, 3);
  }

  // Set growth level at a specific grid position
  setGrowthLevel(x, y, value) {
    this.setValue(x, y, 3, value);
  }

  // Clear the grid
  clear() {
    this.byteArray.fill(0);
  }
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
    this.gameTime = 0; // Initialize gameTime to track game time
    this.playScenarioCompleted = false; // Track if the play scenario has been completed
    this.gridState = new GridState(5); // Create a new GridState instance for the 5x5 grid
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

    // Grid setup (visual representation)
    this.gridSize = 5; // 5x5 grid
    this.cellSize = 100; // Size of each grid cell
    const gridPixelSize = this.gridSize * this.cellSize;
    this.gridOrigin = {
      x: (this.game.config.width - gridPixelSize) / 2 + this.cellSize / 2,
      y: (this.game.config.height - gridPixelSize) / 2 + this.cellSize / 2,
    }; // Starting position of the grid

    this.createGrid(); // Create the grid

    // Create the player
    this.player = new Player(
      this,
      this.gridOrigin.x,
      this.gridOrigin.y,
      "player"
    );

    // Set up reap and sow actions
    this.input.keyboard.on('keydown-R', () => this.reapPlant()); // Reap a plant when 'R' key is pressed
    this.input.keyboard.on('keydown-S', () => this.sowPlant()); // Sow a plant when 'S' key is pressed
    // Add explanation text for save/load functionality
    const explanationText = `
Press 1-5 to save to a slot.
Press Shift + 1-5 to load from a slot.
    `;

    this.add.text(550, 1, explanationText, { font: '16px Arial', fill: '#ffffff', wordWrap: { width: 400 } });

   // Map keys for saving/loading
   this.input.keyboard.on('keydown', (event) => {
    if (!event.shiftKey) {
        // Save slots (1-5)
        if (event.code === 'Digit1') this.saveGame(1);
        if (event.code === 'Digit2') this.saveGame(2);
        if (event.code === 'Digit3') this.saveGame(3);
        if (event.code === 'Digit4') this.saveGame(4);
        if (event.code === 'Digit5') this.saveGame(5);
    } else {
        // Load slots (Shift + 1-5)
        if (event.code === 'Digit1') this.loadGame(1);
        if (event.code === 'Digit2') this.loadGame(2);
        if (event.code === 'Digit3') this.loadGame(3);
        if (event.code === 'Digit4') this.loadGame(4);
        if (event.code === 'Digit5') this.loadGame(5);
    }
  });
}
    

  createGrid() {
    // Create a 5x5 grid of rectangles for visual representation
    this.grid = [];
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

        // Add cell to the grid array for reference
        this.grid.push({ x, y, rect: cell });
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

    // Check if play scenario is completed
    if (!this.playScenarioCompleted) {
      this.checkPlayScenarioCompletion();
    }
  }

  advanceTime() {
    this.gameTime += 1; // Increment the game's time counter by one unit
    console.log('Time advanced to: ' + this.gameTime);
    //(Delete before turning in, only keeping to see if byte array updates)
    console.log('Current Byte Array:', this.gridState.byteArray); // Print the byte array to check updates
    this.updateCellResources(); // Update sun and water levels for each grid cell
    this.handleTimeBasedEvents(); // Call a method to handle events that occur due to time advancement
  }

  updateCellResources() {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // Generate random sun and water levels
        const sunGain = Phaser.Math.Between(0, 6); // Random sun between 0 and 6
        const waterGain = Phaser.Math.Between(0, 2); // Random water between 0 and 2

        // Update the byte array with new values
        this.gridState.setSunLevel(x, y, sunGain);
        this.gridState.setWaterLevel(x, y, Math.min(this.gridState.getWaterLevel(x, y) + waterGain, 10));

        // Update visual feedback based on resource levels
        const sunColorIntensity = Math.min(255, sunGain * 80);
        const waterColorIntensity = Math.min(255, this.gridState.getWaterLevel(x, y) * 25);
        const color = this.gridState.getWaterLevel(x, y) === 10
          ? Phaser.Display.Color.GetColor(0, 100, 255)  // Fixed color if water is at maximum
          : Phaser.Display.Color.GetColor(sunColorIntensity, 100, waterColorIntensity);

        const cell = this.grid.find(c => c.x === x && c.y === y);
        if (cell) {
          cell.rect.setFillStyle(color);
        }
      }
    }
  }

  handleTimeBasedEvents() {
    console.log('Handling events for gameTime:', this.gameTime);
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const plantType = this.gridState.getPlantType(x, y);
        if (plantType !== 0) {
          // Adjust growth logic for different plant types
          if (plantType === 1 || plantType === 2) {
            this.plantGrowth(1, 1, 1, 2, 2, x, y);
          } else if (plantType === 3) {
            this.plantGrowth(2, 3, 3, 3, 1, x, y); // Different growth conditions for plant type 3
          }
        }
      }
    }
  }

  plantGrowth(waterReq, sunReq, plantReq1, plantReq2, neighborReq, x, y) {
    if (
      this.gridState.getWaterLevel(x, y) > waterReq &&
      this.gridState.getSunLevel(x, y) > sunReq &&
      (this.gridState.getPlantType(x, y) === plantReq1 || this.gridState.getPlantType(x, y) === plantReq2) &&
      this.gridState.getGrowthLevel(x, y) < 5
    ) {
      // Check nearby cells for the same plant type
      let nearbyPlants = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const neighborX = x + i;
          const neighborY = y + j;
          if (
            neighborX >= 0 &&
            neighborX < this.gridSize &&
            neighborY >= 0 &&
            neighborY < this.gridSize &&
            (this.gridState.getPlantType(neighborX, neighborY) === plantReq1 ||
              this.gridState.getPlantType(neighborX, neighborY) === plantReq2)
          ) {
            nearbyPlants++;
          }
        }
      }
      if (nearbyPlants >= neighborReq) {
        this.gridState.setGrowthLevel(x, y, this.gridState.getGrowthLevel(x, y) + 1);

        // Update the plant sprite frame to represent the growth level
        const cell = this.grid.find((c) => c.x === x && c.y === y);
        if (cell && cell.plantSprite) {
          cell.plantSprite.setFrame(
            this.gridState.getPlantType(x, y) !== 3
              ? this.gridState.getGrowthLevel(x, y)
              : 6 + this.gridState.getGrowthLevel(x, y)
          );
        }

        console.log(`Plant at (${x}, ${y}) grew to level ${this.gridState.getGrowthLevel(x, y)}`);
      }
    }
  }

  reapPlant() {
    const playerCell = this.getPlayerCell(); // Get the cell where the player is currently located
    if (playerCell && this.gridState.getPlantType(playerCell.x, playerCell.y) !== 0) {
      console.log(
        `Reaping plant at (${playerCell.x}, ${playerCell.y}) of type ${this.gridState.getPlantType(
          playerCell.x,
          playerCell.y
        )} and level ${this.gridState.getGrowthLevel(playerCell.x, playerCell.y)}`
      );
      this.gridState.setPlantType(playerCell.x, playerCell.y, 0); // Clear plant type
      this.gridState.setGrowthLevel(playerCell.x, playerCell.y, 0); // Reset growth level
      this.gridState.setWaterLevel(playerCell.x, playerCell.y, 0); // Reset water level
      this.gridState.setSunLevel(playerCell.x, playerCell.y, 0); // Reset sun level

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
    if (playerCell && this.gridState.getPlantType(playerCell.x, playerCell.y) === 0) {
      console.log(`Sowing plant at (${playerCell.x}, ${playerCell.y})`); // Log the action of sowing a plant

      this.gridState.setPlantType(playerCell.x, playerCell.y, Phaser.Math.Between(1, 3)); // Randomly assign a plant type (1, 2, or 3)
      this.gridState.setGrowthLevel(playerCell.x, playerCell.y, 1); // Start the plant at growth level 1
      playerCell.rect.setFillStyle(0x8b4513); // Change the cell color to indicate a plant is present

      // Add a visual representation of the plant using a specific frame
      playerCell.plantSprite = this.add
        .sprite(
          playerCell.rect.x,
          playerCell.rect.y,
          'plant',
          this.gridState.getPlantType(playerCell.x, playerCell.y) !== 3 ? 0 : 6
        )
        .setScale(2); // Add a plant sprite and scale it down to fit in the cell

      console.log(
        `Plant type ${this.gridState.getPlantType(playerCell.x, playerCell.y)} sown with growth level ${this.gridState.getGrowthLevel(
          playerCell.x,
          playerCell.y
        )}`
      );
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

  checkPlayScenarioCompletion() {
    // Condition for completing the play scenario (e.g. at least 5 plants at growth level 3 or above)
    const requiredGrowthLevel = 3; // Define the minimum growth level requirement
    const requiredPlantCount = 5; // Define the minimum number of plants required at the growth level
    let count = 0;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (
          this.gridState.getPlantType(x, y) !== 0 &&
          this.gridState.getGrowthLevel(x, y) >= requiredGrowthLevel
        ) {
          count++;
        }
      }
    }

    if (count >= requiredPlantCount) {
      console.log(
        `Play scenario completed! ${count} plants have reached growth level ${requiredGrowthLevel} or above.`
      );
      this.playScenarioCompleted = true; // Mark the play scenario as completed
    }
  }
  saveGame(slot) {
    const plants = [];

    // Gather plant data from the grid
    for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
            const plantType = this.gridState.getPlantType(x, y);
            const growthLevel = this.gridState.getGrowthLevel(x, y);
            if (plantType !== 0) {
                plants.push({
                    x,
                    y,
                    plantType,
                    growthLevel,
                });
            }
        }
    }

    const gameState = {
        gridState: Array.from(this.gridState.byteArray), // Convert byte array to regular array for JSON compatibility
        gameTime: this.gameTime,
        playerPosition: { x: this.player.gridX, y: this.player.gridY },
        plants, // Add plant data
    };

    localStorage.setItem(`saveSlot${slot}`, JSON.stringify(gameState));
    console.log(`Game saved to slot ${slot}`);
}

loadGame(slot) {
  const savedState = localStorage.getItem(`saveSlot${slot}`);
  if (savedState) {
      const gameState = JSON.parse(savedState);

      // Restore grid state
      this.gridState.byteArray.set(gameState.gridState);

      // Restore game variables
      this.gameTime = gameState.gameTime;
      this.player.gridX = gameState.playerPosition.x;
      this.player.gridY = gameState.playerPosition.y;

      // Clear existing sprites
      this.grid.forEach((cell) => {
          if (cell.plantSprite) {
              cell.plantSprite.destroy();
              cell.plantSprite = null;
          }
      });

      // Recreate plant sprites
      gameState.plants.forEach(({ x, y, plantType, growthLevel }) => {
          const cell = this.grid.find((c) => c.x === x && c.y === y);
          if (cell) {
              const frameIndex = plantType !== 3 ? growthLevel : 6 + growthLevel;
              cell.plantSprite = this.add
                  .sprite(cell.rect.x, cell.rect.y, 'plant', frameIndex)
                  .setScale(2);
              // Restore plant data to grid state
              this.gridState.setPlantType(x, y, plantType);
              this.gridState.setGrowthLevel(x, y, growthLevel);
          }
      });

      console.log(`Game loaded from slot ${slot}`);
  } else {
      console.log(`No save found in slot ${slot}`);
  }
}

updateGridVisuals() {
  for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
          const cell = this.grid.find((c) => c.x === x && c.y === y);
          if (cell) {
              // Skip updating cells that already have a restored plant sprite
              if (cell.plantSprite) {
                  continue;
              }

              const sunLevel = this.gridState.getSunLevel(x, y);
              const waterLevel = this.gridState.getWaterLevel(x, y);
              const color = Phaser.Display.Color.GetColor(
                  Math.min(255, sunLevel * 80),
                  100,
                  Math.min(255, waterLevel * 25)
              );
              cell.rect.setFillStyle(color);
        
          }
          
        }
    }
  }
}