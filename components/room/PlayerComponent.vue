<template>
  <div class="min-vw-100">
    <b-container fluid="md" class="players-container">
      <b-row class="justify-content-center" no-gutters cols="2" cols-sm="3" cols-md="3" cols-lg="4" cols-xl="5">
        <b-col v-for="player in f.roomDoc.players" :key="player.uid">

          <div class="d-flex my-2 flex-column justify-content-center align-content-center">
            <h1 v-cloak v-if="player.uid !== f.user.uid" class="text-center lobby-avatar-emoji">{{ player.emoji }}</h1>
            <h1 v-cloak v-else-if="isEmojiThrottling" class="text-center lobby-avatar-emoji">✨️</h1>
            <h1 v-cloak v-else class="text-center lobby-avatar-emoji" @click="changePlayerEmoji"><b-link>{{ player.emoji }}</b-link></h1>

            <h5 v-cloak v-if="player.uid === f.user.uid" class="text-primary text-center lobby-avatar-name">{{ $t('lobby.you', [player.name]) }}</h5>
            <h5 v-cloak v-else class="text-center lobby-avatar-name">{{ player.name }}</h5>
          </div>

        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { changePlayerEmoji } from '@/lib/firebase_gateway'

export default {
  data() {
    return {
      isEmojiThrottling: false
    }
  },

  methods: {
    async changePlayerEmoji() {
      this.isEmojiThrottling = true
      await new Promise(r => setTimeout(r, 2000))  // Sleep 3 seconds
      await changePlayerEmoji(this.f.roomDocRef, this.f.user.uid)
      this.isEmojiThrottling = false
    }
  },

  props: [
    'f',
  ],
}
</script>

<style>
.players-container {
  overflow-y: auto;
  max-height: 60vh;
}

.lobby-avatar-emoji {
  margin-bottom: -.25rem;
}

.lobby-avatar-name {
  overflow-wrap: break-word;
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
