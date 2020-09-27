const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')

const { Scene } = require('phaser')

const INITIAL_LIVES = 3
const INITIAL_BULLETS = 0

class PlayScene extends Scene {
    constructor() {
        super({ key: 'PlayScene' })
        this.firstAnswer = null
        this.players = {}
    }

    init() {
        this.io = geckos({
            iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
        })
        this.io.addServer(this.game.server)
    }

    send(channelID, you, opponent) {
        const player = this.players[channelID]
        player.channel.emit("resolution", {
            you,
            opponent,
            lives: player.lives,
            bullets: player.bullets
        })
    }

    addLivesAndBullets(channelID, plusLives, plusBullets) {
        const player = this.players[channelID]
        player.lives += plusLives
        player.bullets += plusBullets
    }

    resolve(a, b) {
        if (a.action === "shoot" && b.action === "shoot") {
            this.addLivesAndBullets(a.channelID, -1, -1)
            this.addLivesAndBullets(b.channelID, -1, -1)
            this.send(a.channelID, "die", "die")
            this.send(b.channelID, "die", "die")
        } else if (a.action === "shoot" && b.action === "defend") {
            this.addLivesAndBullets(a.channelID, 0, -1)
            this.addLivesAndBullets(b.channelID, 0, 0)
            this.send(a.channelID, "shoot", "defend")
            this.send(b.channelID, "defend", "shoot")
        } else if (a.action === "defend" && b.action === "shoot") {
            this.addLivesAndBullets(a.channelID, 0, 0)
            this.addLivesAndBullets(b.channelID, 0, -1)
            this.send(a.channelID, "defend", "shoot")
            this.send(b.channelID, "shoot", "defend")
        } else if (a.action === "defend" && b.action === "defend") {
            this.addLivesAndBullets(a.channelID, 0, 0)
            this.addLivesAndBullets(b.channelID, 0, 0)
            this.send(a.channelID, "defend", "defend")
            this.send(b.channelID, "defend", "defend")
        } else if (a.action === "reload" && b.action === "reload") {
            this.addLivesAndBullets(a.channelID, 0, 1)
            this.addLivesAndBullets(b.channelID, 0, 1)
            this.send(a.channelID, "reload", "reload")
            this.send(b.channelID, "reload", "reload")
        } else if (a.action === "defend" && b.action === "reload") {
            this.addLivesAndBullets(a.channelID, 0, 0)
            this.addLivesAndBullets(b.channelID, 0, 1)
            this.send(a.channelID, "defend", "reload")
            this.send(b.channelID, "reload", "defend")
        } else if (a.action === "reload" && b.action === "defend") {
            this.addLivesAndBullets(a.channelID, 0, 1)
            this.addLivesAndBullets(b.channelID, 0, 0)
            this.send(a.channelID, "reload", "defend")
            this.send(b.channelID, "defend", "reload")
        } else if (a.action === "reload" && b.action === "shoot") {
            this.addLivesAndBullets(a.channelID, -1, 0)
            this.addLivesAndBullets(b.channelID, 0, -1)
            this.send(a.channelID, "die", "win")
            this.send(b.channelID, "win", "die")
        } else if (a.action === "shoot" && b.action === "reload") {
            this.addLivesAndBullets(a.channelID, 0, -1)
            this.addLivesAndBullets(b.channelID, -1, 0)
            this.send(a.channelID, "win", "die")
            this.send(b.channelID, "die", "win")
        }

        this.handleGameOver()
    }

    handleGameOver() {
        let isGameOver = false
        for (let channelID in this.players) {
            const player = this.players[channelID]

            if (player.lives < 1) {
                isGameOver = true
                break
            }
        }

        if (isGameOver) {
            for (let channelID in this.players) {
                const player = this.players[channelID]

                if (player.lives < 1) {
                    player.channel.emit("game_over", {result: "lose"})
                } else {
                    player.channel.emit("game_over", {result: "win"})
                }
            }
        }
    }

    actionReceived(channelID, action) {
        console.log("action received: ", channelID, action)
        const answer = {
            action: action,
            channelID: channelID,
        }
        if (this.firstAnswer != null && this.firstAnswer.channelID !== channelID) {
            this.resolve(this.firstAnswer, answer)
            // new game
            this.firstAnswer = null
        } else {
            this.firstAnswer = answer
        }
    }

    create() {
        this.io.onConnection((channel) => {
            console.log("new connection", channel.id)
            this.players[channel.id] = {
                channel,
                lives: INITIAL_LIVES,
                bullets: INITIAL_BULLETS,
            }

            channel.on('action', (action) => this.actionReceived(channel.id, action))

            channel.onDisconnect(() => {
                console.log('Disconnect user ' + channel.id)
            })
        })

        console.log("Game server started")
    }
}

module.exports = PlayScene
