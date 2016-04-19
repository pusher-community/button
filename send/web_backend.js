require('dotenv').config({path:'../.env'})

const express = require('express')
const app = express()

const Pusher = require('pusher')
const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_APP_KEY,
  secret:  process.env.PUSHER_SECRET_KEY,
  cluster: process.env.PUSHER_CLUSTER
})


const buttonName = 'button'
var count = 0

app
  .get('/', (req, res) => res.sendFile(`${__dirname}/node.frontend.html`))
  .post('/press', (req, res) => {
    res.send('ok')

    pusher.trigger(buttonName, 'press', {'id': ++count, 'time': Date.now()})
  })
  .post('/release', (req, res) => {
    res.send('ok')

    pusher.trigger(buttonName, 'release', {'id': count, 'time': Date.now()})
  })

  .listen(8080)


console.log("👉  http://localhost:8080")
