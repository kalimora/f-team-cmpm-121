class ScenarioManager {
  constructor(gameScene, scenarios) {
    this.gameScene = gameScene;
    this.scenarios = scenarios;
    this.activeScenario = null;
    this.gameTime = 0;
  }

  loadScenario(scenarioName) {
    const scenario = this.scenarios[scenarioName];
    if (!scenario) {
      console.error(`Scenario "${scenarioName}" not found.`);
      return;
    }
    this.activeScenario = scenario;
    this.applyStartingConditions(scenario.startConditions);

    if (!scenario.victoryConditions || !Array.isArray(scenario.victoryConditions) || scenario.victoryConditions.length === 0) {
      console.warn(`Victory conditions for "${scenarioName}" are not properly defined.`);
      this.activeScenario.victoryConditions = [];
    }
    console.log(`Loaded scenario: ${scenario.scenarioName}`);
  }

  applyStartingConditions(startConditions) {
    const { gridSize, playerPosition, plants } = startConditions;
    this.gameScene.gridState = new GridState(gridSize);
    this.gameScene.gridSize = gridSize;

    if (!this.gameScene.gridOrigin) {
      this.gameScene.gridOrigin = { x: 50, y: 50 };
    }
    if (!this.gameScene.cellSize) {
      this.gameScene.cellSize = 100;
    }

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
    this.gameScene.player.updatePosition(this.gameScene.gridOrigin, this.gameScene.cellSize);

    plants.forEach(({ position, type, growth }) => {
      const [x, y] = position;
      this.gameScene.gridState.setPlantType(x, y, type);
      this.gameScene.gridState.setGrowthLevel(x, y, growth);
    });

    console.log("Starting conditions applied.");
  }

  handleScheduledEvents() {
    if (!this.activeScenario) return;
    const events = this.activeScenario.events.filter((event) => event.time === this.gameTime);
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
              this.gameScene.gridState.setWaterLevel(x, y, currentWater + amount);
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

  checkVictoryConditions() {
    if (!this.activeScenario || !this.activeScenario.victoryConditions) {
      return;
    }
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
      console.log("Victory conditions met! Scenario completed.");
      this.gameScene.playScenarioCompleted = true;
    }
  }

  advanceTime() {
    this.gameTime += 1;
    console.log(`Game time advanced to: ${this.gameTime}`);
    this.handleScheduledEvents();
    this.checkVictoryConditions();
  }
}