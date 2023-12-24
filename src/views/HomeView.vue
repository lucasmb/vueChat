<template>
  <div class="container px-6">
    <div>
      <div v-if="!usernameAlreadySelected">
        <label class="form-control w-full max-w-xs">
          <div class="label">
            <span class="label-text">What is your username?</span>
          </div>
          <input
            v-model="username"
            name="username"
            type="text"
            placeholder="Type here"
            className="input input-bordered input-lg w-full max-w-xs"
          />
        </label>
        <button class="mt-4 btn btn-primary w-full" @click="selectUsername">Submit</button>
      </div>
      <ChatBox v-else />
      <!-- <label> Create Room</label>
      <input v-model="room" name="room" />
      <button @click="createRoom">Submit</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import ChatBox from '@/components/ChatBox.vue'
const connectionStore = useConnectionStore()
// const router = useRouter()
// const room = ref('')
const username = ref('')

const usernameAlreadySelected = computed(() => connectionStore.usernameAlreadySelected)

// const createRoom = () => {
//   console.log('room creation: ', room.value)
//   router.push(`/chatroom/${room.value}`)
// }

// const connected = computed(() => {
//   return connectionStore.isConnected
// })

const selectUsername = () => {
  usernameAlreadySelected.value = true
  connectionStore.connect({ username: username.value })
}

onMounted(() => {
  const sessionId = localStorage.getItem('sessionId')
  if (sessionId) {
    connectionStore.connect()
  }
})
</script>
