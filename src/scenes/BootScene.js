export default class BootScene extends Phaser.Scene {
  constructor() {
    super("bootScene");
  }
  preload() {
    this.load.setPath("./assets/");
    this.load.spritesheet("player", "img/Basic-Charakter-Spritesheet.png", { frameWidth: 48, frameHeight: 48 });
  }

  create() {
    this.scene.start("gameScene"); // once assets are loaded go to main scene
  }
}
