const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')

const server = jsonServer.create()
const router = jsonServer.router('./db.json')
const userdb = JSON.parse(fs.readFileSync('./database.json', 'UTF-8'))

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789'

const expiresIn = '1h'

// Create a token from a payload 
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token 
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
  return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1
}

//info api
server.get('/info', (req, res, next) => {
  console.log('Info api')
  res.status(200).json({
    "success": true,
    "data": {
      "info": "The only claim funding platform for healthcare providers"
    }
  })
})

//profile api
server.get('/profile', (req, res, next) => {
  console.log('profile api')
  next();
  let verifyTokenResult = verifyToken(req.query.token);
  console.log('verifyTokenResult: ' + verifyTokenResult);
  let email = verifyTokenResult.email;
  console.log('email: ' + email);
  let profile = userdb.profile.find(obj => obj.email === email);
  res.status(200).json({
    "success": true,
    "data": profile
  })
})

//author api
server.get('/author', (req, res, next) => {
  console.log('author api');
  next();

  let authors = userdb.authors;
  const randomIndex = Math.floor(Math.random() * authors.length);
  let author = authors[randomIndex];

  res.status(200).json({
    "success": true,
    "data": author
  })
})

server.get('/quote', (req, res, next) => {
  console.log('author api');
  next();
  let quotes = userdb.quotes.filter(obj => obj.authorId == req.query.authorId);
  const randomIndex = Math.floor(Math.random() * quotes.length);
  let quote = quotes[randomIndex];
  res.status(200).json({
    "success": true,
    "data": quote
  })
})

// Login to one of the users from ./users.json
server.post('/login', (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  const { email, password } = req.body;
  if (isAuthenticated({ email, password }) === false) {
    const status = 401
    const message = 'Incorrect email or password'
    res.status(status).json({
      "success": false,
      "data": {
        "message": message
      }
    })
    return
  }
  const access_token = createToken({ email, password })
  console.log("Access Token:" + access_token);
  res.status(200).json({
    "success": true,
    "data": {
      "token": access_token
    }
  })
})

server.delete('/logout', (req, res, next) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  next()
  res.status(200).json({
    "success": true,
    "data": {}
  })
})

server.use('', (req, res, next) => {
  console.log("checking token")
  if (req.query.token === undefined || req.query.token === null) {
    const status = 401
    const message = 'Error in authorization format'
    res.status(status).json({
      "success": false,
      "data": {
        "message": message
      }
    })
    return
  }
  try {
    console.log("verify token")
    let verifyTokenResult;
    verifyTokenResult = verifyToken(req.query.token);

    if (verifyTokenResult instanceof Error) {
      const status = 401
      const message = 'Access token not provided'
      res.status(status).json({
        "success": false,
        "data": {
          "message": message
        }
      })
      return
    }
    //return verifyTokenResult;
    //next()
  } catch (err) {
    const status = 401
    const message = 'Error access_token is revoked'
    res.status(status).json({ status, message })
  }
})

server.use(router)

server.listen(8000, () => {
  console.log('Run Auth API Server')
})