require('@geckos.io/phaser-on-nodejs')

const Phaser = require('phaser')
const PlayScene = require('./scenes/play')

const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-game',
    width: 800,
    height: 600,
    banner: false,
    audio: false,
    scene: [PlayScene],
    physics: {
        default: 'arcade',
    }
}
module.exports = config
