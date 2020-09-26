import { Scene } from 'phaser'

export default class GameOverScene extends Scene {
    constructor() {
        super({key: 'GameOverScene'})
    }

    init({ result }) {
        this.result = result
    }

    preload() {
        this.load.setBaseURL('http://labs.phaser.io');

        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
    }

    create() {
        this.add.image(400, 300, 'sky');

        const particles = this.add.particles('red');

        this.emitter = particles.createEmitter({
            speed: 100,
            scale: {start: 1, end: 0},
            blendMode: 'ADD'
        });

        this.add.text(100, 100, `You ${this.result}!`);
    }
}
