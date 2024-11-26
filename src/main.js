
//import scenes
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js'; 

const config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    width: 800, 
    height: 600,
    backgroundColor: '#836539',
    scene: [BootScene, GameScene],
    pixelArt: true,  // prevent pixel art from getting blurred when scaled
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    }
};

config.scene = [BootScene, GameScene];

const _game = new Phaser.Game(config);