import "babel-polyfill"
import Phaser, { Game } from 'phaser'
import LoadScene from './scenes/load'
import PlayScene from './scenes/play'
import GameOverScene from './scenes/game_over'

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 700,
    physics: {
        default: 'arcade',
    },
    scene: [LoadScene, PlayScene, GameOverScene]
}

window.addEventListener('load', () => {
    new Game(config)
})
