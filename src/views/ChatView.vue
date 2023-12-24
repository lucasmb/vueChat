<template>
  <div class="container">
    <h1>Awesome chat - <span class="connection_ready">Connection ready!</span></h1>

    <div class="messages" id="messages">
      <div class="message-container">
        <h1 class="error" v-if="connectionError">Connection error!</h1>
        <div v-for="(m, idx) in messages" :key="'m-' + idx" style="clear: both">
          <div :class="{ 'msg-from-me': m.from == 'You', 'msg-from-other': m.from == 'other' }">
            {{ m.message }}
          </div>
        </div>
      </div>
    </div>

    <div class="send-zone">
      <input
        v-model="inputMessage"
        type="text"
        placeholder="Type a message"
        @keyup.enter="sendMessage"
      />
    </div>
  </div>

  <!-- <h1>Real-Time Chat</h1>
    <div>
      <div v-for="message in messages" :key="message.id">
        {{ message }}
      </div>
    </div>
    <input v-model="inputMessage" placeholder="Type your message" />
  </div> -->
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

chatStore.bindEvents()

const roomOpen = ref(false)
const inputMessage = ref('')

const connectionError = ref(false)
const username = ref('You')

onMounted(() => {})

const messages = computed(() => chatStore.messages)

const sendMessage = () => {
  const messageData = { from: username.value, message: inputMessage.value }

  chatStore.semdMessage(messageData)
  // Add the message data to the messages array
  //chatStore.value.push(messageData)
  inputMessage.value = ''
}

const onSocketMessage = (evt) => {
  // console.log('recieved :', evt.data)

  // //we parse the json that we receive
  // var received = JSON.parse(evt.data)
  // //check if it's our message or from a friend
  // messages.value.push({ from: 'other', message: received.message })

  // //this.messages.push({ from: 'other', message: received.message })
  // //scroll to the bottom of the messages div
  // const messages_div = document.getElementById('messages')
  // messages_div.scrollTo({ top: messages_div.scrollHeight, behavior: 'smooth' })

  this.ws.onmessage = (message) => {
    const data = JSON.parse(message.data)

    this.onlineNum = data.num
    if (data.event === 'login') {
      // There are other users entering the room message
      this.msgList.push({
        content: `Welcome ${data.userName} to room ${data.roomName}~`
      })
    } else if (data.event === 'logout') {
      // There are other users leaving the room message
      console.log('logout', data)
      this.msgList.push({
        content: `${data.userName} Leave the room`
      })
    } else {
      // normal message
      const self = this.userId === data.userId
      if (self) return
      this.msgList.push({
        name: data.userName,
        self: false,
        content: data.content
      })
    }
  }
}

// const handleConnect = () => {
//   if (username.value.length > 0) {
//     connect.value = true
//   }
// }

const sendMessage2 = () => {
  const messageData = { from: username.value, message: inputMessage.value }
  // Send the message data to the server using WebSockets
  socket.send(JSON.stringify(messageData))
  // Add the message data to the messages array
  messages.value.push(messageData)
  inputMessage.value = ''
}

// const handleMessageSubmit = (event) => {
//   // socket.value.onmessage = (event) => {
//   //   const message = JSON.parse(event.data)
//   //   messages.value.push(message)
// }
</script>

<style lang="scss">
body {
  background: #111b21;
}
.container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 768px;
  min-height: 98vh;
  position: relative;

  h1 {
    padding: 0px;
    height: 20px;
    color: white;
    font-size: 20px;
    text-transform: uppercase;

    .connection_ready {
      color: greenyellow;
    }
  }

  .messages {
    height: 80vh;
    overflow-y: scroll;
    background: url(@/assets/images/background.webp) no-repeat center;
    background-size: cover;

    .msg-from-me {
      border-radius: 7.5px;
      max-width: 65%;
      font-size: 16px;
      line-height: 19px;
      color: #e9edef;
      background-color: #046a62;
      padding: 5px;
      margin: 20px 20px 5px 0px;

      float: right;
    }
    .msg-from-other {
      border-radius: 7.5px;
      max-width: 65%;
      font-size: 16px;
      line-height: 19px;
      color: #e9edef;
      background: #202c33;
      padding: 5px;
      margin: 20px 0px 5px 20px;
      float: left;
    }
  }
  .send-zone {
    height: 62px;
    background: #202c33;
    display: flex;

    input[type='text'] {
      padding: 9px 12px 11px;
      margin: 5px 10px;
      border: 1px solid #2a3942;
      background: #2a3942;
      border-radius: 8px;
      font-size: 15px;
      flex-grow: 1;
      color: white;
    }
  }
}
</style>
