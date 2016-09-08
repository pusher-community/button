require('dotenv').config({silent: true})

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const exphbs  = require('express-handlebars')
const bodyParser = require('body-parser')

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const Pusher = require('pusher')
const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_APP_KEY,
  secret:  process.env.PUSHER_SECRET_KEY,
  cluster: process.env.PUSHER_CLUSTER
})


app.use(express.static('public'))
app.use(cookieParser(process.env.SECRET || 'cat'))

app.engine('html', exphbs())
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

app.locals.pusherKey = process.env.PUSHER_APP_KEY
app.locals.pusherCluster = process.env.PUSHER_CLUSTER
app.locals.jsbinLink = process.env.JSBIN_LINK

app.get('/', (req, res) => res.render('index'))

// create a button and redirect the user to it
app.post('/', hasKey, (req, res, next) => {
  redis
    .incr('button-id')
    .then(id =>
      redis.set(`button-key-${id}`, req.key)
           .then(_ => res.redirect('/b/' + id))
    )
    .catch(next)

})

// serve the button if the user has access
app.get('/b/:id', hasKey, hasButton, (req, res, next) => {

  if(req.button)
    res.render('button', { buttonID: req.button })
  else
    next()

})

// press the button
app.post('/b/:id/press/:count', hasKey, hasButton, (req, res) => {
  if(req.button)
    pusher.trigger(`button-${req.button}`, 'press', {id: req.params.count, time: Date.now()})

  res.send('done')
})

app.post('/b/:id/release/:count', hasKey, hasButton, (req, res) => {
  if(req.button)
    pusher.trigger(`button-${req.button}`, 'release', {id: req.params.count, time: Date.now()})

  res.send('done')
})


/* html gamepad driver */


app.use(bodyParser.json())

app.get('/gamepad', (req, res) => res.render('gamepad'))

app.post('/gamepad/press/:count', (req, res) => {
  if(req.body.password !== process.env.PASSWORD)
    return res.sendStatus(401)

  pusher.trigger('button', 'press', {id: req.params.count, time: Date.now()})
  res.send('done')
})

app.post('/gamepad/release/:count', (req, res) => {
  if(req.body.password !== process.env.PASSWORD)
    return res.sendStatus(401)

  pusher.trigger('button', 'release', {id: req.params.count, time: Date.now()})
  res.send('done')
})


app.listen(process.env.PORT || 3000)



// middleware helpers

// gets/sets a key for each user
function hasKey(req, res, next) {

  if(req.signedCookies.key) {
    req.key = req.signedCookies.key
  } else {
    req.key = crypto.randomBytes(64).toString('hex')
    res.cookie('key', req.key, {signed: true})
  }
  next()

}

function hasButton(req, res, next) {

  var id = String(req.params.id).substr(0,10)

  redis.get(`button-key-${id}`)
    .then( () => {
        req.button = id
    })
    .then(next)
}
