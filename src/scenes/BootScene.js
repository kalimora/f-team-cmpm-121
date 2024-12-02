export default class BootScene extends Phaser.Scene {
  constructor() {
    super("bootScene");
  }
  preload() {
    this.load.setPath("./assets/");
    this.load.spritesheet("player", "img/Basic-Charakter-Spritesheet.png", { frameWidth: 48, frameHeight: 48 });
    this.load.image('timeAdvanceButton', 'img/Default.png'); // Load the time control button image
    this.load.spritesheet("plant", "img/Basic_Plants.png", { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.scene.start("gameScene"); // once assets are loaded go to main scene
  }
}