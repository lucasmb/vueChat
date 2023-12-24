<template>
  <aside
    class="sidebar w-64 shrink-0 md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-indigo-500"
  >
    <div class="sidebar-content px-4 py-6">
      <ul class="flex flex-col w-full">
        <li class="my-px">
          <a
            href="#"
            class="flex flex-row items-center h-10 px-3 rounded-lg text-gray-700 bg-gray-100"
          >
            <span class="flex items-center justify-center text-lg text-gray-400">
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="h-6 w-6"
              >
                <path
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </span>
            <span class="ml-3">Users</span>
          </a>
        </li>
        <li v-for="user in users" :key="user.userId" class="my-px">
          <UserDisplay
            :key="user.userId"
            :user="user"
            :selected="selectedUser === user"
            @select="onSelectUser(user)"
            class="rounded-lg hover:bg-gray-100 hover:text-gray-700"
          />
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import UserDisplay from '@/components/UserDisplay.vue'

import { useConnectionStore } from '@/stores/connection'
import { useChatStore } from '@/stores/chat'

const connectionStore = useConnectionStore()
const chatStore = useChatStore()

const users = computed(() => {
  return connectionStore.users
})

const selectedUser = computed(() => {
  console.log(chatStore?.selectedUser)
  return chatStore?.selectedUser || {}
})
</script>
