export default class ScenarioManager {
    constructor(scene) {
      this.scene = scene;
      this.currentScenario = null;
    }
  
    loadScenario(scenarioName) {
      const scenarioData = this.scene.cache.json.get(scenarioName);
      this.currentScenario = scenarioData;
      this.setupScenario();
    }
  
    setupScenario() {
      const { startConditions, events } = this.currentScenario;
      
      // Set up grid size
      this.scene.gridSize = startConditions.gridSize;
      
      // Set up player position
      this.scene.player.setGridPosition(...startConditions.playerPosition);
      
      // Set up initial plants
      startConditions.plants.forEach(plant => {
        const [x, y] = plant.position;
        this.scene.gridState.setPlantType(x, y, plant.type);
        this.scene.gridState.setGrowthLevel(x, y, plant.growth);
      });
      
      // Set up weather conditions
      this.scene.sunRange = startConditions.weather.sunRange;
      this.scene.waterRange = startConditions.weather.waterRange;
      
      // Set up victory condition if present
      if (startConditions.victoryCondition) {
        this.scene.victoryCondition = startConditions.victoryCondition;
      }
      
      // Set up events
      this.setupEvents(events);
    }
  
    setupEvents(events) {
      events.forEach(event => {
        this.scene.time.delayedCall(event.time * 1000, () => {
          this.handleEvent(event);
        });
      });
    }
  
    handleEvent(event) {
        switch (event.action) {
          case 'addPlant': {
            const { position, type } = event.details;
            this.scene.gridState.setPlantType(...position, type);
            this.scene.gridState.setGrowthLevel(...position, 1);
            break;
          }
          case 'increaseSun': {
            this.scene.sunRange[1] += event.details.amount;
            break;
          }
          case 'increaseWater': {
            this.scene.waterRange[1] += event.details.amount;
            break;
          }
          // Add more event handlers as needed
          default: {
            console.log(`Unhandled event action: ${event.action}`);
            break;
          }
        }
      }
  
    checkVictoryCondition() {
      if (!this.currentScenario.startConditions.victoryCondition) return false;
      
      const { level, count } = this.currentScenario.startConditions.victoryCondition.plantsAtLevel;
      let plantsAtLevel = 0;
      
      for (let y = 0; y < this.scene.gridSize; y++) {
        for (let x = 0; x < this.scene.gridSize; x++) {
          if (this.scene.gridState.getGrowthLevel(x, y) >= level) {
            plantsAtLevel++;
          }
        }
      }
      
      return plantsAtLevel >= count;
    }
  }