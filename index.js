const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
let height, width, mySnake, head, move, newDirection, myId, enemySnakes, initialStrat, data

// Handle POST request to '/start'
app.post('/start', (req, res) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
      color: '#5F5932',
      headType: 'sand-worm',
      tailType: 'sharp'
    // color: '#823BFF',
  }

  return res.json(data)
})

/**
 * Get random value from number given
 * @param max
 * @returns {number}
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Handle POST request to '/move'
app.post('/move', (req, res) => {
  // NOTE: Do something here to generate your move

    /**
     * Game plan
     * get my snake head and body coords
     * move head in a direction that isn't death (edge, myself)
     * Chase tail?
     * break code into modules
     * support running multiple games at once
     * add other snake locations
     * add food locations
     * avoid heading down dead end
     *
     * next steps:
     * chase tail for first 40 moves or only 3 snakes left
     * find food
     *
    **/

    //  board info
    height = req.body.board.height
    width = req.body.board.width
      // console.log(req.body)
    myId = req.body.you.id
    // console.log(myId)
    mySnake = req.body.you
    enemySnakes = req.body.board.snakes.filter(snake=>{return snake.id !== myId})
    head = mySnake.body[0]


    /**
     * Chase tail for first 40 turns
     * check where head and tail and and move accordingly
     * rework logic
     */
    if([0,4,8,12,16,20,24,28,32,36].includes(req.body.turn)) {
        data = {move: 'left'}
    } else if([1,5,9,13,17,21,25,29,37].includes(req.body.turn)) {
        data = {move: 'down'}
    } else if([2,6,10,14,18,22,26,30,38].includes(req.body.turn)) {
        data = {move: 'right'}
    } else if([3,7,11,15,19,23,27,31,39].includes(req.body.turn)) {
        data = {move: 'up'}
    } else {

        /**
         *
         * Find next available direction, filter out edge of board and own snake
         */
        newDirection = [
            {x: head.x, y: head.y - 1, direction: "up"},
            {x: head.x, y: head.y + 1, direction: "down"},
            {x: head.x - 1, y: head.y, direction: "left"},
            {x: head.x + 1, y: head.y, direction: "right"}
        ].filter(direction => {
            if (direction.x < 0 ||
                direction.y < 0 ||
                direction.x === width ||
                direction.y === height ||
                JSON.stringify(mySnake.body).includes(JSON.stringify({x: direction.x, y: direction.y})) ||
                enemySnakes.forEach(enemy => {

                        // console.log({x:direction.x, y:direction.y})
                        // console.log(enemy.body)
                        // console.log(JSON.stringify(enemy.body).includes(JSON.stringify({x: direction.x, y: direction.y})))
                        JSON.stringify(enemy.body).includes(JSON.stringify({x: direction.x, y: direction.y}))
                    }
                )) {
                // console.log("here")
                // console.log(newDirection)
                return false
            } else return true
        })

        move = getRandomInt(newDirection.length)

        // console.log(newDirection[move].direction)
        // Response data
        data = {
            move: newDirection[move].direction, // one of: ['up','down','left','right']
        }
    }

  return res.json(data)
})

app.post('/end', (req, res) => {
  // NOTE: Any cleanup when a game is complete.
  return res.json({})
})

app.post('/ping', (req, res) => {
  // Used for checking if this snake is still alive.
  return res.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
