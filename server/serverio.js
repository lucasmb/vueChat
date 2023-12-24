'use strict'

import { Server } from 'socket.io'
import { createServer } from 'node:http'
import express from 'express'
import crypto from 'crypto'
import { InMemorySessionStore } from './sessionStore.js'
import { InMemoryMessageStore } from './messageStore.js'

const sessionStore = new InMemorySessionStore()
const messageStore = new InMemoryMessageStore()

const app = express()
const httpServer = createServer(app)
const randomId = () => crypto.randomBytes(8).toString('hex')

let users = []
let thread_id = ''

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})

/** Auth middleware */
io.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId
  if (sessionId) {
    // find existing session
    const session = sessionStore.findSession(sessionId)

    if (session) {
      socket.sessionId = sessionId
      socket.userId = session.userId
      socket.username = session.username
      return next()
    }
  }
  const username = socket.handshake.auth.username
  if (!username) {
    return next(new Error('invalid username'))
  }
  // create new session
  socket.sessionId = randomId()
  socket.userId = randomId()
  socket.username = username
  next()
})

io.on('connection', (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionId, {
    userId: socket.userId,
    username: socket.username,
    connected: true
  })

  // emit session details
  socket.emit('session', {
    sessionId: socket.sessionId,
    userId: socket.userId
  })

  // join the "userId" room
  socket.join(socket.userId)
  console.log('user connected: ', socket.userId)

  // fetch existing users
  const users = []
  const messagesPerUser = new Map()
  messageStore.findMessagesForUser(socket.userId).forEach((message) => {
    const { from, to } = message
    const otherUser = socket.userId === from ? to : from
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })

  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userId: session.userId,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userId) || []
    })
  })
  socket.emit('users', users)
  // notify existing users
  socket.broadcast.emit('user connected', {
    userId: socket.userId,
    username: socket.username,
    connected: true
  })

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg)
    io.emit('chat message', msg)
  })

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on('private message', ({ content, to }) => {
    console.log('private recieved: ', content)

    const message = {
      content,
      from: socket.userId,
      to
    }
    socket.to(to).to(socket.userId).emit('private message', message)
    messageStore.saveMessage(message)
  })

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userId).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('user disconnected', socket.userId)
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        username: socket.username,
        connected: false
      })
    }
  })
})

io.on('error', (err) => {
  console.error('Error opening server')
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`server running at http://localhost:${port}`)
})

process.on('SIGINT', async () => {
  console.log('\nTest Server process terminated. SIGINT')

  // cleanup
  if (thread_id) {
    try {
      const ret = await openai.deleteThread({ threadId: thread_id })
      console.log(ret)
    } catch (error) {
      console.log(error.name, error.message)
    }
  }

  process.exit()
})

process.on('SIGTERM', async () => {
  console.log('\nTest Server process terminated. SIGTERM')

  // cleanup
  if (thread_id) {
    try {
      //const ret = await openai.deleteThread({ threadId: thread_id })
      //console.log(ret)
    } catch (error) {
      console.log(error.name, error.message)
    }
  }

  process.exit()
})
