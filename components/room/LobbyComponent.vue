<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>


<!--    <h4 class="mx-3 mt-3 mb-2">{{ $t('general.chatroom') }}</h4>-->
<!--    <b-card class="mb-3 overflow-auto" style="height: 20rem">-->
<!--      <p v-for="message in f.roomDoc.chatMessages" :key="message.id" :class="getMessageClass(message.senderUid)" style="font-family: 'Cera Round Pro Bold', sans-serif">-->
<!--        {{ message.senderName }}: {{ message.text }}-->
<!--      </p>-->
<!--    </b-card>-->

<!--    <b-input-group>-->
<!--      <b-form-input v-model="chatUi.newMessageText" @keyup.enter="addChatMessage"/>-->
<!--      <b-input-group-append>-->
<!--        <b-button variant="primary" :disabled="!chatUi.newMessageText || chatUi.isLoading" type="text" @click="addChatMessage">{{ $t('general.sendMessage') }}</b-button>-->
<!--      </b-input-group-append>-->
<!--    </b-input-group>-->

      <h2 class="text-center">{{ $t('lobby.players') }}</h2>

      <RoomPlayerComponent :f="f"/>

    <div class="my-1 d-flex justify-content-center">
      <b-button v-cloak v-if="f.roomDoc.players.length < 3 && f.roomDoc.hostUid === f.user.uid" class="shadow" size="lg" disabled variant="success">{{ $t('lobby.need3Players') }}</b-button>
      <b-button v-cloak v-else-if="f.roomDoc.players.length >= 3 && f.roomDoc.hostUid === f.user.uid" class="shadow" size="lg" @click="startGame()" variant="success">{{ $t('lobby.startGame') }}</b-button>
      <p v-cloak v-else-if="f.roomDoc.players.length < 3">{{ $t('lobby.need3Players') }}</p>
      <p v-cloak v-else>{{ $t('lobby.waitingForHost', [f.roomDoc.players.find(p => p.uid === f.roomDoc.hostUid).name]) }}</p>
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
