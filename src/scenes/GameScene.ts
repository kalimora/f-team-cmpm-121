import challengeScenario from "../scenarios/challenge_scenario.json" assert { type: "json" };
import tutorialScenario from "../scenarios/tutorial_scenario.json" assert { type: "json" };
import Player from "../objects/Player.ts";
import Phaser from "phaser";
import LZString from "lz-string";

class PlantType {  
  name: string;
  growthConditions: (
    x: number,
    y: number,
    gridState: GridState,
    gameTime: number
  ) => boolean;
  specialAbility: ((x: number, y: number, gridState: GridState) => void) | null;
  frameIndices: number[];

  constructor(
    name: string,
    growthConditions: (
      x: number,
      y: number,
      gridState: GridState,
      gameTime: number
    ) => boolean,
    specialAbility:
      | ((x: number, y: number, gridState: GridState) => void)
      | null,
    frameIndices: number[]
  ) {
    this.name = name;
    this.growthConditions = growthConditions;
    this.specialAbility = specialAbility;
    this.frameIndices = frameIndices;
  }

  canGrow(
    x: number,
    y: number,
    gridState: GridState,
    gameTime: number
  ): boolean {
    return this.growthConditions(x, y, gridState, gameTime);
  }

  applySpecialAbility(x: number, y: number, gridState: GridState): void {
    if (this.specialAbility) {
      this.specialAbility(x, y, gridState);
    }
  }

  grow(x: number, y: number, gridState: GridState, gameTime: number): number {
    const currentGrowthLevel = gridState.getGrowthLevel(x, y);
    if (currentGrowthLevel < 5 && this.canGrow(x, y, gridState, gameTime)) {
      const newGrowthLevel = currentGrowthLevel + 1;
      gridState.setGrowthLevel(x, y, newGrowthLevel);
      this.applySpecialAbility(x, y, gridState);
      return newGrowthLevel;
    }
    return currentGrowthLevel;
  }
}

const plantTypes: PlantType[] = [
  new PlantType(
    "Sun Lover",
    (x: number, y: number, gridState: GridState, gameTime: number): boolean =>
      gridState.getSunLevel(x, y) > 3 &&
      gridState.getWaterLevel(x, y) < 3 &&
      gameTime % 2 === 0,
    (x: number, y: number, gridState: GridState): void => {
      // Special ability: Increase sun level in adjacent cells
      const neighbors: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentSun = gridState.getSunLevel(nx, ny);
          gridState.setSunLevel(nx, ny, Math.min(10, currentSun + 1));
        }
      });
    },
    [14, 16, 17, 18, 19] // carrot
  ),
  new PlantType(
    "Water Lover",
    (x: number, y: number, gridState: GridState, gameTime: number): boolean =>
      gridState.getWaterLevel(x, y) > 3 &&
      gridState.getSunLevel(x, y) < 3 &&
      gameTime % 3 === 0,
    (x: number, y: number, gridState: GridState): void => {
      // Special ability: Increase water level in adjacent cells
      const neighbors: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentWater = gridState.getWaterLevel(nx, ny);
          gridState.setWaterLevel(nx, ny, Math.min(10, currentWater + 1));
        }
      });
    },
    [21, 23, 24, 25, 26] // cabbage
  ),
  new PlantType(
    "Balanced",
    (x: number, y: number, gridState: GridState): boolean =>
      Math.abs(gridState.getSunLevel(x, y) - gridState.getWaterLevel(x, y)) <=
      1,
    (x: number, y: number, gridState: GridState): void => {
      // Special ability: Balance sun and water levels in current cell
      const sunLevel = gridState.getSunLevel(x, y);
      const waterLevel = gridState.getWaterLevel(x, y);
      const average = Math.round((sunLevel + waterLevel) / 2);
      gridState.setSunLevel(x, y, average);
      gridState.setWaterLevel(x, y, average);
    },
    [28, 30, 31, 32, 33] // plum
  ),
  new PlantType(
    "Neighbor Dependent",
    (x: number, y: number, gridState: GridState): boolean => {
      const neighbors: [number, number][] = (
        [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ] as [number, number][]
      ).filter(
        ([nx, ny]) =>
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
      );

      return neighbors.some(([nx, ny]) => gridState.getPlantType(nx, ny) !== 0);
    },
    (x: number, y: number, gridState: GridState): void => {
      // Special ability: Boost growth of neighboring plants
      const neighbors: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentGrowth = gridState.getGrowthLevel(nx, ny);
          if (currentGrowth > 0 && currentGrowth < 5) {
            gridState.setGrowthLevel(nx, ny, currentGrowth + 1);
          }
        }
      });
    },
    [35, 37, 38, 39, 40] // eggplant
  ),
];

