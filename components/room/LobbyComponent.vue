<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>

<!--    <h4 class="mx-3 mt-3 mb-2">{{ $t('general.chatroom') }}</h4>-->
<!--    <b-card class="mb-3 overflow-auto" style="height: 20rem">-->
<!--      <p v-for="message in f.roomDoc.chatMessages" :key="message.id" :class="getMessageClass(message.senderUid)">-->
<!--        <b>{{ message.senderName }}: </b>{{ message.text }}-->
<!--      </p>-->
<!--    </b-card>-->

<!--    <b-input-group>-->
<!--      <b-form-input v-model="chatUi.newMessageText" @keyup.enter="addChatMessage"/>-->
<!--      <b-input-group-append>-->
<!--        <b-button variant="primary" :disabled="!chatUi.newMessageText || chatUi.isLoading" type="text" @click="addChatMessage">{{ $t('general.sendMessage') }}</b-button>-->
<!--      </b-input-group-append>-->
<!--    </b-input-group>-->

    <h2 class="text-center mt-5">{{ $t('lobby.players') }}</h2>

    <b-card class="mb-3 overflow-auto" style="height: 20rem">
      <p v-for="player in f.roomDoc.players" :key="player.uid">
        <b>{{ player.name }}</b>
      </p>
    </b-card>


    <div class="d-flex justify-content-center">
    <!-- TODO remove this after styling looks good -->
    <b-button class="shadow" size="lg" @click="startGame()" variant="success">{{ $t('lobby.startGame') }}</b-button>
<!--    <b-button v-cloak v-if="f.roomDoc.players.length < 3 && f.roomDoc.hostUid === f.user.uid" class="shadow" size="lg" disabled variant="success">oooWe need at least 3 players to start game</b-button>-->
<!--    <b-button v-cloak v-else-if="f.roomDoc.players.length >= 3 && f.roomDoc.hostUid === f.user.uid" class="shadow" size="lg" @click="startGame()" variant="success">{{ $t('lobby.startGame') }}</b-button>-->
<!--    <p v-cloak v-else-if="f.roomDoc.players.length < 3">oooWe need at least 3 players to start game</p>-->
<!--    <p v-cloak v-else>oooWaiting for host to start game...</p>-->
    </div>

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
    'f',
  ],

  methods: {
    async addChatMessage() {
      const message = this.chatUi.newMessageText
      this.chatUi.newMessageText = ""
      this.chatUi.isLoading = true

      await addChatroomMessage(this.f.roomDocRef, message, this.f.user.displayName, this.f.user.uid)
      this.chatUi.isLoading = false
    },

    async startGame() {
      await startGame(this.f.roomDocRef, this.f.roomDoc.players)
    },

    getMessageClass(sender) { return sender === this.f.user.uid ? 'text-primary' : 'text-dark' },
  }
}
</script>
