const express = require('express')
const http = require('http')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const PhaserGame = require('./game')
const app = express()
const server = http.createServer(app)

const PORT = 9000

const game = new PhaserGame(server)

app.use(cors())
app.use(compression())

app.use('/', express.static(path.join(__dirname, '../dist')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
})

server.listen(PORT, () => {
    console.log('Server is listening on http://localhost:' + PORT)
})
