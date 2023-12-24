<template>
  <div class="user" @click="onSelectUser" :class="{ selected: selected }">
    <div class="description">
      <div class="name">{{ user.username }} {{ user.self ? ' (yourself)' : '' }}</div>
      <div class="status"><status-icon :connected="user.connected" />{{ status }}</div>
    </div>
    <div v-if="user.hasNewMessages" class="new-messages">!</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'

import StatusIcon from '@/components/StatusIcon.vue'

const props = defineProps({
  user: Object,
  selected: Boolean
})

const emit = defineEmits(['select'])
const chatStore = useChatStore()

const user = props.user
const status = computed(() => {
  return user.connected ? 'online' : 'offline'
})

const onSelectUser = () => {
  chatStore.selectedUser = user
  user.hasNewMessages = false
}
</script>

<style scoped>
.selected {
  background-color: #9e11a3;
}

.user {
  padding: 10px;
}

.description {
  display: inline-block;
}

.status {
  color: #92959e;
}

.new-messages {
  color: white;
  background-color: red;
  width: 20px;
  border-radius: 5px;
  text-align: center;
  float: right;
  margin-top: 10px;
}
</style>
