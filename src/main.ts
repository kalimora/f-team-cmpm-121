import Phaser from "phaser";
// Import scenes
import BootScene from "./scenes/BootScene.ts";
import GameScene from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  parent: "phaser-game",
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  backgroundColor: "#836539",
  scene: [BootScene, GameScene],
  pixelArt: true, // Prevent pixel art from getting blurred when scaled
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: {
        x: 0,
        y: 0,
      },
    },
  },
};

// Ensure scene assignment maintains type integrity
config.scene = [BootScene, GameScene];

const _game = new Phaser.Game(config);
