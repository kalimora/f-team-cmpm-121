import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("bootScene");
  }

  preload(): void {
    // Set the path for assets
    this.load.setPath("./assets/");

    // Load assets
    this.load.spritesheet("player", "img/Basic-Charakter-Spritesheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.image("timeAdvanceButton", "img/Default.png"); // Load the time control button image
    this.load.spritesheet("plants", "img/plants.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load scenario JSON files
    this.load.setPath("./src/scenarios/");
    this.load.json("tutorialScenario", "tutorial_scenario.json");
    this.load.json("challengeScenario", "challenge_scenario.json");
  }

  create(): void {
    // Transition to the main game scene
    this.scene.start("gameScene");
  }
}
