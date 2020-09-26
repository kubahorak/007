import { Scene } from 'phaser'
import geckos from '@geckos.io/client'

export default class LoadScene extends Scene {
    constructor() {
        super({ key: 'LoadScene' })

        const channel = geckos({ port: 9000 })

        channel.onConnect(error => {
            if (error) console.error(error.message)

            this.scene.start('PlayScene', { channel: channel })
        })
    }
}
