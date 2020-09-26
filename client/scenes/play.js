import { Scene } from 'phaser'

export default class PlayScene extends Scene {
    constructor() {
        super({key: 'PlayScene'})
    }

    init({ channel }) {
        this.channel = channel
    }

    preload() {
        this.load.setBaseURL('http://labs.phaser.io');

        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
    }

    async create() {
        this.add.image(400, 400, 'sky');

        const particles = this.add.particles('red');

        this.emitter = particles.createEmitter({
            speed: 100,
            scale: {start: 1, end: 0},
            blendMode: 'ADD'
        });

        this.statusText = this.add.text(50, 100, 'Press a button!');
        this.overallText = this.add.text(50, 150, 'You have 3 lives, 0 bullets loaded');

        this.shootButton = this.add.text(100, 300, '', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.trigger(this.shootButton, 'shoot') );
        const defendButton = this.add.text(100, 400, 'Defend', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.trigger(defendButton, 'defend') );
        const reloadButton = this.add.text(100, 500, 'Reload', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.trigger(reloadButton, 'reload') );

        this.channel.on('resolution', resolution => {
            console.log('resolution', resolution)
            this.statusText.setText(`You ${resolution.you}, your opponent ${resolution.opponent}s`)
            this.overallText.setText(`You have ${resolution.lives} lives, ${resolution.bullets} bullets loaded`)
            if (resolution.bullets < 1) {
                this.shootButton.setText('')
            } else {
                this.shootButton.setText('Shoot')
            }
        })

        this.channel.on('game_over', data => {
            console.log('game_over', data)
            this.scene.start('GameOverScene', data)
        })
    }

    trigger(button, actionName) {
        this.statusText.setText(`You selected ${actionName}`);
        this.emitter.startFollow(button);
        this.channel.emit('action', actionName)
    }
}
