<template>


      <!-- If user is loading, don't show anything-->
      <div v-cloak v-if="user === 'loading'"></div>


      <!-- START IF USER ============================================================================================-->
      <!-- START IF USER ============================================================================================-->
      <div v-cloak v-else-if="user">
        <LobbyRoomLink :roomLink="roomLink"/>

        <h4 class="mx-3 mt-3 mb-2">{{ $t('general.chatroom') }}</h4>
        <b-card class="mb-3 overflow-auto" style="height: 20rem">
          <p v-for="message in dbMessages" :key="message.id" :class="getMessageClass(message.senderUid)">
            <b>{{ message.senderName }}: </b>{{ message.text }}
          </p>
        </b-card>

          <b-input-group>
            <b-form-input v-model="newMessageText" @keyup.enter="addMessage"/>
            <b-input-group-append>
              <b-button variant="primary" :disabled="!newMessageText || isLoading" type="text" @click="addMessage">{{ $t('general.sendMessage') }}</b-button>
            </b-input-group-append>
          </b-input-group>
      </div>
      <!-- END IF USER =============================================================================================-->
      <!-- END IF USER =============================================================================================-->


      <!-- START IF NOT USER ========================================================================================-->
      <!-- START IF NOT USER ========================================================================================-->
      <div v-cloak v-else>

        <LobbyRoomLink :roomLink="roomLink"/>

        <div class="text-center bg-transparent">
          <div class="mx-5">
            <b-form @submit.prevent="guestSignInAndEnterRoom">
              <b-form-group id="form-group-name lg" :label="$t('form.whatsYourName')" label-for="form-input-name">
                <b-form-input id="form-input-name" v-model="form.name" :placeholder="$t('form.whatsYourNameHint')" required />
                <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
              </b-form-group>

              <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">
                {{ $t('general.back') }}
              </b-button>

              <b-button v-if="form.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
              <b-button v-else class="shadow" size="lg" variant="success" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirmName') }}</b-button>
            </b-form>
          </div>
        </div>
      </div>
      <!-- END IF NOT USER =========================================================================================-->
      <!-- END IF NOT USER =========================================================================================-->


</template>

<script>
import { auth, db } from '@/db/firebase'
export default {

  async created () {
    this.unsubscribe = auth.onAuthStateChanged( firebaseUser => (this.user = firebaseUser) )
    // Get the actual firebase doc ID of the room
    const firebaseRoomQuerySnapshot = await db.collection('room').where('roomId', '==', this.roomId).limit(1).get()
    this.firebaseRoomDocId = firebaseRoomQuerySnapshot.docs[0].id

    const messagesRef = db.doc(`room/${this.firebaseRoomDocId}`).collection('chatMessage');
    messagesRef.orderBy('createdAt').onSnapshot({ includeMetadataChanges: true }, snapshot => {
      this.dbMessages = []
      snapshot.forEach(doc => { const messageData = doc.data(); this.dbMessages.push({
        id: doc.id,
        text: messageData.text,
        senderName: messageData.senderName,
        senderUid: messageData.senderUid,
      }); });
    })
  },

  data () {
    return {
      auth,
      form: { name: '', isLoading: false, errorMessage: '' },
      user: 'loading', // loading is the default value, since we don't know when firebase will return a user/null object
      unsubscribe: null,

      isLoading: false,
      newMessageText: '',
      dbMessages: [],

      firebaseRoomDocId: 'undefined_firebaseRoomDocId'
    }
  },

  computed: {
    isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 },
    roomId () { return this.$route.params.room.toUpperCase() },
    roomLink () { return 'thumbs.up.railway.app/' + this.roomId },
    messageDb() { return db.doc(`room/${this.firebaseRoomDocId}`).collection("chatMessage") },
  },

  methods: {
    async guestSignInAndEnterRoom () {
      try {
        this.form.isLoading = true
        this.form.errorMessage = null

        await auth.signInAnonymously()
        await auth.currentUser.updateProfile({ displayName: this.form.name })
        this.user.displayName = this.form.name  // The above line only updates the db, we have to manually update our in-memory displayName

      } catch (error) {
        this.form.errorMessage = error.message

      } finally {
        this.form.isLoading = false
      }
    },

    async addMessage() {
      const message = this.newMessageText
      this.newMessageText = ""

      this.isLoading = true
      const { id: messageId } = this.messageDb.doc()
      await this.messageDb.doc(messageId).set({
        text: message,
        senderName: this.user.displayName,
        senderUid: this.user.uid,
        createdAt: Date.now()
      })
      this.isLoading = false
    },

    getMessageClass(sender) { return sender === this.user.uid ? 'text-primary' : 'text-dark' },
    goBack () { this.$router.push('/') },
    head () { return { title: this.roomId } },
  }
}
</script>

<style>
#form-input-name {
  height: 2.5rem;
  font-size: 1.2rem;
}

.btn {
  margin: .2rem;
}

button[type="text"] {
  margin: 0;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
</style>