class GridState {
  gridSize: number;
  byteArray: Uint8Array;
  plantTypes: {
    name: string;
    growthConditions: (x: number, y: number, gridState: GridState) => boolean;
  }[];

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.byteArray = new Uint8Array(gridSize * gridSize * 4); // Initialize the byte array with 4 bytes per cell
    this.plantTypes = [];
  }

  private getValue(x: number, y: number, offset: number): number {
    return this.byteArray[(y * this.gridSize + x) * 4 + offset];
  }

  private setValue(x: number, y: number, offset: number, value: number): void {
    this.byteArray[(y * this.gridSize + x) * 4 + offset] = value;
  }

  getSunLevel(x: number, y: number): number {
    return this.getValue(x, y, 0);
  }

  setSunLevel(x: number, y: number, value: number): void {
    this.setValue(x, y, 0, value);
  }

  getWaterLevel(x: number, y: number): number {
    return this.getValue(x, y, 1);
  }

  setWaterLevel(x: number, y: number, value: number): void {
    this.setValue(x, y, 1, value);
  }

  definePlantType(
    name: string,
    growthConditions: (x: number, y: number, gridState: GridState) => boolean
  ): number {
    this.plantTypes.push({ name, growthConditions });
    return this.plantTypes.length - 1; // Return the index of the new plant type
  }

  getPlantType(x: number, y: number): number {
    return this.getValue(x, y, 2);
  }

  setPlantType(x: number, y: number, value: number): void {
    this.setValue(x, y, 2, value);
  }

  canPlantGrow(x: number, y: number): boolean {
    const plantTypeIndex = this.getPlantType(x, y);
    const plantType = this.plantTypes[plantTypeIndex];
    if (!plantType) return false;
    return plantType.growthConditions(x, y, this);
  }

  getGrowthLevel(x: number, y: number): number {
    return this.getValue(x, y, 3);
  }

  setGrowthLevel(x: number, y: number, value: number): void {
    this.setValue(x, y, 3, value);
  }

  clear(): void {
    this.byteArray.fill(0);
  }

  getCellColor(x: number, y: number): number {
    const sunLevel = this.getSunLevel(x, y);
    const waterLevel = this.getWaterLevel(x, y);
    const sunColorIntensity = Math.min(255, sunLevel * 80);
    const waterColorIntensity = Math.min(255, waterLevel * 25);
    return Phaser.Display.Color.GetColor(
      sunColorIntensity,
      100,
      waterColorIntensity
    );
  }
}

interface GameState {
  gridState: number[];
  gameTime: number;
  gridSize: number;
  playerPosition: { x: number; y: number };
  plants: Array<{
    x: number;
    y: number;
    plantType: number;
    growthLevel: number;
    waterLevel: number;
    sunLevel: number;
  }>;
  scenarioName: string;
}

class _ScenarioManager {
  private gameScene: GameScene;
  private scenarios: Record<string, Scenario>;
  private activeScenario: Scenario | null = null;
  private gameTime: number = 0;

  constructor(gameScene: GameScene, scenarios: Record<string, Scenario>) {
    this.gameScene = gameScene;
    this.scenarios = scenarios;
  }

  loadScenario(scenarioName: string): void {
    const scenario = this.scenarios[scenarioName];
    if (!scenario) {
      console.error(`Scenario "${scenarioName}" not found.`);
      return;
    }
    this.activeScenario = scenario;
    this.applyStartingConditions(scenario.startConditions);

    if (
      !scenario.victoryConditions ||
      !Array.isArray(scenario.victoryConditions) ||
      scenario.victoryConditions.length === 0
    ) {
      console.warn(
        `Victory conditions for "${scenarioName}" are not properly defined.`
      );
      this.activeScenario.victoryConditions = [];
    }

    console.log(`Loaded scenario: ${scenario.scenarioName}`);
  }

