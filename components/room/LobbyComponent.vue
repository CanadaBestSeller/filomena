<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>

    <h4 class="mx-3 mt-3 mb-2">{{ $t('general.chatroom') }}</h4>
    <b-card class="mb-3 overflow-auto" style="height: 20rem">
      <p v-for="message in firebase.roomDoc.chatMessages" :key="message.id" :class="getMessageClass(message.senderUid)">
        <b>{{ message.senderName }}: </b>{{ message.text }}
      </p>
    </b-card>

    <h4 class="mx-3 mt-3 mb-2">oooPlayers</h4>
    <b-card class="mb-3 overflow-auto" style="height: 20rem">
      <p v-for="player in firebase.roomDoc.players" :key="player.uid">
        <b>{{ player.name }}</b> ({{ player.uid }})
      </p>
    </b-card>

    <b-input-group>
      <b-form-input v-model="chatUi.newMessageText" @keyup.enter="addChatMessage"/>
      <b-input-group-append>
        <b-button variant="primary" :disabled="!chatUi.newMessageText || chatUi.isLoading" type="text" @click="addChatMessage">{{ $t('general.sendMessage') }}</b-button>
      </b-input-group-append>
    </b-input-group>


    <b-button class="shadow" size="lg" @click="startGame()" variant="success">{{ $t('lobby.startGame') }}</b-button>
  </div>
</template>

<script>
import { addChatroomMessage, startGame } from '~/lib/firebase_gateway'

export default {
  data() {
    return {
      chatUi: { isLoading: false, newMessageText: '' },
    }
  },

  props: [
    'roomId',
    'firebase',
  ],

  methods: {
    async addChatMessage() {
      const message = this.chatUi.newMessageText
      this.chatUi.newMessageText = ""
      this.chatUi.isLoading = true

      await addChatroomMessage(this.firebase.roomDocRef, message, this.firebase.user.displayName, this.firebase.user.uid)
      this.chatUi.isLoading = false
    },

    async startGame() {
      await startGame(this.firebase.roomDocRef, this.$t)
    },

    getMessageClass(sender) { return sender === this.firebase.user.uid ? 'text-primary' : 'text-dark' },
  }
}
</script>

<style>
button[type="text"] { margin: 0; border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
</style>
