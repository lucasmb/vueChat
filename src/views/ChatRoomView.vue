<template>
  <div>
    <h2>Room: {{ roomId }}</h2>
    <div class="message">
      <h3>Messages</h3>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const roomId = route.params.roomId
const roomOpen = ref(false)
const messages = ref([])
const userId = ref('11')
const roomName = ref('')

let socket = null
const username = ref('You')
const inputMessage = ref('')

onMounted(() => {
  socket = new WebSocket('ws://localhost:3000?room=' + roomId)
  console.log('SOCKET: ', socket)

  socket.onopen = onSocketOpen

  socket.onmessage = onSocketMessage
})

const onSocketOpen = () => {
  roomOpen.value = true
  socket.send(
    JSON.stringify({
      userId: userId.value,
      userName: username.value,
      roomId: roomId.value,
      roomName: roomName.value,
      event: 'login'
    })
  )
}

const onSocketMessage = (evt) => {
  console.log('recieved :', evt.data)

  //we parse the json that we receive
  var received = JSON.parse(evt.data)
  //check if it's our message or from a friend
  messages.value.push({ from: 'other', message: received.message })

  //this.messages.push({ from: 'other', message: received.message })
  //scroll to the bottom of the messages div
  const messages_div = document.getElementById('messages')
  messages_div.scrollTo({ top: messages_div.scrollHeight, behavior: 'smooth' })
}

const sendMessage = () => {
  const messageData = { from: username.value, message: inputMessage.value }
  // Send the message data to the server using WebSockets
  socket.send(JSON.stringify(messageData))
  // Add the message data to the messages array
  messages.value.push(messageData)
  inputMessage.value = ''
}
</script>