  applyStartingConditions(startConditions: Scenario["startConditions"]): void {
    const { gridSize, playerPosition, plants } = startConditions;

    this.gameScene.gridState = new GridState(gridSize);
    this.gameScene.gridSize = gridSize;

    if (!this.gameScene.gridOrigin) {
      this.gameScene.gridOrigin = { x: 50, y: 50 };
    }
    if (!this.gameScene.cellSize) {
      this.gameScene.cellSize = 100;
    }

    this.gameScene.createGrid();

    const [playerX, playerY] = playerPosition;
    if (!this.gameScene.player) {
      this.gameScene.player = new Player(
        this.gameScene,
        this.gameScene.gridOrigin.x + playerX * this.gameScene.cellSize,
        this.gameScene.gridOrigin.y + playerY * this.gameScene.cellSize,
        "player"
      );
    }

    this.gameScene.player.gridX = playerX;
    this.gameScene.player.gridY = playerY;
    this.gameScene.player.updatePosition(
      this.gameScene.gridOrigin,
      this.gameScene.cellSize
    );

    plants.forEach(({ position, type, growth }) => {
      const [x, y] = position;
      this.gameScene.gridState.setPlantType(x, y, type);
      this.gameScene.gridState.setGrowthLevel(x, y, growth);
    });

    console.log("Starting conditions applied.");
  }

  handleScheduledEvents(): void {
    if (!this.activeScenario) return;

    const events = this.activeScenario.events.filter(
      (event) => event.time === this.gameTime
    );
    events.forEach((event) => {
      switch (event.action) {
        case "addPlant": {
          const { position, type } = event.details;
          const [x, y] = position;
          this.gameScene.gridState.setPlantType(x, y, type);
          this.gameScene.gridState.setGrowthLevel(x, y, 1);
          console.log(`Plant of type ${type} added at (${x}, ${y}).`);
          break;
        }
        case "increaseSun": {
          const { amount } = event.details;
          for (let y = 0; y < this.gameScene.gridSize; y++) {
            for (let x = 0; x < this.gameScene.gridSize; x++) {
              const currentSun = this.gameScene.gridState.getSunLevel(x, y);
              this.gameScene.gridState.setSunLevel(x, y, currentSun + amount);
            }
          }
          console.log(`Increased sun level by ${amount}.`);
          break;
        }
        case "increaseWater": {
          const { amount } = event.details;
          for (let y = 0; y < this.gameScene.gridSize; y++) {
            for (let x = 0; x < this.gameScene.gridSize; x++) {
              const currentWater = this.gameScene.gridState.getWaterLevel(x, y);
              this.gameScene.gridState.setWaterLevel(
                x,
                y,
                currentWater + amount
              );
            }
          }
          console.log(`Increased water level by ${amount}.`);
          break;
        }
        default: {
          console.warn(`Unknown event action: ${event.action}`);
        }
      }
    });
  }

  checkVictoryConditions(): void {
    if (!this.activeScenario || !this.activeScenario.victoryConditions) return;

    const { victoryConditions } = this.activeScenario;
    let conditionsMet = true;

    victoryConditions.forEach((condition) => {
      switch (condition.type) {
        case "plantGrowth": {
          const { position, growthLevel } = condition.details;
          const [x, y] = position;
          if (this.gameScene.gridState.getGrowthLevel(x, y) < growthLevel) {
            conditionsMet = false;
          }
          break;
        }
        case "totalPlants": {
          const { minCount } = condition.details;
          let plantCount = 0;
          for (let y = 0; y < this.gameScene.gridSize; y++) {
            for (let x = 0; x < this.gameScene.gridSize; x++) {
              if (this.gameScene.gridState.getPlantType(x, y) !== 0) {
                plantCount++;
              }
            }
          }
          if (plantCount < minCount) {
            conditionsMet = false;
          }
          break;
        }
        default: {
          console.warn(`Unknown victory condition: ${condition.type}`);
        }
      }
    });

    if (conditionsMet) {
      console.log(
        `Victory conditions met! Scenario "${this.activeScenario.scenarioName}" completed.`
      );
      this.loadNextScenario();
    }
  }

  advanceTime(): void {
    this.gameTime++;
    console.log(`Game time advanced to: ${this.gameTime}`);
    this.handleScheduledEvents();
    this.checkVictoryConditions();
  }

