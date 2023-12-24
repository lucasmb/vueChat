<template>
  <div>
    <div v-if="!user"><h3>Please select any user to start chatting.</h3></div>
    <div v-else>
      <div class="header" v-if="user">
        <div>TO: <StatusIcon :connected="user?.connected" /> {{ user.username }}</div>
      </div>

      <div class="messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message chat"
          :class="message.fromSelf ? 'chat-start' : 'chat-end'"
        >
          <div v-if="displaySender(message, index)" class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img
                alt="Tailwind CSS chat bubble component"
                src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              />
            </div>
          </div>
          <div v-if="displaySender(message, index)" class="chat-header sender">
            {{ message.fromSelf ? 'Yourself' : user.username }}
            <time class="text-xs opacity-50">12:12</time>
          </div>
          <div class="chat-bubble chat-bubble-primary">
            {{ message.content }}
          </div>
        </div>
      </div>
      <form @submit.prevent="onSubmit" class="form">
        <input
          type="text"
          v-model="msgInput"
          placeholder="Type here"
          class="input input-bordered input-lg w-full max-w-xs"
        />
        <button class="btn btn-primary btn-lg">Send</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatusIcon from '@/components/StatusIcon.vue'

import { useChatStore } from '@/stores/chat'
import { useConnectionStore } from '@/stores/connection'
const msgInput = ref('')
const isValid = ref('')

const chatStore = useChatStore()

chatStore.bindEvents()

const user = computed(() => {
  return chatStore.selectedUser
})

const messages = computed(() => {
  return user.value?.messages || []
})

const onSubmit = () => {
  chatStore.sendMessage(msgInput.value)
  msgInput.value = ''
}

const displaySender = (message, index) => {
  return (
    index === 0 || user.value.messages[index - 1].fromSelf !== user.value.messages[index].fromSelf
  )
}

const onMessage = () => {
  // chatStore.privateMessage({
  //   msgInput.value,
  //   to: selectedUser.value.userId
  // })
  // selectedUser.value.messages.push({
  //   msgInput.value,
  //   fromSelf: true
  // })
}
</script>
