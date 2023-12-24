import { defineStore } from 'pinia'
import { socket } from '@/utils/socket'

export const useConnectionStore = defineStore('connection', {
  state: () => ({
    isConnected: false,
    usernameAlreadySelected: false,
    users: []
  }),

  getters: {
    getUsers(state) {
      return state.users
    }
  },

  actions: {
    initUser(user) {
      user.messages = user.messages || []
      user.hasNewMessages = !!user?.messages?.length
    },

    bindEvents() {
      socket.on('connect', () => {
        this.isConnected = true
        this.usernameAlreadySelected = true
        console.log('Socket Connected:', this.isConnected)
      })

      socket.on('disconnect', () => {
        this.isConnected = false
      })

      socket.on('connect_error', (err) => {
        if (err.message === 'invalid username') {
          this.usernameAlreadySelected = false
        }
      })

      socket.on('session', ({ sessionId, userId }) => {
        // attach the session ID to the next reconnection attempts
        socket.auth = { sessionId }
        // store it in the localStorage
        localStorage.setItem('sessionId', sessionId)
        // save the ID of the user
        socket.userId = userId
      })

      socket.on('users', (users) => {
        users.forEach((user) => {
          console.log('settingUSERS: ', user)

          user.messages.forEach((message) => {
            message.fromSelf = message.from === socket.userId
          })
          for (let i = 0; i < this.users.length; i++) {
            const existingUser = this.users[i]
            if (existingUser.userId === user.userId) {
              existingUser.connected = user.connected
              existingUser.messages = user.messages
              return
            }
          }
          user.self = user.userId === socket.userId

          this.initUser(user)
          this.users.push(user)
        })
        // put the current user first, and then sort by username
        this.users.sort((a, b) => {
          this.users = users.sort((a, b) => {
            if (a.self) return -1
            if (b.self) return 1
            if (a.username < b.username) return -1
            return a.username > b.username ? 1 : 0
          })
        })
      })

      socket.on('user connected', (user) => {
        this.initUser(user)
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i]
          if (existingUser.userId === user.userId) {
            existingUser.connected = true
            return
          }
        }

        console.log('new user connected')
        this.users.push(user)
      })
    },

    /**
     *
     * @param {*} params
     */
    connect({ username } = {}) {
      let auth = {}

      const sessionId = localStorage.getItem('sessionId')
      if (sessionId) {
        this.usernameAlreadySelected = true
        auth = { sessionId: sessionId, username: username }
        socket.auth = auth
        socket.connect()
      } else {
        auth = { username: username }
        socket.auth = auth
        console.log(socket.auth)
        socket.connect()
      }
    },

    destroyed() {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('users')
      socket.off('user connected')
      socket.off('user disconnected')
      socket.off('private message')
    }
  }
})
