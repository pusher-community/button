require('dotenv').config({silent: true})

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const crypto = require('crypto')

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)


app.use(express.static('public'))
app.use(cookieParser(process.env.SECRET || 'cat'))

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
    res.send('YES, match')
  else
    next()

})

// press the button
app.post('/b/:id', hasKey, hasButton, (req, res) => {
  res.send('todo: implement')
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
    .then( resp => {
      if(resp === req.key)
        req.button = id
    })
    .then(next)
}
