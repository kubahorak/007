import { Scene } from 'phaser'

export default class PlayScene extends Scene {
    constructor() {
        super({key: 'PlayScene'})
    }

    init({ channel }) {
        this.channel = channel
    }

    preload() {
        this.load.audio('shoot', 'audio/shoot.mp3')
        this.load.audio('reload', 'audio/reload.mp3')
        this.load.audio('defend', 'audio/defend.mp3')
        this.load.audio('die', 'audio/die.mp3')
        this.load.audio('win', 'audio/win.mp3')

        // online resources
        this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png');
        this.load.image('muzzleflash2', 'http://labs.phaser.io/assets/particles/muzzleflash2.png');
        this.load.bitmapFont('azo-fire', 'http://labs.phaser.io/assets/fonts/bitmap/azo-fire.png', 'http://labs.phaser.io/assets/fonts/bitmap/azo-fire.xml');
        this.load.bitmapFont('clarendon', 'http://labs.phaser.io/assets/fonts/bitmap/clarendon.png', 'http://labs.phaser.io/assets/fonts/bitmap/clarendon.xml');

    }

    async create() {
        this.add.image(400, 400, 'sky');

        const particles = this.add.particles('muzzleflash2');

        this.emitter = particles.createEmitter({
            speed: 100,
            scale: {start: 1, end: 0},
            blendMode: 'ADD'
        });

        this.add.dynamicBitmapText(170, 10, 'azo-fire', '007', 50);

        this.statusText = this.add.dynamicBitmapText(50, 100, 'clarendon', 'Press a button!', 18);
        this.overallText = this.add.dynamicBitmapText(50, 150, 'clarendon', 'You have 3 lives, 0 bullets loaded', 18);

        this.shootButton = this.add.dynamicBitmapText(100, 300, 'clarendon', '', 30)
            .setInteractive()
            .on('pointerdown', () => this.trigger(this.shootButton, 'shoot') );
        const defendButton = this.add.dynamicBitmapText(100, 400, 'clarendon', 'Defend', 30)
            .setInteractive()
            .on('pointerdown', () => this.trigger(defendButton, 'defend') );
        const reloadButton = this.add.dynamicBitmapText(100, 500, 'clarendon', 'Reload', 30)
            .setInteractive()
            .on('pointerdown', () => this.trigger(reloadButton, 'reload') );

        this.channel.on('resolution', resolution => {
            console.log('resolution', resolution)
            this.statusText.setText(`You ${resolution.you}, your opponent ${resolution.opponent}s`)
            this.overallText.setText(`You have ${resolution.lives} lives, ${resolution.bullets} bullets loaded`)
            this.sound.play(resolution.you)
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
