const express = require('express')
const { Server } = require('ws')

const app = express()
app.use(express.static('public'))

const server = app.listen(3000, () =>
  console.log(`Server listening on port ${server.address().port}`)
)

const wss = new Server({ server })

const maxClients = 2
let rooms = {}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data, req) {
    console.log('Client connected', req)

    const obj = JSON.parse(data)
    const type = obj.type
    const params = obj.params

    switch (type) {
      case 'create':
        create(params)
        break
      case 'join':
        join(params)
        break
      case 'leave':
        leave(params)
        break
      default:
        console.warn(`Type: ${type} unknown`)
        break
    }
  })

  function create(params) {
    const room = genKey(5)
    rooms[room] = [ws]
    ws['room'] = room

    generalInformation(ws)
  }

  function genKey(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  function join(params) {
    const room = params.code
    if (!Object.keys(rooms).includes(room)) {
      console.warn(`Room ${room} does not exist!`)
      return
    }

    if (rooms[room].length >= maxClients) {
      console.warn(`Room ${room} is full!`)
      return
    }

    rooms[room].push(ws)
    ws['room'] = room

    generalInformation(ws)
  }

  function leave(params) {}

  function generalInformation(ws) {
    let obj
    if (ws['room'] === undefined)
      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          'no-clients': rooms[ws['room']].length
        }
      }
    else
      obj = {
        type: 'info',
        params: {
          room: 'no room'
        }
      }

    ws.send(JSON.stringify(obj))
  }
})