  loadNextScenario(): void {
    const nextScenario = this.activeScenario?.nextScenario;
    if (nextScenario) {
      this.loadScenario(nextScenario);
    } else {
      console.log("No more scenarios to load.");
    }
  }
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
    this.grid = [] as Array<{
      x: number;
      y: number;
      rect: Phaser.GameObjects.Rectangle;
      plantSprite: Phaser.GameObjects.Sprite | null;
    }>; // Initialize as an empty array
    this.gridSize = 5; // Default grid size
    this.gridOrigin = { x: 200, y: 100 }; // Default origin
    this.cellSize = 100; // Default cell size
    this.undoStack = [] as Array<GameState>; // Undo stack
    this.redoStack = [] as Array<GameState>; // Redo stack
    this.UNDO_LIMIT = 20; // Maximum undo stack size
    this.playScenarioCompleted = false; // Track if the scenario is completed
    this.gridState = new GridState(this.gridSize); // Initialize GridState
    this.scenarioManager = new ScenarioManager(this, {
      challenge: challengeScenario,
      tutorial: tutorialScenario,
    }); // Initialize ScenarioManager
  }

  create(): void {
    const buttonX: number = 50;
    const buttonY: number = this.game.config.height / 6;

    this.add.text(buttonX - 35, buttonY - 65, "Advance Time", {
      font: "16px Arial",
      fill: "#ffffff",
    });

    const _timeButton = this.add
      .image(buttonX, buttonY, "timeAdvanceButton")
      .setInteractive()
      .on("pointerdown", () => {
        this.advanceTime();
      });

    // Add Instructions button
    const instructionsButtonX: number = this.game.config.width - 150;
    const instructionsButtonY: number = 50;
    const _instructionsButton = this.add
      .text(instructionsButtonX, instructionsButtonY, "Instructions", {
        font: "18px Arial",
        fill: "#ffffff",
        backgroundColor: "#0000ff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .on("pointerdown", () => {
        this.showInstructionsPopup();
      });

    this.load.on("complete", () => {
      console.log("Loading tutorial scenario...");
      this.scenarioManager.loadScenario("tutorial");
      this.createGrid();
      this.setupKeyboardControls();
      this.checkForAutoSave();
      this.time.addEvent({
        delay: 1000,
        callback: () => this.scenarioManager.advanceTime(),
        loop: true,
      });
    });

    this.load.start();
  }
  // Add these methods here
  showInstructionsPopup(): void {
    // Create a semi-transparent background for the pop-up
    const popupBackground = this.add.rectangle(
      this.game.config.width / 2,
      this.game.config.height / 2,
      this.game.config.width * 0.8,
      this.game.config.height * 0.8,
      0x000000,
      0.8
    );
    popupBackground.setDepth(10);

    // Add instructions text
    const instructionsText: string = `
        Instructions:
    
        - Arrow Keys: Move Character
        - S: Sow a plant at the current position
        - R: Reap a plant at the current position
        - 1-5: Save game to a slot
        - Shift + 1-5: Load game from a slot
        - Ctrl + Z: Undo last action
        - Ctrl + Y: Redo last action
        - Advance Time Button: Manually advance 
        game time
    
        Plant Types:
        - Sun Lover: Thrives in high sun, low water 
        conditions
        - Water Lover: Prefers high water, low sun 
        conditions
        - Balanced: Grows best with equal sun and 
        water levels
        - Neighbor Dependent: Grows when adjacent
        to other plants
        Click [Close] to close the instructions.
    `;

    const instructionsContent = this.add.text(
      this.game.config.width / 2 - 300,
      this.game.config.height / 2 - 250,
      instructionsText,
      { font: "18px Arial", fill: "#ffffff", wordWrap: { width: 400 } }
    );
    instructionsContent.setDepth(11);

    // Add a "Close" button
    const closeButton = this.add
      .text(
        this.game.config.width / 1.3 - 40,
        this.game.config.height / 2 + 150,
        "[Close]",
        { font: "20px Arial", fill: "#ff0000" }
      )
      .setInteractive()
      .on("pointerdown", () => {
        popupBackground.destroy();
        instructionsContent.destroy();
        closeButton.destroy();
      });
    closeButton.setDepth(11);
  }

  hideInstructionsPopup(): void {
    // Destroy all pop-up components if they exist
    if (this.popupBackground) {
      this.popupBackground.destroy();
      this.popupBackground = undefined;
    }
    if (this.instructionsContent) {
      this.instructionsContent.destroy();
      this.instructionsContent = undefined;
    }
    if (this.closeButton) {
      this.closeButton.destroy();
      this.closeButton = undefined;
    }
  }

  createGrid(): void {
    console.log("Creating grid with size:", this.gridSize);

    if (!this.gridSize || this.gridSize <= 0) {
      console.error("Error: gridSize is not defined or invalid.");
      return;
    }

    if (!this.grid) {
      console.error("Error: grid is not initialized.");
      this.grid = []; // Initialize to avoid further issues
    }

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cellX: number = this.gridOrigin.x + x * this.cellSize;
        const cellY: number = this.gridOrigin.y + y * this.cellSize;
        const rect: Phaser.GameObjects.Rectangle = this.add.rectangle(
          cellX,
          cellY,
          this.cellSize - 5,
          this.cellSize - 5,
          0x057a26
        );

        rect.setStrokeStyle(1, 0x000000);

        this.grid.push({
          x,
          y,
          rect,
          plantSprite: null,
        });

        rect.setDepth(-1);
      }
    }

    console.log("Grid created:", this.grid);
  }

  recreateGrid(): void {
    // Clear existing grid elements
    this.grid.forEach((cell) => {
      if (cell.rect) {
        cell.rect.destroy();
      }
      if (cell.plantSprite) {
        cell.plantSprite.destroy();
      }
    });

    this.grid = []; // Reset the grid array

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cellX: number = this.gridOrigin.x + x * this.cellSize;
        const cellY: number = this.gridOrigin.y + y * this.cellSize;
        const rect: Phaser.GameObjects.Rectangle = this.add.rectangle(
          cellX,
          cellY,
          this.cellSize - 5,
          this.cellSize - 5,
          0x057a26
        );
        rect.setStrokeStyle(1, 0x000000);

        this.grid.push({
          x,
          y,
          rect,
          plantSprite: null,
        });

        rect.setDepth(-1);
      }
    }
  }

  setupKeyboardControls(): void {
    this.input.keyboard.on("keydown-R", () => {
      this.reapPlant();
      this.pushCurrentStateToUndoStack();
    });

    this.input.keyboard.on("keydown-S", () => {
      this.sowPlant();
      this.pushCurrentStateToUndoStack();
    });

    this.input.keyboard.on("keydown", (event: KeyboardEvent) => {
      let moved = false;

      if (event.code === "ArrowLeft" && this.player.gridX > 0) {
        this.player.move(-1, 0);
        moved = true;
      } else if (
        event.code === "ArrowRight" &&
        this.player.gridX < this.gridSize - 1
      ) {
        this.player.move(1, 0);
        moved = true;
      } else if (event.code === "ArrowUp" && this.player.gridY > 0) {
        this.player.move(0, -1);
        moved = true;
      } else if (
        event.code === "ArrowDown" &&
        this.player.gridY < this.gridSize - 1
      ) {
        this.player.move(0, 1);
        moved = true;
      }

      if (moved) {
        this.pushCurrentStateToUndoStack();
      }

      if (!event.shiftKey) {
        // Save slots (1-5)
        switch (event.code) {
          case "Digit1":
            this.saveGame(1);
            break;
          case "Digit2":
            this.saveGame(2);
            break;
          case "Digit3":
            this.saveGame(3);
            break;
          case "Digit4":
            this.saveGame(4);
            break;
          case "Digit5":
            this.saveGame(5);
            break;
        }
      } else {
        // Load slots (Shift + 1-5)
        switch (event.code) {
          case "Digit1":
            this.loadGame(1);
            break;
          case "Digit2":
            this.loadGame(2);
            break;
          case "Digit3":
            this.loadGame(3);
            break;
          case "Digit4":
            this.loadGame(4);
            break;
          case "Digit5":
            this.loadGame(5);
            break;
        }
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.code) {
          case "KeyZ":
            this.undo();
            break;
          case "KeyY":
            this.redo();
            break;
        }
      }
    });
  }

  pushCurrentStateToUndoStack(): void {
    const currentState: Record<string, any> = this.getCurrentState();
    this.undoStack.push(JSON.parse(JSON.stringify(currentState))); // Deep copy of current state
    this.redoStack = []; // Clear redo stack when a new action is performed

    if (this.undoStack.length > this.UNDO_LIMIT) {
      this.undoStack.shift(); // Remove the oldest state
    }

    console.log("Undo stack:", this.undoStack);
  }

  undo(): void {
    if (this.undoStack.length === 0) {
      console.log("Nothing to undo");
      return;
    }

    console.log("Undoing last action");

    const currentState: Record<string, any> = this.getCurrentState();
    this.redoStack.push(currentState);

    const lastState = this.undoStack.pop();
    if (lastState) {
      this.restoreState(lastState);
      this.updateGridVisuals();
    }
  }

  redo(): void {
    if (this.redoStack.length === 0) {
      console.log("Nothing to redo");
      return;
    }

    console.log("Redoing last action");

    const currentState: Record<string, any> = this.getCurrentState();
    this.undoStack.push(currentState);

    const nextState = this.redoStack.pop();
    if (nextState) {
      this.restoreState(nextState);
      this.updateGridVisuals();
    }
  }

  restorePlayerPosition(playerPosition: { x: number; y: number }): void {
    this.player.gridX = playerPosition.x;
    this.player.gridY = playerPosition.y;
    this.player.x = this.gridOrigin.x + this.player.gridX * this.cellSize;
    this.player.y = this.gridOrigin.y + this.player.gridY * this.cellSize;
  }

  clearPlantSprites(): void {
    this.grid.forEach(
      (cell: { plantSprite: Phaser.GameObjects.Sprite | null }) => {
        if (cell.plantSprite) {
          cell.plantSprite.destroy();
          cell.plantSprite = null;
        }
      }
    );
  }

  restorePlantSprites(
    plants: Array<{
      x: number;
      y: number;
      plantType: number;
      growthLevel: number;
      waterLevel: number;
      sunLevel: number;
    }>
  ): void {
    plants.forEach(({ x, y, plantType, growthLevel, waterLevel, sunLevel }) => {
      const cell = this.grid.find(
        (c: { x: number; y: number }) => c.x === x && c.y === y
      );
      if (cell) {
        const frameIndex: number =
          plantType !== 3 ? growthLevel - 1 : 6 + (growthLevel - 1);
        cell.plantSprite = this.add
          .sprite(cell.rect.x, cell.rect.y, "plant", frameIndex)
          .setScale(2);

        this.gridState.setPlantType(x, y, plantType);
        this.gridState.setGrowthLevel(x, y, growthLevel);
        this.gridState.setWaterLevel(x, y, waterLevel);
        this.gridState.setSunLevel(x, y, sunLevel);
      }
    });
  }

  restoreState(state: {
    gridSize: number;
    gridState: Uint8Array;
    gameTime: number;
    playerPosition: { x: number; y: number };
    plants: Array<{
      x: number;
      y: number;
      plantType: number;
      growthLevel: number;
      waterLevel: number;
      sunLevel: number;
    }>;
  }): void {
    console.log("Restoring state:", state);

    this.gridSize = state.gridSize;
    this.gridState = new GridState(this.gridSize);
    this.gridState.byteArray.set(state.gridState);
    this.gameTime = state.gameTime;

    this.recreateGrid();
    this.restorePlayerPosition(state.playerPosition);
    this.clearPlantSprites();
    this.restorePlantSprites(state.plants);
    this.updateGridVisuals();
  }

  checkForAutoSave(): void {
    const autoSaveState: string | null = localStorage.getItem("autoSave");

    if (autoSaveState) {
      const continueGame: boolean = globalThis.confirm(
        "Do you want to continue where you left off?"
      );

      if (continueGame) {
        this.loadGame("autoSave");
      }
    }
  }

  autoSaveGame(): void {
    try {
      const gameState: Record<string, any> = this.getCurrentState();
      const compressedState: string = LZString.compress(
        JSON.stringify(gameState)
      ); // Use global LZString
      localStorage.setItem("autoSave", compressedState);
      console.log("Game auto-saved (compressed)");
    } catch (e: any) {
      console.error("Auto-save failed:", e.message);
    }
  }

  collectPlantData(): Array<{
    x: number;
    y: number;
    plantType: number;
    growthLevel: number;
    waterLevel: number;
    sunLevel: number;
  }> {
    const plants: Array<{
      x: number;
      y: number;
      plantType: number;
      growthLevel: number;
      waterLevel: number;
      sunLevel: number;
    }> = [];

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const plantType = this.gridState.getPlantType(x, y);
        const growthLevel = this.gridState.getGrowthLevel(x, y);
        const waterLevel = this.gridState.getWaterLevel(x, y);
        const sunLevel = this.gridState.getSunLevel(x, y);

        if (plantType !== 0) {
          plants.push({ x, y, plantType, growthLevel, waterLevel, sunLevel });
        }
      }
    }

    return plants;
  }

  saveGame(slot: number): void {
    try {
      const gameState: Record<string, any> = this.getCurrentState();
      const compressedState: string = LZString.compress(
        JSON.stringify(gameState)
      );
      localStorage.setItem(`saveSlot${slot}`, compressedState);
      console.log(`Game saved to slot ${slot} (compressed)`);
    } catch (e: any) {
      console.error(`Save to slot ${slot} failed:`, e.message);
    }
  }

  collectCellColorData(): Array<{
    x: number;
    y: number;
    sunLevel: number;
    waterLevel: number;
  }> {
    const cellColors: Array<{
      x: number;
      y: number;
      sunLevel: number;
      waterLevel: number;
    }> = [];

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        cellColors.push({
          x,
          y,
          sunLevel: this.gridState.getSunLevel(x, y),
          waterLevel: this.gridState.getWaterLevel(x, y),
        });
      }
    }

    return cellColors;
  }

  loadGame(slot: number | "autoSave"): void {
    try {
      const savedState: string | null = localStorage.getItem(
        slot === "autoSave" ? "autoSave" : `saveSlot${slot}`
      );

      if (savedState) {
        const decompressedState = JSON.parse(
          LZString.decompress(savedState) || "{}"
        );
        this.restoreState(decompressedState);
        console.log(
          `Game loaded from ${
            slot === "autoSave" ? "auto-save" : `slot ${slot}`
          }`
        );
      } else {
        console.log(
          `No save found in ${
            slot === "autoSave" ? "auto-save" : `slot ${slot}`
          }`
        );
      }
    } catch (e: any) {
      console.error("Load game failed:", e.message);
    }
  }

  sowPlant(): void {
    const cell = this.grid.find(
      (c) => c.x === this.player.gridX && c.y === this.player.gridY
    );

    if (cell && this.gridState.getPlantType(cell.x, cell.y) === 0) {
      const plantTypeIndex: number = Phaser.Math.Between(
        0,
        plantTypes.length - 1
      );
      const plantType = plantTypes[plantTypeIndex];
      this.gridState.setPlantType(cell.x, cell.y, plantTypeIndex);
      this.gridState.setGrowthLevel(cell.x, cell.y, 1);
      this.gridState.setWaterLevel(cell.x, cell.y, 5);
      this.gridState.setSunLevel(cell.x, cell.y, 5);

      const frameName: number = plantType.frameIndices[0];
      console.log("FRAME NAME Sow", frameName);

      cell.plantSprite = this.add
        .sprite(cell.rect.x, cell.rect.y, "plants", frameName)
        .setScale(2);
      cell.plantSprite.setDepth(0.5);

      console.log(
        `Planted ${plantTypes[plantTypeIndex].name} at (${cell.x}, ${cell.y})`
      );

      this.updatePlantVisuals();
      this.pushCurrentStateToUndoStack();
    } else {
      console.log("A plant already exists here.");
    }
  }

  reapPlant(): void {
    const cell = this.grid.find(
      (c) => c.x === this.player.gridX && c.y === this.player.gridY
    );

    if (cell && this.gridState.getPlantType(cell.x, cell.y) !== 0) {
      this.gridState.setPlantType(cell.x, cell.y, 0);
      this.gridState.setGrowthLevel(cell.x, cell.y, 0);

      if (cell.plantSprite) {
        cell.plantSprite.destroy();
        cell.plantSprite = null;
      }

      console.log(`Reaped plant at (${cell.x}, ${cell.y})`);
      this.updatePlantVisuals();
      this.pushCurrentStateToUndoStack();
    } else {
      console.log("No plant to reap here.");
    }
  }

  updateGridVisuals(): void {
    this.grid.forEach((cell) => {
      const sunLevel: number = this.gridState.getSunLevel(cell.x, cell.y);
      const waterLevel: number = this.gridState.getWaterLevel(cell.x, cell.y);

      // Update plant sprites
      this.updatePlantVisuals();

      // Update cell colors based on sun and water levels
      const sunColor: number = Phaser.Display.Color.GetColor(
        255,
        255 * (sunLevel / 4),
        0
      );
      const waterColor: number = Phaser.Display.Color.GetColor(
        0,
        0,
        255 * (waterLevel / 4)
      );
      const blendedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(sunColor),
        Phaser.Display.Color.ValueToColor(waterColor),
        255,
        128
      );
      cell.rect.setFillStyle(
        Phaser.Display.Color.GetColor(
          blendedColor.r,
          blendedColor.g,
          blendedColor.b
        )
      );
    });
  }

  updatePlantVisuals() {
    this.grid.forEach((cell) => {
      const plantTypeIndex = this.gridState.getPlantType(cell.x, cell.y);
      const growthLevel = this.gridState.getGrowthLevel(cell.x, cell.y);
      if (plantTypeIndex !== 0) {
        const plantType = plantTypes[plantTypeIndex];
        if (!cell.plantSprite) {
          cell.plantSprite = this.add
            .sprite(cell.rect.x, cell.rect.y, "plants")
            .setScale(2);
          cell.plantSprite.setDepth(0.5);
        }
        let frameName;
        if (growthLevel === 1) {
          frameName = plantType.frameIndices[0]; // Initial frame
        } else {
          frameName = plantType.frameIndices[growthLevel - 1]; // Skip the second frame and use subsequent frames in order
        }
        console.log("FRAME NAME Update", frameName);
        cell.plantSprite.setFrame(frameName);
      } else if (cell.plantSprite) {
        cell.plantSprite.destroy();
        cell.plantSprite = null;
      }
    });
  }

  handleTimeBasedEvents(): void {
    console.log("Handling events for gameTime:", this.gameTime);

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // Randomly update sun and water levels for all cells
        const randomSunLevel: number = Phaser.Math.Between(0, 4);
        const randomWaterLevel: number = Phaser.Math.Between(0, 4);

        this.gridState.setSunLevel(x, y, randomSunLevel);
        this.gridState.setWaterLevel(x, y, randomWaterLevel);

        const plantType: number = this.gridState.getPlantType(x, y);
        if (plantType !== 0) {
          this.plantGrowth(x, y, plantType);
        }
      }
    }

    this.updateGridVisuals();
  }

  plantGrowth(x: number, y: number, plantTypeIndex: number): void {
    const plantType = plantTypes[plantTypeIndex];
    const newGrowthLevel: number = plantType.grow(
      x,
      y,
      this.gridState,
      this.gameTime
    );

    if (newGrowthLevel > this.gridState.getGrowthLevel(x, y)) {
      console.log(
        `${plantType.name} at (${x}, ${y}) grew to level ${newGrowthLevel}`
      );
      this.updatePlantVisuals();
    }
  }

  addPlantType(
    name: string,
    growthConditions: (
      x: number,
      y: number,
      gridState: GridState,
      gameTime: number
    ) => boolean
  ): number {
    const newPlantType = new PlantType(name, growthConditions);
    plantTypes.push(newPlantType);
    return plantTypes.length - 1; // Return the index of the new plant type
  }

  removePlantType(index: number): boolean {
    if (index >= 0 && index < plantTypes.length) {
      plantTypes.splice(index, 1);
      return true;
    }
    return false;
  }

  getCurrentState(): {
    gridState: number[];
    gameTime: number;
    gridSize: number;
    playerPosition: { x: number; y: number };
    plants: Array<{
      x: number;
      y: number;
      plantType: number;
      growthLevel: number;
      waterLevel: number;
      sunLevel: number;
    }>;
    scenarioName: string | undefined;
  } {
    return {
      gridState: Array.from(this.gridState.byteArray),
      gameTime: this.gameTime,
      gridSize: this.gridSize,
      playerPosition: { x: this.player.gridX, y: this.player.gridY },
      plants: this.collectPlantData(),
      scenarioName: this.scenarioManager.activeScenario?.scenarioName,
    };
  }

  advanceTime(): void {
    this.gameTime = (this.gameTime || 0) + 1;
    console.log(`Time advanced to ${this.gameTime}`);
    this.scenarioManager.advanceTime();
    this.handleTimeBasedEvents();
    this.updateGridVisuals();
    this.autoSaveGame();
    this.pushCurrentStateToUndoStack();
  }
}
