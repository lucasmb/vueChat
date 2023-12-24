import { defineStore } from 'pinia'
import { socket } from '@/utils/socket'
import { useConnectionStore } from '@/stores/connection'

/**
 *
 */
export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    selectedUser: null
  }),

  actions: {
    /**
     *
     */
    bindEvents() {
      // sync the list of items upon connection
      socket.on('connect', () => {
        socket.emit('messages:list', (res) => {
          this.messages = res.data
        })
      })

      socket.on('chat message', (msg) => {
        console.log('message recieved', msg)
        this.messages.push(msg)
      })

      socket.on('private message', ({ content, from, to }) => {
        const connection = useConnectionStore()
        const users = connection.getUsers

        for (let i = 0; i < users.length; i++) {
          const user = users[i]
          const fromSelf = socket.userId === from
          if (user.userId === (fromSelf ? to : from)) {
            user.messages.push({
              content,
              fromSelf
            })
            if (user !== this.selectedUser) {
              user.hasNewMessages = true
            }
            break
          }
        }
      })

      // update the store when an item was created
      socket.on('item:created', (message) => {
        this.messages.push(message)
      })
    },

    /**
     *
     * @param {*} msg
     */
    sendMessage(msg = '') {
      if (this.selectedUser.userId) {
        socket.emit('private message', {
          content: msg,
          to: this.selectedUser.userId
        })
        this.selectedUser.messages.push({
          content: msg,
          fromSelf: true
        })
      }
    }
  }
})
